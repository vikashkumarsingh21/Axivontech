/**
 * Axivon Technologies — Centralized Email Configuration
 * 
 * Official Sender Identity:
 * - Sender Name: Axivon Technologies
 * - Sender Email: axivontech.in@gmail.com
 * - Reply-To: axivontech.in@gmail.com
 * - Internal Business Notification Recipient: axivontech.in@gmail.com
 */

export interface EmailConfiguration {
  provider: "gmail-smtp" | "resend" | "webhook" | "console";
  senderName: string;
  senderEmail: string;
  replyTo: string;
  internalNotificationEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpAppPassword?: string;
  resendApiKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  emailMode: "production" | "test" | "sandbox";
  testRecipient: string;
  companyName: string;
  companyWebsite: string;
  companyPhone: string;
  timezone: string;
}

export function getEmailConfig(): EmailConfiguration {
  const provider = (process.env.EMAIL_PROVIDER as EmailConfiguration["provider"]) || "gmail-smtp";
  const emailMode = (process.env.EMAIL_MODE as EmailConfiguration["emailMode"]) || 
    (process.env.NODE_ENV === "production" ? "production" : "test");

  return {
    provider,
    senderName: process.env.EMAIL_FROM_NAME || "Axivon Technologies",
    senderEmail: process.env.EMAIL_FROM_ADDRESS || "axivontech.in@gmail.com",
    replyTo: process.env.EMAIL_REPLY_TO || "axivontech.in@gmail.com",
    internalNotificationEmail: process.env.EMAIL_INTERNAL_NOTIFICATION_TO || "axivontech.in@gmail.com",
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER || "axivontech.in@gmail.com",
    smtpAppPassword: process.env.SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || undefined,
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    webhookUrl: process.env.EMAIL_WEBHOOK_URL || undefined,
    webhookSecret: process.env.EMAIL_WEBHOOK_SECRET || undefined,
    emailMode,
    testRecipient: process.env.EMAIL_TEST_RECIPIENT || "axivontech.in@gmail.com",
    companyName: "Axivon Technologies",
    companyWebsite: process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in",
    companyPhone: "+91 91572 26367",
    timezone: "Asia/Kolkata",
  };
}

/**
 * Returns true if real outbound delivery credentials (Gmail SMTP, Resend, or Webhook) are available.
 */
export function isOutboundEmailConfigured(): boolean {
  const config = getEmailConfig();
  if (config.smtpUser && config.smtpAppPassword) return true;
  if (config.resendApiKey) return true;
  if (config.webhookUrl) return true;
  return false;
}

/**
 * Returns true if testing mode is active (external sends are routed to test recipient or simulated).
 */
export function isEmailTestMode(): boolean {
  const config = getEmailConfig();
  return config.emailMode === "test" || config.emailMode === "sandbox";
}
