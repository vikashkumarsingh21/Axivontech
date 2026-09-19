import { db } from "@/lib/db";
import { LeadData, generateConversationSummary, scoreLead } from "./knowledge-base";

export async function createChatbotLead(
  leadData: LeadData,
  conversationSummary: string,
  leadScore: string,
  conversationId: string
): Promise<{ success: boolean; leadCode?: string; error?: string }> {
  try {
    if (!leadData.name || !leadData.email) {
      return { success: false, error: "Name and email required" };
    }

    const normalizedEmail = leadData.email.trim().toLowerCase();

    // Generate lead code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.lead.count({
      where: { leadCode: { startsWith: `LD-${todayStr}` } },
    });
    const leadCode = `LD-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    // Duplicate detection (last 30 days)
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
      ? `Possible duplicate of ${existingLead!.leadCode}`
      : null;

    // Compose message content
    const messageParts = [
      leadData.requirementSummary,
      conversationSummary,
    ].filter(Boolean);
    const messageContent = messageParts.join(" | ") || null;

    const lead = await db.lead.create({
      data: {
        leadCode,
        name: leadData.name.trim(),
        email: normalizedEmail,
        phone: leadData.phone?.trim() || null,
        companyName: leadData.company?.trim() || null,
        serviceInterest: leadData.serviceInterest || leadData.projectType || null,
        message: messageContent,
        source: "WEBSITE_CHATBOT",
        campaign: `chatbot-${conversationId.slice(0, 8)}`,
        status: "NEW",
        qualificationStatus: "UNQUALIFIED",
        timeline: leadData.timeline || null,
        businessNeed: conversationSummary || null,
        isDuplicate,
        duplicateReason,
      },
    });

    // Create initial CRM activity
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "LEAD_CREATED",
        title: "Lead captured via Axivon AI Chatbot",
        notes: `Lead Score: ${leadScore}. ${conversationSummary}`,
        metadata: {
          source: "WEBSITE_CHATBOT",
          conversationId,
          leadScore,
          projectType: leadData.projectType,
          budget: leadData.budget,
          timeline: leadData.timeline,
          industry: leadData.industry,
          features: leadData.features,
        },
      },
    });

    // Notify Founders/Admins/Co-Founders
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
          title: `🤖 New Chatbot Lead: ${lead.name}`,
          message: `Score: ${leadScore} | ${leadData.projectType || "General Inquiry"} | ${
            leadData.industry ? `Industry: ${leadData.industry}` : ""
          } | ${leadData.budget ? `Budget: ${leadData.budget}` : ""} (${lead.leadCode})`,
          link: `/admin/crm/leads/${lead.id}`,
        })),
      });
    }

    // Try email notification
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
      console.error("[Chatbot CRM] Email notification failed:", emailErr);
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "SYSTEM_ERROR",
          title: "Email Notification Failed",
          notes: "Chatbot lead email notification could not be sent.",
          metadata: { error: String(emailErr) },
        },
      });
    }

    return { success: true, leadCode: lead.leadCode };
  } catch (err) {
    console.error("[Chatbot CRM] Failed to create lead:", err);
    return { success: false, error: String(err) };
  }
}
