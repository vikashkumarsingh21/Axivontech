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
        } else if (templateKey === "EMAIL_CHANGE_VERIFICATION") {
          subject = variables.title || "Verify your new email address — Axivon Technologies";
          body = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff; color: #111827;">
              <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="margin: 0; color: #111827; font-size: 22px; font-weight: 700;">Axivon Technologies</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Secure Identity &amp; Account Protection</p>
              </div>
              <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Verify Your New Email Address</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
                Hello <strong>${variables.name || "there"}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
                We received a request to update the primary email address for your Axivon Technologies account (${variables.role || "Executive/Admin"}). To complete this change and verify ownership of this email address, please click the verification button below:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${variables.link}" style="background: #10b981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">Confirm Email Address &rarr;</a>
              </div>
              <div style="background: #f9fafb; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #4b5563; line-height: 1.5;">
                <strong>Security Information:</strong><br />
                • This verification link will expire in <strong>60 minutes</strong>.<br />
                • This link can only be used once.<br />
                • If you did not initiate this request, your account may be compromised. Please contact support immediately.
              </div>
              <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; word-break: break-all;">
                If the button above does not work, copy and paste this URL into your browser:<br />
                <a href="${variables.link}" style="color: #10b981;">${variables.link}</a>
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
                &copy; ${new Date().getFullYear()} Axivon Technologies. Automated Security System.
              </p>
            </div>
          `;
        } else if (templateKey === "EMAIL_CHANGE_SECURITY_ALERT") {
          subject = variables.title || "Security Alert: Account email address has been changed — Axivon Technologies";
          body = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #fee2e2; border-radius: 16px; background: #ffffff; color: #111827;">
              <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="margin: 0; color: #111827; font-size: 22px; font-weight: 700;">Axivon Technologies</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #ef4444; font-weight: 600;">Critical Security Notification</p>
              </div>
              <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Your Account Email Address Was Changed</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
                Hello <strong>${variables.name || "User"}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
                The primary email address associated with your Axivon Technologies account was successfully changed to:
              </p>
              <div style="background: #f3f4f6; padding: 14px 18px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: bold; color: #111827; margin-bottom: 24px;">
                ${variables.newEmail}
              </div>
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; color: #991b1b; line-height: 1.6;">
                <strong>Did you not make this change?</strong><br />
                If you did not authorize this change, someone else may have gained unauthorized access to your account. Please contact the security team immediately at <a href="mailto:security@axivontech.in" style="color: #b91c1c; font-weight: bold;">security@axivontech.in</a> or call your administrative liaison.
              </div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
                &copy; ${new Date().getFullYear()} Axivon Technologies. All rights reserved.
              </p>
            </div>
          `;
        } else if (templateKey === "EMAIL_CHANGE_CONFIRMED") {
          subject = variables.title || "Your email address has been updated — Axivon Technologies";
          body = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff; color: #111827;">
              <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="margin: 0; color: #111827; font-size: 22px; font-weight: 700;">Axivon Technologies</h1>
                <p style="margin: 4px 0 0; font-size: 13px; color: #10b981; font-weight: 600;">Verification Successful</p>
              </div>
              <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Email Address Verified Successfully</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
                Hello <strong>${variables.name || "User"}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
                Your new email address (<strong>${variables.newEmail}</strong>) has been verified and is now the primary login and contact email for your account.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${variables.link || "https://axivontech.in/login"}" style="background: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Go to Login &rarr;</a>
              </div>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
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
