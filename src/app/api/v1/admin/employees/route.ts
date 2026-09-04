import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  requiredDailyHours: z
    .number({ message: "Required daily hours must be a number" })
    .positive("Required daily hours must be greater than 0")
    .max(24, "Required daily hours cannot exceed 24")
    .optional()
    .default(8),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const where: any = {
      userRoles: { none: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [employees, total] = await Promise.all([
      db.user.findMany({
        where,
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
          createdAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    const formattedEmployees = employees.map((emp) => ({
      ...emp,
      requiredDailyHours: Number(((emp.requiredDailyMinutes || 480) / 60).toFixed(2)),
    }));

    return NextResponse.json({
      data: formattedEmployees,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");

    const body = await req.json();
    const validatedData = createEmployeeSchema.parse(body);

    const existingEmail = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new ApiError(409, "An account with this email address already exists.");
    }

    if (validatedData.employeeId) {
      const existingEmpId = await db.user.findFirst({
        where: { employeeId: validatedData.employeeId },
      });
      if (existingEmpId) {
        throw new ApiError(409, "An employee with this Employee ID already exists.");
      }
    }

    const org = await db.organization.findFirst();
    if (!org) {
      throw new ApiError(500, "Organization not configured.");
    }

    let employeeRole = await db.role.findUnique({ where: { name: "EMPLOYEE" } });
    if (!employeeRole) {
      employeeRole = await db.role.create({
        data: { name: "EMPLOYEE", description: "Standard Employee Role" },
      });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);
    const requiredDailyMinutes = Math.round(validatedData.requiredDailyHours * 60);
    const status = validatedData.status || "ACTIVE";
    const inactiveAt = status === "INACTIVE" ? new Date() : null;

    const newEmployee = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        phone: validatedData.phone || null,
        department: validatedData.department || null,
        designation: validatedData.designation || null,
        employeeId: validatedData.employeeId || null,
        status,
        inactiveAt,
        requiredDailyMinutes,
        organization: { connect: { id: org.id } },
        userRoles: {
          create: {
            role: { connect: { id: employeeRole.id } },
          },
        },
      },
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
        createdAt: true,
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
        action: "EMPLOYEE_CREATED",
        resource: "User",
        details: {
          employeeId: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          department: newEmployee.department,
          requiredDailyHours: validatedData.requiredDailyHours,
          status,
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...newEmployee,
          requiredDailyHours: Number(((newEmployee.requiredDailyMinutes || 480) / 60).toFixed(2)),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
