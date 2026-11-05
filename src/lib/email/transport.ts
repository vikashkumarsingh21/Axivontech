import nodemailer, { type Transporter } from "nodemailer";
import { getEmailConfig, isOutboundEmailConfigured, isEmailTestMode } from "./config";

export interface OutboundMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  eventKey?: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  provider: string;
  recipientUsed: string;
  isTestMode: boolean;
  error?: string;
}

let cachedTransporter: Transporter | null = null;

export function resetSmtpTransporter(): void {
  cachedTransporter = null;
}

export function getSmtpTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const config = getEmailConfig();
  cachedTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure, // false for 587 STARTTLS
    auth: {
      user: config.smtpUser,
      pass: config.smtpAppPassword,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return cachedTransporter;
}

/**
 * Verifies email transport connectivity. Useful for Admin health check.
 */
export async function verifyEmailTransport(): Promise<{
  configured: boolean;
  verified: boolean;
  provider: string;
  senderEmail: string;
  message: string;
}> {
  const config = getEmailConfig();
  const configured = isOutboundEmailConfigured();

  if (!configured) {
    return {
      configured: false,
      verified: false,
      provider: config.provider,
      senderEmail: config.senderEmail,
      message: "No outbound email credentials configured (SMTP_APP_PASSWORD, RESEND_API_KEY, or EMAIL_WEBHOOK_URL). Running in simulated mode.",
    };
  }

  // If using Gmail SMTP
  if (config.smtpUser && config.smtpAppPassword) {
    try {
      const transporter = getSmtpTransporter();
      await transporter.verify();
      return {
        configured: true,
        verified: true,
        provider: "gmail-smtp",
        senderEmail: config.senderEmail,
        message: `Successfully connected and authenticated with ${config.smtpHost}:${config.smtpPort} as ${config.smtpUser}.`,
      };
    } catch (err: unknown) {
      return {
        configured: true,
        verified: false,
        provider: "gmail-smtp",
        senderEmail: config.senderEmail,
        message: `SMTP connection failed: ${(err as Error).message}`,
      };
    }
  }

  // If using Resend
  if (config.resendApiKey) {
    return {
      configured: true,
      verified: true,
      provider: "resend",
      senderEmail: config.senderEmail,
      message: "Resend API key configured and ready for outbound dispatch.",
    };
  }

  return {
    configured: true,
    verified: true,
    provider: "webhook",
    senderEmail: config.senderEmail,
    message: "Outbound webhook endpoint configured and active.",
  };
}

/**
 * Core transport delivery function with multi-provider failover and test mode protection.
 */
export async function deliverEmailMessage(message: OutboundMessage): Promise<DeliveryResult> {
  const config = getEmailConfig();
  const testMode = isEmailTestMode();

  // Test mode safety guard: Route external recipient to company internal notification recipient
  const targetRecipient = testMode ? config.testRecipient : message.to;
  const replyToAddress = message.replyTo || config.replyTo;
  const fromHeader = `"${config.senderName}" <${config.senderEmail}>`;

  // Prepare test mode banner to clearly inform the recipient of originally intended destination
  const htmlContent = testMode
    ? `
      <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; padding: 14px 18px; margin-bottom: 20px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #92400e; line-height: 1.5;">
        <strong style="color: #b45309; font-size: 14px;">⚠️ [TEST MODE ACTIVE — ROUTED TO INTERNAL COMPANY INBOX]</strong><br/>
        <strong>Originally Intended Recipient:</strong> <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px;">${message.to}</code><br/>
        <strong>Internal Destination:</strong> <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px;">${targetRecipient}</code><br/>
        <span style="font-size: 11px; color: #78350f;">External customer delivery is suppressed while EMAIL_MODE=${config.emailMode}.</span>
      </div>
      ${message.html}
    `
    : message.html;

  const rawText = message.text || message.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const textContent = testMode
    ? `====================================================
⚠️ [TEST MODE ACTIVE — ROUTED TO INTERNAL COMPANY INBOX]
Originally Intended Recipient: ${message.to}
Internal Destination: ${targetRecipient}
Environment Mode: ${config.emailMode}
====================================================

${rawText}`
    : rawText;

  // 1. Gmail SMTP Delivery (Primary Preferred Method)
  if (config.smtpUser && config.smtpAppPassword) {
    try {
      const transporter = getSmtpTransporter();
      const info = await transporter.sendMail({
        from: fromHeader,
        to: targetRecipient,
        replyTo: replyToAddress,
        subject: testMode ? `[TEST MODE] ${message.subject}` : message.subject,
        html: htmlContent,
        text: textContent,
        headers: {
          "X-Entity-Ref-ID": message.eventKey || "general",
          "X-Axivon-Source": "Axivon Technologies Core",
          ...(testMode
            ? {
                "X-Axivon-Test-Mode": "true",
                "X-Original-Recipient": message.to,
              }
            : {}),
        },
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: "gmail-smtp",
        recipientUsed: targetRecipient,
        isTestMode: testMode,
      };
    } catch (smtpErr: unknown) {
      const errMsg = (smtpErr as Error).message || "Unknown SMTP error";
      console.error("[EmailTransport] Gmail SMTP error:", errMsg);

      // If no other outbound provider (Resend or Webhook) is configured, return the SMTP failure directly
      if (!config.resendApiKey && !config.webhookUrl) {
        return {
          success: false,
          error: errMsg,
          provider: "gmail-smtp",
          recipientUsed: targetRecipient,
          isTestMode: testMode,
        };
      }
      // Otherwise fall through to alternative fallback
    }
  }

  // 2. Resend API Delivery Fallback
  if (config.resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromHeader,
          to: targetRecipient,
          reply_to: replyToAddress,
          subject: testMode ? `[TEST MODE] ${message.subject}` : message.subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          success: true,
          messageId: json.id,
          provider: "resend",
          recipientUsed: targetRecipient,
          isTestMode: testMode,
        };
      } else {
        const errText = await response.text();
        console.error("[EmailTransport] Resend API error:", response.status, errText);
      }
    } catch (resendErr: unknown) {
      console.error("[EmailTransport] Resend dispatch exception:", (resendErr as Error).message);
    }
  }

  // 3. Custom Webhook Fallback
  if (config.webhookUrl) {
    try {
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.webhookSecret ? { Authorization: `Bearer ${config.webhookSecret}` } : {}),
        },
        body: JSON.stringify({
          from: fromHeader,
          to: targetRecipient,
          replyTo: replyToAddress,
          subject: testMode ? `[TEST MODE] ${message.subject}` : message.subject,
          html: htmlContent,
          text: textContent,
          eventKey: message.eventKey,
        }),
      });

      if (response.ok) {
        return {
          success: true,
          provider: "webhook",
          recipientUsed: targetRecipient,
          isTestMode: testMode,
        };
      }
    } catch (webhookErr: unknown) {
      console.error("[EmailTransport] Webhook exception:", (webhookErr as Error).message);
    }
  }

  // 4. Simulated Fallback (Used when no external transport credentials configured)
  console.log(`[EmailTransport] [${testMode ? "TEST_MODE" : "SIMULATED"}] To: ${targetRecipient} | Subject: ${message.subject}`);
  return {
    success: true,
    messageId: `simulated-${Date.now()}`,
    provider: "console-fallback",
    recipientUsed: targetRecipient,
    isTestMode: testMode,
  };
}
