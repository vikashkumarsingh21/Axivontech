import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { verifyFormProtection } from "@/lib/captcha";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Server-side dual protection: Privacy Policy acknowledgement + Google reCAPTCHA v2 / Turnstile
    const protection = await verifyFormProtection(req, body, {
      action: ["lead_inbound", "contact_form", "contact_inquiry", "chatbot_lead", "referral_lead"],
      rateLimitPreset: RATE_LIMIT_PRESETS.PUBLIC_LEADS,
      requirePolicyAcknowledgement: true,
      policySlug: "privacy-policy",
    });
    if (!protection.success && protection.errorResponse) {
      return protection.errorResponse;
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rawName = body.name || body.fullName || body.contactName;
    const rawEmail = body.email;
    const rawPhone = body.phone || body.mobile;
    const rawCompany = body.companyName || body.company;
    const rawService = body.serviceInterest || body.service || body.subject;
    const demoProject = body.demoProject || body.demo || body.project || null;
    const landingPage = body.landingPage || body.sourcePage || null;
    const referrer = body.referrer || null;
    const utmSource = body.utm_source || body.utmSource || null;
    const utmMedium = body.utm_medium || body.utmMedium || null;
    const utmCampaign = body.utm_campaign || body.utmCampaign || null;
    const rawWebsite = body.website || body.websiteUrl || null;

    const { 
      whatsapp, designation, 
      industry, city, state, country, companySize, 
      message, budget, timeline, contactMethod, notes,
      source, campaign, referralCode 
    } = body;

    // Honeypot spam defense: automated bots filling hidden trap fields receive 200 without database insertion
    if (body.honeypot || body._gotcha || body.website_trap) {
      return NextResponse.json({ success: true, leadCode: "LD-SPAM-PREVENTED" }, { status: 200 });
    }

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
    const cleanWebsite = rawWebsite && typeof rawWebsite === "string" ? rawWebsite.trim() : null;
    const cleanIndustry = industry && typeof industry === "string" ? industry.trim() : null;
    const cleanDemoProject = demoProject && typeof demoProject === "string" ? demoProject.trim() : null;

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

    const resolvedCampaign = campaign ? String(campaign).trim() : (utmCampaign ? `${utmSource || "campaign"}:${utmCampaign}` : (cleanDemoProject ? `demo:${cleanDemoProject}` : null));
    const resolvedNotes = notes ? String(notes).trim() : (cleanDemoProject ? `Related Demo: ${cleanDemoProject}${landingPage ? ` | Inbound Page: ${landingPage}` : ""}` : (landingPage ? `Inbound Page: ${landingPage}` : null));
    const resolvedBusinessNeed = body.businessNeed ? String(body.businessNeed).trim() : (cleanDemoProject ? `Inquiry for custom build based on ${cleanDemoProject} demo` : null);

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
          industry: cleanIndustry,
          city: city ? String(city).trim() : null,
          state: state ? String(state).trim() : null,
          country: country ? String(country).trim() : null,
          companySize: companySize ? String(companySize).trim() : null,
          website: cleanWebsite,
          serviceInterest: cleanService,
          message: message ? String(message).trim() : null,
          businessNeed: resolvedBusinessNeed,
          budget: parsedBudget,
          timeline: timeline ? String(timeline).trim() : null,
          qualificationNotes: resolvedNotes,
          source: leadSource,
          campaign: resolvedCampaign,
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
        title: cleanDemoProject ? `New inquiry for demo ${cleanDemoProject} via ${leadSource}` : `New lead received via ${leadSource}`,
        notes: isDuplicate ? `Flagged as duplicate: ${duplicateReason}` : (cleanDemoProject ? `Created from demo inquiry for ${cleanDemoProject}.` : "Created from public form intake."),
        metadata: {
          ip,
          source: leadSource,
          isDuplicate,
          demoProject: cleanDemoProject,
          industry: cleanIndustry,
          landingPage,
          referrer,
          utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign },
        },
      },
    });

    // Synchronize to Google Sheets / Excel external integration (resilient: failure does not block lead creation)
    const googleSheetWebhook = process.env.GOOGLE_SHEETS_LEAD_WEBHOOK_URL?.trim();
    if (googleSheetWebhook && googleSheetWebhook.startsWith("https://")) {
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
          title: cleanDemoProject ? `New Demo Lead: ${lead.name}` : `New Lead: ${lead.name}`,
          message: `${lead.companyName ? `${lead.companyName} — ` : ""}${cleanDemoProject ? `[Demo: ${cleanDemoProject}] ` : ""}${lead.serviceInterest || "General Inquiry"} (${lead.leadCode})`,
          link: `/admin/crm/leads/${lead.id}`,
        })),
      });
    }

    // Real-time Notification for referring Partner/Broker
    if (finalOwnerId) {
      await db.notification.create({
        data: {
          userId: finalOwnerId,
          type: "SYSTEM",
          title: `New Referral Lead: ${lead.name}`,
          message: `A client submitted an inquiry using your referral link (${lead.leadCode}): ${lead.serviceInterest || "General Inquiry"}.`,
          link: `/broker/leads`,
        },
      }).catch((err) => console.error("[Notification] Failed to notify partner of new lead:", err));
    }

    // Emit platform event to trigger automations & activity logging
    try {
      const { EventBus } = await import("@/lib/events/bus");
      await EventBus.emit({
        eventType: "NEW_LEAD",
        recipientId: recipientIds[0] || null,
        entityType: "LEAD",
        entityId: lead.id,
        title: cleanDemoProject ? `New Demo Lead: ${lead.name}` : `New Lead: ${lead.name}`,
        message: `${lead.companyName ? `${lead.companyName} — ` : ""}${lead.serviceInterest || "General Inquiry"} (${lead.leadCode})`,
        metadata: {
          leadCode: lead.leadCode,
          source: lead.source,
          demoProject: cleanDemoProject,
        },
      });
    } catch (eventBusErr) {
      console.error("[EventBus] Lead event emission failed:", eventBusErr);
    }

    // Try to send email
    try {
      const { EmailService } = await import("@/lib/email/service");
      await EmailService.send({
        to: process.env.COMPANY_CONTACT_EMAIL || "info@axivontech.in",
        templateKey: "NEW_WEBSITE_LEAD",
        variables: {
          title: `New Project Lead: ${lead.name} (${lead.leadCode})`,
          name: lead.name,
          email: lead.email,
          phone: lead.phone || "N/A",
          company: lead.companyName || "N/A",
          service: lead.serviceInterest || "N/A",
          message: lead.message || "N/A",
          budget: parsedBudget ? `₹${parsedBudget.toLocaleString()}` : "Not specified",
          timeline: lead.timeline || "Flexible",
          source: lead.source,
          leadCode: lead.leadCode,
          link: `${process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in"}/admin/crm/leads/${lead.id}`,
        }
      });

      // Send automated client receipt acknowledgement
      if (lead.email) {
        await EmailService.send({
          to: lead.email,
          templateKey: "LEAD_ACKNOWLEDGEMENT",
          variables: {
            title: `Thank you for contacting Axivon Technologies [${lead.leadCode}]`,
            name: lead.name,
            leadCode: lead.leadCode,
            service: lead.serviceInterest || "Custom Software Development",
          }
        }).catch((ackErr) => {
          console.warn("[EmailService] Client receipt acknowledgement dispatch skipped/failed:", ackErr);
        });
      }
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
