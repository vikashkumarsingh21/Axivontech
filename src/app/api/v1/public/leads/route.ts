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
    const rawName = body.name || body.fullName || body.contactName;
    const rawEmail = body.email;
    const rawPhone = body.phone || body.mobile;
    const rawCompany = body.companyName || body.company;
    const rawService = body.serviceInterest || body.service || body.subject;
    const { 
      whatsapp, designation, 
      industry, city, state, country, companySize, website, 
      message, budget, timeline, contactMethod, notes,
      source, campaign, referralCode 
    } = body;

    // Server-side validation
    if (!rawName || typeof rawName !== "string" || rawName.trim().length === 0) {
      throw new ApiError(400, "Name is required.");
    }
    if (!rawEmail || typeof rawEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail.trim())) {
      throw new ApiError(400, "A valid email address is required.");
    }
    if (rawName.length > 150) throw new ApiError(400, "Name exceeds maximum length of 150 characters.");
    if (rawEmail.length > 150) throw new ApiError(400, "Email exceeds maximum length of 150 characters.");
    if (message && message.length > 3000) throw new ApiError(400, "Message exceeds maximum length of 3000 characters.");

    const normalizedName = rawName.trim();
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const cleanPhone = rawPhone ? String(rawPhone).trim() : null;
    const cleanCompany = rawCompany && typeof rawCompany === "string" ? rawCompany.trim() : null;
    const cleanService = rawService && typeof rawService === "string" ? rawService.trim() : null;

    // Process Referral Code
    let ownerId: string | null = null;
    if (referralCode && typeof referralCode === "string" && referralCode.trim() !== "") {
      const brokerProfile = await db.brokerProfile.findUnique({
        where: { referralCode: referralCode.trim() },
        select: { userId: true },
      });
      if (!brokerProfile) {
        throw new ApiError(400, "Invalid referral code. Please check the link and try again.");
      }
      ownerId = brokerProfile.userId;
    }

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
    let finalOwnerId = ownerId;
    let duplicateReason = null;

    if (isDuplicate) {
      if (existingLead.ownerId && ownerId && existingLead.ownerId !== ownerId) {
        duplicateReason = `Possible duplicate of lead ${existingLead.leadCode}. Submitted by broker ${ownerId} but reassigned to original owner ${existingLead.ownerId}.`;
        finalOwnerId = existingLead.ownerId; // Preserve original attribution
      } else {
        duplicateReason = `Possible duplicate of lead ${existingLead.leadCode} (created ${existingLead.createdAt.toISOString().split("T")[0]})`;
      }
    }

    // Generate unique Lead Code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Valid lead sources
    const validSources = ["WEBSITE_CONTACT", "CONSULTATION", "WEBSITE_CHATBOT", "REFERRAL", "SOCIAL_MEDIA", "CAMPAIGN", "MANUAL", "PARTNER", "OTHER"];
    let leadSource = validSources.includes(source) ? source : "WEBSITE_CONTACT";
    if (ownerId) {
      leadSource = "PARTNER"; // Force source to partner if coming through broker
    }

    // Handle budget logic for the Float field (if passed as string)
    let parsedBudget: number | null = null;
    if (budget && typeof budget === "string") {
      const bStr = budget.replace(/[^0-9]/g, "");
      if (bStr) parsedBudget = parseInt(bStr, 10);
    } else if (typeof budget === "number") {
      parsedBudget = budget;
    }

    // Create Lead + LeadActivity in transaction
    const [lead] = await db.$transaction([
      db.lead.create({
        data: {
          leadCode,
          name: normalizedName,
          email: normalizedEmail,
          phone: cleanPhone,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          designation: designation ? String(designation).trim() : null,
          companyName: cleanCompany,
          industry: industry ? String(industry).trim() : null,
          city: city ? String(city).trim() : null,
          state: state ? String(state).trim() : null,
          country: country ? String(country).trim() : null,
          companySize: companySize ? String(companySize).trim() : null,
          website: website ? String(website).trim() : null,
          serviceInterest: cleanService,
          message: message ? String(message).trim() : null,
          budget: parsedBudget,
          timeline: timeline ? String(timeline).trim() : null,
          qualificationNotes: notes ? String(notes).trim() : null,
          source: leadSource,
          campaign: campaign ? String(campaign).trim() : null,
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
        type: "LEAD_CREATED",
        title: `New lead received via ${leadSource}`,
        notes: isDuplicate ? `Flagged as duplicate: ${duplicateReason}` : "Created from public form intake.",
        metadata: { ip, source: leadSource, isDuplicate },
      },
    });

    // Synchronize to Google Sheets / Excel external integration (resilient: failure does not block lead creation)
    const googleSheetWebhook = process.env.GOOGLE_SHEETS_LEAD_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbwXF63WF4xQAMDJbv2yLiJSXamBxC47Ndu3M921vKteL3WsHYPnaEih-otyWSf6Xdg6/exec";
    if (googleSheetWebhook) {
      fetch(googleSheetWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone || "",
          company: lead.companyName || "",
          service: lead.serviceInterest || "",
          subject: lead.serviceInterest || "Website Contact",
          message: lead.message || "",
          source: lead.source,
          leadCode: lead.leadCode,
          createdAt: lead.createdAt.toISOString(),
        }),
      }).catch(async (syncErr) => {
        console.error("[Google Sheet Sync Error]", syncErr);
        await db.leadActivity.create({
          data: {
            leadId: lead.id,
            type: "INTEGRATION_ERROR",
            title: "Spreadsheet Sync Failed",
            notes: "Failed to dispatch lead row to external Google Sheet.",
            metadata: { error: String(syncErr) },
          },
        }).catch(() => {});
      });
    }

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

    // Try to send email
    try {
      const { EmailService } = await import("@/lib/email/service");
      await EmailService.send({
        to: process.env.COMPANY_CONTACT_EMAIL || "info@axivontech.in",
        templateKey: "NEW_WEBSITE_LEAD",
        variables: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone || "N/A",
          company: lead.companyName || "N/A",
          service: lead.serviceInterest || "N/A",
          message: lead.message || "N/A",
          source: lead.source,
          leadCode: lead.leadCode,
          link: `${process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in"}/admin/crm/leads/${lead.id}`,
        }
      });
    } catch (emailError) {
      console.error("[Email Error] Failed to send new lead email:", emailError);
      // Lead is still safely stored in CRM. Log the failure activity.
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "SYSTEM_ERROR",
          title: "Email Notification Failed",
          notes: "Failed to send the new lead notification email to the company address.",
          metadata: { error: String(emailError) },
        },
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
