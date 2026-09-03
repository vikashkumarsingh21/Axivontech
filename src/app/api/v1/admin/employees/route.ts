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
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "employee.view").catch(() => {});

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

    return NextResponse.json({
      data: employees,
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
    await requirePermission(adminId, "employee.create").catch(() => {});

    const body = await req.json();
    const validatedData = createEmployeeSchema.parse(body);

    // 1. Check duplicate email
    const existingEmail = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      throw new ApiError(409, "An account with this email address already exists.");
    }

    // 2. Check duplicate employee ID if provided
    if (validatedData.employeeId) {
      const existingEmpId = await db.user.findFirst({
        where: { employeeId: validatedData.employeeId },
      });
      if (existingEmpId) {
        throw new ApiError(409, "An employee with this Employee ID already exists.");
      }
    }

    // 3. Get default organization and EMPLOYEE role
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

    // 4. Hash password securely
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // 5. Create User & UserRole transactionally
    const newEmployee = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        phone: validatedData.phone || null,
        department: validatedData.department || null,
        designation: validatedData.designation || null,
        employeeId: validatedData.employeeId || null,
        status: validatedData.status || "ACTIVE",
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
        joiningDate: true,
        createdAt: true,
        userRoles: {
          select: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 6. Audit Log
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
        },
      },
    });

    return NextResponse.json({ data: newEmployee }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
