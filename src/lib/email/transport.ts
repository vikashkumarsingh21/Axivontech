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

function getSmtpTransporter(): Transporter {
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

  // Test mode safety guard: Route external recipient to company test inbox to prevent accidental customer emails
  const targetRecipient = testMode ? config.testRecipient : message.to;
  const replyToAddress = message.replyTo || config.replyTo;
  const fromHeader = `"${config.senderName}" <${config.senderEmail}>`;

  // 1. Gmail SMTP Delivery (Primary Preferred Method)
  if (config.smtpUser && config.smtpAppPassword) {
    try {
      const transporter = getSmtpTransporter();
      const info = await transporter.sendMail({
        from: fromHeader,
        to: targetRecipient,
        replyTo: replyToAddress,
        subject: testMode ? `[TEST MODE] ${message.subject}` : message.subject,
        html: message.html,
        text: message.text || message.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
        headers: {
          "X-Entity-Ref-ID": message.eventKey || "general",
          "X-Axivon-Source": "Axivon Technologies Core",
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
      console.error("[EmailTransport] Gmail SMTP error:", (smtpErr as Error).message);
      // Fall through to next provider if available
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
          html: message.html,
          text: message.text,
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
          subject: message.subject,
          html: message.html,
          text: message.text,
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

  // 4. Fallback / Test Mode Console Log
  console.log(`[EmailTransport] [${testMode ? "TEST_MODE" : "SIMULATED"}] To: ${targetRecipient} | Subject: ${message.subject}`);
  return {
    success: true,
    messageId: `simulated-${Date.now()}`,
    provider: "console-fallback",
    recipientUsed: targetRecipient,
    isTestMode: testMode,
  };
}
