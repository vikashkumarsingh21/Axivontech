import { db } from "@/lib/db";

export interface SendEmailOptions {
  to: string;
  templateKey: string;
  variables?: Record<string, any>;
  metadata?: unknown;
}

// -----------------------------------------------------------------------
// Email provider abstraction — Resend API > Custom Webhook / SMTP (if available) > Console fallback
// -----------------------------------------------------------------------

async function deliverEmail(to: string, subject: string, html: string): Promise<void> {
  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Axivon Technologies <notifications@axivon.dev>",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Resend API error: ${response.status} ${err}`);
    }
    return;
  }

  // 2. Custom Email Webhook Endpoint
  if (process.env.EMAIL_WEBHOOK_URL) {
    const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.EMAIL_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.EMAIL_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Email Webhook error: ${response.status} ${err}`);
    }
    return;
  }

  // 3. Console fallback (development / test)
  console.log(`[EmailService] [DISPATCH] To: ${to} | Subject: ${subject}`);
  console.log(`[EmailService] [PREVIEW] ${html.slice(0, 150)}...`);
}

export class EmailService {
  static async send(options: SendEmailOptions) {
    const { to, templateKey, variables = {}, metadata } = options;

    let subject = "Axivon Notification";
    let body = "You have a new notification from Axivon Technologies.";

    // Try CommunicationTemplate first (Phase 6 unified model)
    const commTemplate = await db.communicationTemplate.findFirst({
      where: { key: templateKey, isActive: true, category: "EMAIL" },
    });

    if (commTemplate) {
      subject = commTemplate.subject || subject;
      body = commTemplate.content;
      for (const [key, val] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        subject = subject.replace(regex, String(val));
        body = body.replace(regex, String(val));
      }
    } else {
      // Fallback to legacy EmailTemplate
      const template = await db.emailTemplate.findUnique({
        where: { key: templateKey },
      });

      if (template && template.isActive) {
        subject = template.subject;
        body = template.htmlBody;
        for (const [key, val] of Object.entries(variables)) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
          subject = subject.replace(regex, String(val));
          body = body.replace(regex, String(val));
        }
      } else {
        if (templateKey === "NEW_WEBSITE_LEAD") {
          subject = variables.title || `[New Lead] ${variables.name || "Client"} - ${variables.service || "Inquiry"} (${variables.leadCode || ""})`;
          body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
              <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #111827; font-size: 20px;">New Inbound Project Lead Received</h2>
                <span style="font-size: 13px; color: #6b7280; font-family: monospace;">Reference ID: ${variables.leadCode || "N/A"}</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Client Name:</strong></td><td>${variables.name || "N/A"}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Email Address:</strong></td><td><a href="mailto:${variables.email}">${variables.email || "N/A"}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Phone Number:</strong></td><td>${variables.phone || "N/A"}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Company / Brand:</strong></td><td>${variables.company || "Independent"}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Required Service:</strong></td><td><strong>${variables.service || "General Inquiry"}</strong></td></tr>
                ${variables.budget ? `<tr><td style="padding: 8px 0; color: #6b7280;"><strong>Budget:</strong></td><td>${variables.budget}</td></tr>` : ""}
                ${variables.timeline ? `<tr><td style="padding: 8px 0; color: #6b7280;"><strong>Timeline:</strong></td><td>${variables.timeline}</td></tr>` : ""}
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Source:</strong></td><td>${variables.source || "WEBSITE_CONTACT"}</td></tr>
              </table>
              <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 14px; margin-bottom: 24px; border-radius: 4px;">
                <strong style="display: block; margin-bottom: 6px; font-size: 13px; color: #374151;">Project Brief &amp; Requirements:</strong>
                <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #1f2937;">${variables.message || "No description provided."}</p>
              </div>
              ${variables.link ? `
              <div style="text-align: center; margin-top: 24px;">
                <a href="${variables.link}" style="background: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Lead in AXIVON ONE CRM &rarr;</a>
              </div>` : ""}
            </div>
          `;
        } else if (templateKey === "LEAD_ACKNOWLEDGEMENT") {
          subject = variables.title || `Thank you for contacting Axivon Technologies [${variables.leadCode || ""}]`;
          body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
              <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #111827; font-size: 20px;">Thank You for Reaching Out</h2>
                <span style="font-size: 13px; color: #6b7280; font-family: monospace;">Reference Code: ${variables.leadCode || "N/A"}</span>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #374151;">
                Hello <strong>${variables.name || "there"}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #374151;">
                We have received your project inquiry for <strong>${variables.service || "our services"}</strong>. Our senior solutions architecture team is reviewing your requirements and will reach out to you within 24 hours.
              </p>
              <div style="background: #f9fafb; padding: 14px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #4b5563;">
                <strong>Direct Contact Channels:</strong><br />
                Email: <a href="mailto:contact@axivontech.in">contact@axivontech.in</a><br />
                WhatsApp: <a href="https://wa.me/919157226367">+91 91572 26367</a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
                &copy; ${new Date().getFullYear()} Axivon Technologies. All rights reserved.
              </p>
            </div>
          `;
        } else {
          if (variables.title) subject = String(variables.title);
          if (variables.message) body = String(variables.message);
        }
      }
    }

    // Attempt delivery with retry-on-failure
    let status = "SENT";
    let errorMsg: string | undefined;

    try {
      await deliverEmail(to, subject, body);
    } catch (err: unknown) {
      console.error("[EmailService] Delivery failed:", (err as Error).message);
      status = "FAILED";
      errorMsg = (err as Error).message;
    }

    const log = await db.emailLog.create({
      data: {
        toEmail: to,
        templateKey,
        subject,
        status,
        metadata: errorMsg ? { ...(metadata as object), error: errorMsg } : metadata || variables,
      },
    });

    // Schedule retry job if delivery failed
    if (status === "FAILED") {
      try {
        const { JobRunner } = await import("@/lib/jobs/runner");
        await JobRunner.enqueue(
          "EMAIL_RETRY",
          { to, templateKey, variables, metadata, logId: log.id },
          new Date(Date.now() + 5 * 60_000) // retry in 5 minutes
        );
      } catch (_) {
        // Non-critical
      }
    }

    return log;
  }
}
