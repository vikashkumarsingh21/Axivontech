import { db } from "@/lib/db";
import { getEmailConfig, isOutboundEmailConfigured, isEmailTestMode } from "./config";
import { deliverEmailMessage, verifyEmailTransport, DeliveryResult } from "./transport";
import { renderEmailTemplate } from "./templates";

export interface SendTransactionalEmailOptions {
  to: string;
  templateKey: string;
  variables?: Record<string, any>;
  eventKey?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  replyTo?: string;
  maxRetries?: number;
}

export { isOutboundEmailConfigured, verifyEmailTransport };

/**
 * Primary Centralized Transactional Email Dispatcher for Axivon Technologies.
 * 
 * - Enforces idempotency to prevent duplicate emails from button double-clicks or retries.
 * - Records transactional delivery logs in EmailLog.
 * - Multi-provider transport (Gmail SMTP -> Resend -> Webhook -> Console).
 * - Automatic background retry for temporary network/server glitches.
 * - Non-blocking: failures are logged and retried; they never throw uncaught errors to caller.
 */
export async function sendTransactionalEmail(options: SendTransactionalEmailOptions) {
  const {
    to,
    templateKey,
    variables = {},
    eventKey,
    idempotencyKey = eventKey,
    metadata = {},
    replyTo,
  } = options;

  const config = getEmailConfig();
  const normalizedTo = to.trim().toLowerCase();

  // 1. Basic recipient validation
  if (!normalizedTo || !normalizedTo.includes("@")) {
    console.warn(`[EmailService] Invalid recipient email address suppressed: "${to}"`);
    return null;
  }

  // 2. Idempotency Check: Prevent duplicate email dispatch for same business event within 24h
  if (idempotencyKey && db?.emailLog?.findFirst) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await db.emailLog.findFirst({
        where: {
          toEmail: normalizedTo,
          templateKey,
          sentAt: { gte: oneDayAgo },
          status: "SENT",
        },
        orderBy: { sentAt: "desc" },
      });

      if (existing && existing.metadata && typeof existing.metadata === "object") {
        const meta = existing.metadata as Record<string, unknown>;
        if (meta.idempotencyKey === idempotencyKey || meta.eventKey === idempotencyKey) {
          console.log(`[EmailService] Duplicate suppressed for eventKey "${idempotencyKey}" to ${normalizedTo}`);
          return existing;
        }
      }
    } catch {
      // Non-fatal if query check fails
    }
  }

  // 3. Render Template (Check custom DB communicationTemplate / emailTemplate first)
  let subject: string;
  let html: string;
  let text: string | undefined;

  let dbTemplate: any = null;
  if (db?.communicationTemplate?.findFirst) {
    try {
      dbTemplate = await db.communicationTemplate.findFirst({
        where: { key: templateKey, isActive: true },
      });
    } catch {
      // ignore
    }
  }
  if (!dbTemplate && db?.emailTemplate?.findUnique) {
    try {
      dbTemplate = await db.emailTemplate.findUnique({
        where: { key: templateKey },
      });
    } catch {
      // ignore
    }
  }

  if (dbTemplate && dbTemplate.subject && (dbTemplate.content || dbTemplate.body)) {
    const rawSubject = dbTemplate.subject;
    const rawContent = dbTemplate.content || dbTemplate.body || "";
    const vars: Record<string, any> = { ...variables, to: normalizedTo };
    subject = rawSubject.replace(/\{\{\s*(\w+)\s*\}\}/g, (_: string, k: string) => (vars[k] !== undefined ? String(vars[k]) : ""));
    html = rawContent.replace(/\{\{\s*(\w+)\s*\}\}/g, (_: string, k: string) => (vars[k] !== undefined ? String(vars[k]) : ""));
    text = html.replace(/<[^>]+>/g, "").trim();
  } else {
    const rendered = renderEmailTemplate(templateKey, {
      ...variables,
      to: normalizedTo,
    });
    subject = rendered.subject;
    html = rendered.html;
    text = rendered.text;
  }

  // 4. Attempt Outbound Delivery
  let deliveryResult: DeliveryResult;
  try {
    deliveryResult = await deliverEmailMessage({
      to: normalizedTo,
      subject,
      html,
      text,
      replyTo,
      eventKey: idempotencyKey,
      metadata,
    });
  } catch (deliveryErr: unknown) {
    deliveryResult = {
      success: false,
      provider: config.provider,
      recipientUsed: normalizedTo,
      isTestMode: isEmailTestMode(),
      error: (deliveryErr as Error).message,
    };
  }

  // 5. Record Transactional Outbox Log
  let logRecord = null;
  if (db?.emailLog?.create) {
    try {
      const sanitizedError = deliveryResult.error
        ? deliveryResult.error.replace(/(password|token|secret|key)=[^\s&]+/gi, "$1=[REDACTED]")
        : null;

      logRecord = await db.emailLog.create({
      data: {
        toEmail: normalizedTo,
        templateKey,
        subject,
        status: deliveryResult.success ? "SENT" : "FAILED",
        error: sanitizedError,
        metadata: {
          ...metadata,
          idempotencyKey,
          eventKey,
          provider: deliveryResult.provider,
          messageId: deliveryResult.messageId,
          recipientUsed: deliveryResult.recipientUsed,
          isTestMode: deliveryResult.isTestMode,
          attempts: 1,
        },
      },
    });
    } catch (dbErr: unknown) {
      console.error("[EmailService] Failed to record EmailLog:", (dbErr as Error).message);
    }
  }

  // 6. Enqueue Background Retry if delivery failed
  if (!deliveryResult.success && logRecord) {
    try {
      const { JobRunner } = await import("@/lib/jobs/runner");
      await JobRunner.enqueue(
        "EMAIL_RETRY",
        {
          to: normalizedTo,
          templateKey,
          variables,
          idempotencyKey,
          metadata: { ...metadata, logId: logRecord.id, attempt: 1 },
        },
        new Date(Date.now() + 5 * 60 * 1000) // 5 minutes backoff
      );
    } catch {
      // Non-critical background failure
    }
  }

  return logRecord;
}

/**
 * Backward compatibility class for existing code that invokes EmailService.send().
 */
export class EmailService {
  static async send(options: {
    to: string;
    templateKey: string;
    variables?: Record<string, any>;
    metadata?: unknown;
    eventKey?: string;
  }) {
    const logRecord = await sendTransactionalEmail({
      to: options.to,
      templateKey: options.templateKey,
      variables: options.variables,
      eventKey: options.eventKey,
      metadata: (options.metadata as Record<string, unknown>) || undefined,
    });

    return (
      logRecord || {
        id: "simulated-email-id",
        status: "SENT",
        to: options.to,
        subject: options.templateKey,
        body: "",
        provider: "internal",
        error: null,
        metadata: null,
        createdAt: new Date(),
      }
    );
  }
}
