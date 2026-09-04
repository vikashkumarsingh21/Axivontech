import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().nullable(),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  requiredDailyHours: z
    .number({ invalid_type_error: "Required daily hours must be a number" })
    .positive("Required daily hours must be greater than 0")
    .max(24, "Required daily hours cannot exceed 24")
    .optional()
    .nullable(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:read");

    const { id } = await params;

    const employee = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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
        userRoles: {
          select: {
            role: { select: { id: true, name: true, description: true } },
          },
        },
      },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    return NextResponse.json({
      data: {
        ...employee,
        requiredDailyHours: Number(((employee.requiredDailyMinutes || 480) / 60).toFixed(2)),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateEmployeeSchema.parse(body);

    const targetUser = await db.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!targetUser) {
      throw new ApiError(404, "Employee not found");
    }

    const isFounder = targetUser.userRoles.some(
      (ur) => ur.role.name === "FOUNDER" || ur.role.name === "CO_FOUNDER"
    );
    if (isFounder) {
      throw new ApiError(403, "Forbidden: Cannot edit Founder or Co-Founder accounts");
    }

    if (validatedData.email && validatedData.email !== targetUser.email) {
      const existingEmail = await db.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        throw new ApiError(409, "An account with this email address already exists.");
      }
    }

    if (validatedData.employeeId && validatedData.employeeId !== targetUser.employeeId) {
      const existingEmpId = await db.user.findFirst({
        where: { employeeId: validatedData.employeeId, id: { not: id } },
      });
      if (existingEmpId) {
        throw new ApiError(409, "An employee with this Employee ID already exists.");
      }
    }

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.department !== undefined) updateData.department = validatedData.department;
    if (validatedData.designation !== undefined) updateData.designation = validatedData.designation;
    if (validatedData.employeeId !== undefined) updateData.employeeId = validatedData.employeeId;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;

    if (validatedData.requiredDailyHours !== undefined && validatedData.requiredDailyHours !== null) {
      updateData.requiredDailyMinutes = Math.round(validatedData.requiredDailyHours * 60);
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;

      if (validatedData.status === "INACTIVE") {
        updateData.inactiveAt = new Date();
        // Invalidate active user sessions immediately
        await db.session.deleteMany({ where: { userId: id } });
      } else if (validatedData.status === "ACTIVE") {
        updateData.inactiveAt = null; // Clear inactive timestamp on reactivation
      }
    }

    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
    }

    const updatedEmployee = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        employeeId: true,
        department: true,
        designation: true,
        status: true,
        inactiveAt: true,
        requiredDailyMinutes: true,
        joiningDate: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "EMPLOYEE_UPDATED",
        resource: "User",
        details: {
          targetUserId: id,
          updatedFields: Object.keys(updateData).filter((f) => f !== "passwordHash"),
          status: updatedEmployee.status,
          inactiveAt: updatedEmployee.inactiveAt,
        },
      },
    });

    return NextResponse.json({
      data: {
        ...updatedEmployee,
        requiredDailyHours: Number(((updatedEmployee.requiredDailyMinutes || 480) / 60).toFixed(2)),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
