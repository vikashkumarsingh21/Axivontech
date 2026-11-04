import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { checkEmailAvailability } from "@/lib/auth/broker-account-service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.review");

    const email = req.nextUrl.searchParams.get("email");
    const applicationId = req.nextUrl.searchParams.get("applicationId") || undefined;
    if (!email) {
      return NextResponse.json({ available: false, message: "Email query param required" }, { status: 400 });
    }

    const result = await checkEmailAvailability(email, applicationId);
    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
