import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { getEmailConfig } from "@/lib/email/config";
import { verifyEmailTransport } from "@/lib/email/transport";

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "admin:access");

    const config = getEmailConfig();
    const transportHealth = await verifyEmailTransport();

    // Query Delivery Metrics from db.emailLog
    const [totalSent, totalFailed, recentLogs, queuedCount] = await Promise.all([
      db.emailLog.count({ where: { status: "SENT" } }),
      db.emailLog.count({ where: { status: "FAILED" } }),
      db.emailLog.findMany({
        take: 30,
        orderBy: { sentAt: "desc" },
        select: {
          id: true,
          toEmail: true,
          templateKey: true,
          subject: true,
          status: true,
          error: true,
          metadata: true,
          sentAt: true,
        },
      }),
      db.backgroundJob.count({
        where: {
          jobType: { in: ["SEND_EMAIL", "EMAIL_RETRY"] },
          status: { in: ["PENDING", "PROCESSING"] },
        },
      }),
    ]);

    // Mask sensitive recipient patterns if needed
    const sanitizedLogs = recentLogs.map((log) => {
      const meta = (log.metadata as Record<string, unknown>) || {};
      return {
        id: log.id,
        toEmail: log.toEmail,
        templateKey: log.templateKey,
        subject: log.subject,
        status: log.status,
        error: log.error,
        sentAt: log.sentAt,
        provider: meta.provider || "default",
        isTestMode: !!meta.isTestMode,
        idempotencyKey: meta.idempotencyKey || null,
      };
    });

    return NextResponse.json({
      success: true,
      settings: {
        provider: config.provider,
        senderName: config.senderName,
        senderEmail: config.senderEmail,
        replyTo: config.replyTo,
        internalNotificationRecipient: config.internalNotificationEmail,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpSecure: config.smtpSecure,
        smtpUser: config.smtpUser,
        hasSmtpPassword: !!config.smtpAppPassword,
        emailMode: config.emailMode,
        testRecipient: config.testRecipient,
        timezone: config.timezone,
      },
      health: transportHealth,
      metrics: {
        totalSent,
        totalFailed,
        totalQueued: queuedCount,
      },
      recentLogs: sanitizedLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
