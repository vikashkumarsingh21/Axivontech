import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(401, "Unauthorized");
    }

    await validateActiveUser(userId);

    const clientUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        address: true,
        status: true,
      },
    });

    if (!clientUser) {
      throw new ApiError(404, "User not found");
    }

    return NextResponse.json({ data: clientUser });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(401, "Unauthorized");
    }

    await validateActiveUser(userId);

    const body = await req.json().catch(() => ({}));
    const { phone, address } = body;

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        ...(phone !== undefined && { phone: typeof phone === "string" ? phone.trim() : null }),
        ...(address !== undefined && { address: typeof address === "string" ? address.trim() : null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        address: true,
        status: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
