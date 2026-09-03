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
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "employee.view").catch(() => {});

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

    return NextResponse.json({ data: employee });
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
    await requirePermission(adminId, "employee.update").catch(() => {});

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateEmployeeSchema.parse(body);

    // 1. Fetch existing user
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

    // 2. Prevent non-founder from editing Founder / Co-Founder data
    const isFounder = targetUser.userRoles.some(
      (ur) => ur.role.name === "FOUNDER" || ur.role.name === "CO_FOUNDER"
    );
    if (isFounder) {
      throw new ApiError(403, "Forbidden: Cannot edit Founder or Co-Founder accounts");
    }

    // 3. Email uniqueness check if email changed
    if (validatedData.email && validatedData.email !== targetUser.email) {
      const existingEmail = await db.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        throw new ApiError(409, "An account with this email address already exists.");
      }
    }

    // 4. Employee ID uniqueness check if employeeId changed
    if (validatedData.employeeId && validatedData.employeeId !== targetUser.employeeId) {
      const existingEmpId = await db.user.findFirst({
        where: { employeeId: validatedData.employeeId, id: { not: id } },
      });
      if (existingEmpId) {
        throw new ApiError(409, "An employee with this Employee ID already exists.");
      }
    }

    // 5. Prepare update payload
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.department !== undefined) updateData.department = validatedData.department;
    if (validatedData.designation !== undefined) updateData.designation = validatedData.designation;
    if (validatedData.employeeId !== undefined) updateData.employeeId = validatedData.employeeId;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
    }

    // 6. Perform update
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
        joiningDate: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 7. Audit Log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "EMPLOYEE_UPDATED",
        resource: "User",
        details: {
          targetUserId: id,
          updatedFields: Object.keys(updateData).filter(f => f !== "passwordHash"),
        },
      },
    });

    return NextResponse.json({ data: updatedEmployee });
  } catch (error: any) {
    return handleApiError(error);
  }
}
