import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

const ROLE_PRIORITY: Record<string, number> = {
  FOUNDER: 100,
  CO_FOUNDER: 95,
  ADMIN: 90,
  EXECUTIVE: 80,
  HR: 70,
  FINANCE: 70,
  LEAD_DEVELOPER: 60,
  EMPLOYEE: 50,
  BROKER: 40,
  BUSINESS_PARTNER: 40,
  CLIENT: 30,
  USER: 10,
};

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const validatedUser = await validateActiveUser(userId);

    const user = await db.user.findUnique({
      where: { id: validatedUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        employeeId: true,
        department: true,
        designation: true,
        address: true,
        emergencyContact: true,
        status: true,
        requiredDailyMinutes: true,
        joiningDate: true,
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

    const roleNames = user.userRoles.map((ur) => ur.role.name);
    const sortedRoles = [...roleNames].sort(
      (a, b) => (ROLE_PRIORITY[b] || 0) - (ROLE_PRIORITY[a] || 0)
    );
    const primaryRole = sortedRoles[0] || "EMPLOYEE";

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        address: user.address,
        emergencyContact: user.emergencyContact,
        status: user.status,
        requiredDailyMinutes: user.requiredDailyMinutes || 480,
        organizationId: user.organizationId,
        role: primaryRole,
        roles: roleNames,
        joinedAt: user.joiningDate || user.createdAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
