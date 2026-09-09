import { db } from "@/lib/db";

export interface SendEmailOptions {
  to: string;
  templateKey: string;
  variables?: Record<string, any>;
  metadata?: any;
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
        if (variables.title) subject = String(variables.title);
        if (variables.message) body = String(variables.message);
      }
    }

    // Attempt delivery with retry-on-failure
    let status = "SENT";
    let errorMsg: string | undefined;

    try {
      await deliverEmail(to, subject, body);
    } catch (err: any) {
      console.error("[EmailService] Delivery failed:", err.message);
      status = "FAILED";
      errorMsg = err.message;
    }

    const log = await db.emailLog.create({
      data: {
        toEmail: to,
        templateKey,
        subject,
        status,
        metadata: errorMsg ? { ...metadata, error: errorMsg } : metadata || variables,
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
