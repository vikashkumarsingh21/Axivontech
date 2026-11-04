import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { approveAndCreateBrokerAccount } from "@/lib/auth/broker-account-service";
import { generateStrongPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/api/broker";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.review");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    checkRateLimit(`admin_bp_create:${userId}`, 30, 60);

    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));

    const mode = body.mode === "ACTIVATION_LINK" ? "ACTIVATION_LINK" : "DIRECT_PASSWORD";
    const password =
      mode === "DIRECT_PASSWORD"
        ? body.password?.trim() || generateStrongPassword(14)
        : undefined;

    const result = await approveAndCreateBrokerAccount({
      applicationId: id,
      adminUserId: userId,
      adminIp: ip,
      email: body.email?.trim() || undefined,
      loginEmail: body.loginEmail?.trim() || undefined,
      mode,
      password,
      mustChangePassword: body.mustChangePassword !== false,
      partnerType: body.partnerType,
      internalNote: body.internalNote,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.isExisting
          ? "Partner account already active."
          : mode === "DIRECT_PASSWORD"
          ? "Login credentials generated successfully."
          : "Activation link generated and dispatched successfully.",
        data: result,
      },
      {
        status: result.isExisting ? 200 : 201,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
