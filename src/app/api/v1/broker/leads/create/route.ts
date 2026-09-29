import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { z } from "zod";

const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  email: z.string().email("Valid email is required").max(150),
  phone: z.string().min(1, "Phone is required").max(30),
  whatsapp: z.string().max(30).optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  companySize: z.string().max(50).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  serviceInterest: z.string().min(1, "Interested service is required").max(200),
  message: z.string().min(1, "Requirement description is required").max(2000),
  budget: z.union([z.string(), z.number()]).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate: Partner only
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "BROKER") {
      throw new ApiError(403, "Access denied. Partners only.");
    }

    // Resolve BrokerProfile — server-side attribution
    const brokerProfile = await db.brokerProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, referralCode: true },
    });
    if (!brokerProfile) {
      throw new ApiError(404, "Partner profile not found.");
    }

    // Parse and validate body
    const body = await req.json().catch(() => ({}));
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      throw new ApiError(400, firstError.message);
    }

    const data = parsed.data;
    const normalizedEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    // Duplicate detection (past 30 days, email or phone match)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existingLead = await db.lead.findFirst({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { email: { equals: normalizedEmail, mode: "insensitive" } },
          { phone: cleanPhone },
        ],
      },
      select: {
        id: true,
        leadCode: true,
        ownerId: true,
        createdAt: true,
      },
    });

    const isDuplicate = !!existingLead;
    let duplicateReason: string | null = null;

    if (isDuplicate) {
      // Preserve original attribution — do NOT steal the lead
      if (existingLead.ownerId && existingLead.ownerId !== userId) {
        // Another partner already owns this lead — safe, minimal response
        duplicateReason = `Duplicate of existing lead (submitted ${existingLead.createdAt.toISOString().split("T")[0]}). Original attribution preserved.`;

        // Create the duplicate record but keep original owner
        // DO NOT leak the original owner's identity to this partner
      } else {
        duplicateReason = `Possible duplicate of lead ${existingLead.leadCode} (created ${existingLead.createdAt.toISOString().split("T")[0]})`;
      }
    }

    // If duplicate belongs to ANOTHER partner, still create the lead but flag it
    // Original attribution remains protected — the new lead is marked duplicate
    const finalOwnerId = isDuplicate && existingLead.ownerId && existingLead.ownerId !== userId
      ? existingLead.ownerId  // Preserve original attribution
      : userId;               // This partner owns it

    // Generate unique Lead Code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Parse budget
    let parsedBudget: number | null = null;
    if (data.budget) {
      if (typeof data.budget === "string") {
        const bStr = data.budget.replace(/[^0-9]/g, "");
        if (bStr) parsedBudget = parseInt(bStr, 10);
      } else {
        parsedBudget = data.budget;
      }
    }

    // Create Lead + Activity in transaction
    const [lead] = await db.$transaction([
      db.lead.create({
        data: {
          leadCode,
          name: data.name.trim(),
          email: normalizedEmail,
          phone: cleanPhone,
          whatsapp: data.whatsapp?.trim() || null,
          designation: data.designation?.trim() || null,
          companyName: data.companyName?.trim() || null,
          industry: data.industry?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          country: data.country?.trim() || null,
          companySize: data.companySize?.trim() || null,
          website: data.website?.trim() || null,
          serviceInterest: data.serviceInterest.trim(),
          message: data.message.trim(),
          budget: parsedBudget,
          timeline: data.timeline?.trim() || null,
          source: "PARTNER",
          status: "NEW",
          qualificationStatus: "UNQUALIFIED",
          isDuplicate,
          duplicateReason,
          ownerId: finalOwnerId,
        },
      }),
    ]);

    // Create Activity
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        actorId: userId,
        type: "LEAD_CREATED",
        title: `New general lead submitted by partner`,
        notes: isDuplicate
          ? `Flagged as duplicate. ${duplicateReason}`
          : "Created from Partner Dashboard.",
        metadata: { source: "PARTNER", isDuplicate, submittedByPartner: userId },
      },
    });

    // Notify Admins & Founders
    const adminRoles = await db.userRole.findMany({
      where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } },
      select: { userId: true },
    });
    const recipientIds = Array.from(new Set(adminRoles.map((ur) => ur.userId)));

    if (recipientIds.length > 0) {
      await db.notification.createMany({
        data: recipientIds.map((uid) => ({
          userId: uid,
          type: "SYSTEM",
          title: `New Partner Lead: ${lead.name}`,
          message: `${lead.companyName ? `${lead.companyName} — ` : ""}${lead.serviceInterest || "General Inquiry"} (${lead.leadCode})`,
          link: `/admin/crm/leads/${lead.id}`,
        })),
      });
    }

    // Safe response — never expose duplicate owner details
    const response: Record<string, unknown> = {
      success: true,
      message: "Lead submitted successfully.",
      leadCode: lead.leadCode,
      leadId: lead.id,
    };

    if (isDuplicate && existingLead.ownerId && existingLead.ownerId !== userId) {
      response.warning = "A similar lead already exists in the system. The original attribution has been preserved.";
    } else if (isDuplicate) {
      response.warning = "A similar lead was detected. Your lead has been recorded and flagged for review.";
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
