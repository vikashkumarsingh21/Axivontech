import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { sendTransactionalEmail } from "@/lib/email/service";
import { getEmailConfig } from "@/lib/email/config";
import { verifyEmailTransport } from "@/lib/email/transport";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const config = getEmailConfig();

    // 1. Verify SMTP connection transport health first
    const health = await verifyEmailTransport();

    // 2. Default test recipient is the authorized internal company email (info@axivontech.in)
    const recipient = body.recipient?.trim() || config.internalNotificationEmail;

    // 3. Attempt sending verified test message
    const logRecord = await sendTransactionalEmail({
      to: recipient,
      templateKey: body.templateKey || "GENERIC_NOTIFICATION",
      variables: {
        title: "Axivon Technologies Gmail SMTP Verification Test",
        message: `This is a verified test email sent from the Axivon Technologies Admin Portal to confirm Gmail SMTP outbound delivery configuration to ${recipient}.`,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        initiatedBy: adminId,
        testRun: true,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
      },
    });

    const isSuccess = logRecord?.status === "SENT";
    const meta = (logRecord?.metadata as Record<string, unknown>) || {};

    return NextResponse.json(
      {
        success: isSuccess,
        message: isSuccess
          ? `Test email successfully dispatched to ${recipient}`
          : `Email dispatch failed: ${logRecord?.error || "Unknown error"}`,
        transportHealth: health,
        delivery: {
          recipientUsed: recipient,
          status: logRecord?.status,
          error: logRecord?.error,
          sentAt: logRecord?.sentAt,
          provider: meta.provider,
          messageId: meta.messageId,
          isTestMode: meta.isTestMode,
        },
      },
      { status: isSuccess ? 200 : 502 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
