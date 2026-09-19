import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "people.view");
    const scope = await getExecutiveScope(actorId);

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        employeeId: true,
        department: true,
        designation: true,
        address: true,
        emergencyContact: true,
        status: true,
        inactiveAt: true,
        requiredDailyMinutes: true,
        joiningDate: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: { select: { id: true, name: true } },
        userRoles: {
          select: {
            role: { select: { id: true, name: true, description: true } },
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Organization isolation — Co-Founders can only see users from scoped departments
    if (!scope.isFounder && scope.allowedDepartments) {
      if (user.department && !scope.allowedDepartments.includes(user.department)) {
        throw new ApiError(404, "User not found");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        requiredDailyHours: Number(((user.requiredDailyMinutes || 480) / 60).toFixed(2)),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  department: z.string().trim().max(100).optional().nullable(),
  designation: z.string().trim().max(100).optional().nullable(),
  employeeId: z.string().trim().max(50).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actorId = req.headers.get("x-user-id");
    await requirePermission(actorId, "people.view");
    const scope = await getExecutiveScope(actorId);

    const { id } = await params;
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No valid fields provided to update");
    }

    const targetUser = await db.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    const targetRoles = targetUser.userRoles.map((ur) => ur.role.name);
    const isTargetFounder = targetRoles.includes("FOUNDER");

    // Non-founders cannot edit Founder accounts
    if (isTargetFounder && !scope.isFounder) {
      throw new ApiError(403, "Forbidden: Only Founders can modify Founder accounts");
    }

    // Self-edit guard — prevent self-status-change to INACTIVE
    if (actorId === id && data.status === "INACTIVE") {
      throw new ApiError(400, "You cannot deactivate your own account");
    }

    // Email uniqueness check
    if (data.email && data.email !== targetUser.email) {
      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new ApiError(409, "An account with this email address already exists");
      }
    }

    // Employee ID uniqueness check
    if (data.employeeId && data.employeeId !== targetUser.employeeId) {
      const existing = await db.user.findFirst({
        where: { employeeId: data.employeeId, id: { not: id } },
      });
      if (existing) {
        throw new ApiError(409, "An employee with this Employee ID already exists");
      }
    }

    const updatePayload: Record<string, any> = {};
    const changedFields: string[] = [];

    if (data.name !== undefined) { updatePayload.name = data.name; changedFields.push("name"); }
    if (data.email !== undefined) { updatePayload.email = data.email; changedFields.push("email"); }
    if (data.department !== undefined) { updatePayload.department = data.department; changedFields.push("department"); }
    if (data.designation !== undefined) { updatePayload.designation = data.designation; changedFields.push("designation"); }
    if (data.employeeId !== undefined) { updatePayload.employeeId = data.employeeId; changedFields.push("employeeId"); }
    if (data.phone !== undefined) { updatePayload.phone = data.phone; changedFields.push("phone"); }

    if (data.status !== undefined) {
      updatePayload.status = data.status;
      changedFields.push("status");
      if (data.status === "INACTIVE") {
        updatePayload.inactiveAt = new Date();
      } else if (data.status === "ACTIVE") {
        updatePayload.inactiveAt = null;
      }
    }

    // Use a transaction for data integrity
    const operations: any[] = [
      db.user.update({
        where: { id },
        data: updatePayload,
        select: {
          id: true, name: true, email: true, phone: true, employeeId: true,
          department: true, designation: true, status: true, inactiveAt: true,
          requiredDailyMinutes: true, joiningDate: true, updatedAt: true,
          userRoles: { select: { role: { select: { id: true, name: true } } } },
        },
      }),
    ];

    // Invalidate sessions on email change or account deactivation
    if (data.email || data.status === "INACTIVE") {
      operations.push(db.session.deleteMany({ where: { userId: id } }));
    }

    const [updated] = await db.$transaction(operations);

    // Audit log — record old/new email but NEVER passwords
    await db.auditLog.create({
      data: {
        userId: actorId,
        action: data.email ? "USER_EMAIL_CHANGED" : data.status ? "USER_STATUS_CHANGED" : "USER_PROFILE_UPDATED",
        resource: "User",
        details: {
          targetUserId: id,
          changedFields,
          ...(data.email ? { oldEmail: targetUser.email, newEmail: data.email } : {}),
          ...(data.status ? { oldStatus: targetUser.status, newStatus: data.status } : {}),
        },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        requiredDailyHours: Number(((updated.requiredDailyMinutes || 480) / 60).toFixed(2)),
      },
      message: data.email
        ? "User email updated. User must log in with the new email."
        : data.status === "INACTIVE"
        ? "Account deactivated. User has been signed out."
        : "User profile updated successfully.",
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
