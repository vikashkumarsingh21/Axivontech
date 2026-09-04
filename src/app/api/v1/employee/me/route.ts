import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from '@/lib/auth/permissions';
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const role = user.userRoles.length > 0 ? user.userRoles[0].role.name : "USER";

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: role,
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
