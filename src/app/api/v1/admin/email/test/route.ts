import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { sendTransactionalEmail } from "@/lib/email/service";
import { getEmailConfig } from "@/lib/email/config";

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "admin:access");

    const body = await req.json().catch(() => ({}));
    const config = getEmailConfig();

    // Default test recipient is the authorized internal company email
    const recipient = body.recipient?.trim() || config.internalNotificationEmail;

    const logRecord = await sendTransactionalEmail({
      to: recipient,
      templateKey: body.templateKey || "GENERIC_NOTIFICATION",
      variables: {
        title: "Axivon Technologies Email System Test",
        message: "This is a verified test email sent from the Axivon Technologies Admin Portal to confirm outbound delivery configuration and formatting.",
        timestamp: new Date().toISOString(),
      },
      metadata: {
        initiatedBy: adminId,
        testRun: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Test email dispatched to ${recipient}`,
      log: logRecord,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
