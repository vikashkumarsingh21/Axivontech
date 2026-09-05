import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

// Simple in-memory rate limiting map for public lead intake (10 requests per 15 mins per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      throw new ApiError(429, "Too many lead submissions from this IP. Please try again later.");
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, companyName, website, serviceInterest, message, source, campaign } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ApiError(400, "Name is required.");
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new ApiError(400, "A valid email address is required.");
    }
    if (name.length > 150) throw new ApiError(400, "Name exceeds maximum length of 150 characters.");
    if (email.length > 150) throw new ApiError(400, "Email exceeds maximum length of 150 characters.");
    if (message && message.length > 2000) throw new ApiError(400, "Message exceeds maximum length of 2000 characters.");

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : null;

    // Check Duplicate Leads (past 30 days email or phone match)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existingLead = await db.lead.findFirst({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { email: { equals: normalizedEmail, mode: "insensitive" } },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    const isDuplicate = !!existingLead;
    const duplicateReason = isDuplicate
      ? `Possible duplicate of lead ${existingLead.leadCode} (created ${existingLead.createdAt.toISOString().split("T")[0]})`
      : null;

    // Generate unique Lead Code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Valid lead sources
    const validSources = ["WEBSITE_CONTACT", "CONSULTATION", "REFERRAL", "SOCIAL_MEDIA", "CAMPAIGN", "MANUAL", "PARTNER", "OTHER"];
    const leadSource = validSources.includes(source) ? source : "WEBSITE_CONTACT";

    // Create Lead + LeadActivity in transaction
    const [lead] = await db.$transaction([
      db.lead.create({
        data: {
          leadCode,
          name: name.trim(),
          email: normalizedEmail,
          phone: cleanPhone,
          companyName: companyName ? String(companyName).trim() : null,
          website: website ? String(website).trim() : null,
          serviceInterest: serviceInterest ? String(serviceInterest).trim() : null,
          message: message ? String(message).trim() : null,
          source: leadSource,
          campaign: campaign ? String(campaign).trim() : null,
          status: "NEW",
          qualificationStatus: "UNQUALIFIED",
          isDuplicate,
          duplicateReason,
        },
      }),
    ]);

    // Create Activity
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "LEAD_CREATED",
        title: `New lead received via ${leadSource}`,
        notes: isDuplicate ? `Flagged as duplicate: ${duplicateReason}` : "Created from public form intake.",
        metadata: { ip, source: leadSource, isDuplicate },
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
        data: recipientIds.map((userId) => ({
          userId,
          type: "SYSTEM",
          title: `New Lead: ${lead.name}`,
          message: `${lead.companyName ? `${lead.companyName} — ` : ""}${lead.serviceInterest || "General Inquiry"} (${lead.leadCode})`,
          link: `/admin/crm/leads/${lead.id}`,
        })),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your inquiry has been received. Our sales team will get in touch shortly.",
        leadCode: lead.leadCode,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
