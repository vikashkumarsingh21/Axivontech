import { db } from "@/lib/db";
import { LeadData } from "./knowledge-base";

/**
 * Safely parse a conversational budget string into a Float value
 */
export function parseNumericBudget(budgetString?: string): number | null {
  if (!budgetString) return null;
  const clean = budgetString.replace(/,/g, "").trim().toLowerCase();

  // Match numbers with units (k, lakh, cr, with optional plurals)
  const lakhMatch = clean.match(/([\d.]+)\s*(?:lakhs?|lacs?|l)\b/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    return isNaN(val) ? null : val * 100000;
  }

  const croreMatch = clean.match(/([\d.]+)\s*(?:crores?|crs?)\b/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    return isNaN(val) ? null : val * 10000000;
  }

  const kMatch = clean.match(/([\d.]+)\s*(?:k|thousands?)\b/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    return isNaN(val) ? null : val * 1000;
  }

  // Pure numeric value (with optional currency symbol)
  const numMatch = clean.match(/(?:₹|rs\.?|inr|\$)?\s*([\d.]+)/i);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return isNaN(val) ? null : val;
  }

  return null;
}

export async function createChatbotLead(
  leadData: LeadData,
  conversationSummary: string,
  leadScore: string,
  conversationId: string
): Promise<{ success: boolean; leadCode?: string; error?: string }> {
  try {
    if (!leadData.name || !leadData.email) {
      return { success: false, error: "Name and email are required to create a project inquiry." };
    }

    const normalizedEmail = leadData.email.trim().toLowerCase();
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Duplicate detection in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const existingLead = await db.lead.findFirst({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
    });
    const isDuplicate = !!existingLead;
    const duplicateReason = isDuplicate
      ? `Duplicate inquiry within 30 days. Existing lead: ${existingLead!.leadCode}`
      : null;

    // Parse numeric budget safely
    const parsedBudget = parseNumericBudget(leadData.budget);

    // Build comprehensive message content
    const messageParts = [
      leadData.requirementSummary,
      leadData.budget ? `Stated Budget: ${leadData.budget}` : null,
      leadData.timeline ? `Target Timeline: ${leadData.timeline}` : null,
      leadData.platform ? `Target Platform: ${leadData.platform}` : null,
      conversationSummary,
    ].filter(Boolean);
    const messageContent = messageParts.join(" | ") || null;

    // Strict schema compliance with Lead model
    const lead = await db.lead.create({
      data: {
        leadCode,
        name: leadData.name.trim().slice(0, 100),
        email: normalizedEmail.slice(0, 100),
        phone: leadData.phone?.trim().slice(0, 30) || null,
        companyName: leadData.company?.trim().slice(0, 100) || null,
        serviceInterest: (leadData.serviceInterest || leadData.projectType || "General Inquiry").slice(0, 100),
        message: messageContent,
        source: "WEBSITE_CHATBOT",
        campaign: `chatbot-${conversationId.slice(0, 8)}`,
        status: "NEW", // default unprivileged
        qualificationStatus: "UNQUALIFIED", // default unprivileged
        budget: parsedBudget,
        timeline: leadData.timeline?.trim().slice(0, 50) || null,
        businessNeed: conversationSummary.slice(0, 500) || null,
        isDuplicate,
        duplicateReason,
      },
    });

    // Create initial CRM LeadActivity log
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "LEAD_CREATED",
        title: "Inquiry captured via Axivon AI Assistant",
        notes: `Lead Score: ${leadScore}. ${conversationSummary}`,
        metadata: {
          source: "WEBSITE_CHATBOT",
          conversationId,
          leadScore,
          projectType: leadData.projectType,
          budgetStated: leadData.budget,
          budgetParsed: parsedBudget,
          timeline: leadData.timeline,
          industry: leadData.industry,
        },
      },
    });

    // Notify Administrators in-app
    try {
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
            title: `New Chatbot Lead: ${lead.name}`,
            message: `Score: ${leadScore} | ${lead.serviceInterest} | Lead Code: ${lead.leadCode}`,
            link: `/admin/crm/leads/${lead.id}`,
          })),
        });
      }
    } catch (notifErr) {
      console.error("[Chatbot CRM] Notification dispatch skipped:", notifErr);
    }

    // Attempt email notification in non-test environments
    if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
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
            message: messageContent || "N/A",
            source: "WEBSITE_CHATBOT",
            leadCode: lead.leadCode,
            link: `${process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in"}/admin/crm/leads/${lead.id}`,
          },
        });
      } catch (emailErr) {
        console.error("[Chatbot CRM] Email delivery failed:", emailErr);
      }
    }

    return { success: true, leadCode: lead.leadCode };
  } catch (err) {
    console.error("[Chatbot CRM] Lead creation failed:", err);
    return { success: false, error: (err as Error).message };
  }
}
