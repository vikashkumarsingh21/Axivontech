/**
 * Centralized Department Management & Department-Level Isolation Service
 * Axivon Technologies — Workforce & Operations Architecture
 *
 * BUSINESS RULES:
 * 1. Departments have unique names and unique codes (e.g., Engineering / ENG).
 * 2. Department Manager accounts must NEVER be created automatically by default.
 *    Creation of a department and creation of a manager account are separate actions.
 * 3. Each manager's access is strictly scoped to their assigned department.
 *    No cross-department access is permitted for managers.
 * 4. Admins and Executive Partners (Founder / Co-Founder) maintain company-wide oversight.
 * 5. Provides resilient database access via Prisma with fallback to organization settings store.
 */

import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { normalizeRole } from "@/lib/auth/roles";
import { z } from "zod";

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  managerId: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    designation?: string | null;
    status: string;
  } | null;
  employeeCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/i, "Department code must contain only letters, numbers, and dashes"),
  description: z.string().trim().max(500).optional().nullable(),
  managerId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/i, "Department code must contain only letters, numbers, and dashes")
    .optional(),
  description: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  managerId: z.string().optional().nullable(),
});

export const createManagerAccountSchema = z.object({
  name: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Valid work email address is required").max(150),
  departmentId: z.string().min(1, "Department assignment is required"),
  designation: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  password: z.string().min(8, "Temporary password must be at least 8 characters").optional(),
});

const ORG_SETTING_DEPARTMENTS_KEY = "axivon_departments_registry";

/**
 * Helper to fetch fallback departments stored in OrganizationSetting if table not yet migrated.
 */
async function getFallbackDepartments(): Promise<DepartmentRecord[]> {
  try {
    const setting = await db.organizationSetting.findUnique({
      where: { key: ORG_SETTING_DEPARTMENTS_KEY },
    });
    if (!setting || !Array.isArray(setting.value)) {
      return [];
    }
    return setting.value as unknown as DepartmentRecord[];
  } catch (err) {
    return [];
  }
}

/**
 * Helper to save fallback departments to OrganizationSetting.
 */
async function saveFallbackDepartments(departments: DepartmentRecord[]): Promise<void> {
  try {
    await db.organizationSetting.upsert({
      where: { key: ORG_SETTING_DEPARTMENTS_KEY },
      create: {
        key: ORG_SETTING_DEPARTMENTS_KEY,
        value: departments as any,
      },
      update: {
        value: departments as any,
      },
    });
  } catch (err) {
    console.error("[DepartmentService] Failed to persist fallback departments:", err);
  }
}

/**
 * Retrieves all departments with manager details and calculated employee counts.
 */
export async function listAllDepartments(includeInactive = false): Promise<DepartmentRecord[]> {
  // 1. Try querying native Department table in Prisma
  try {
    const where: any = includeInactive ? {} : { status: "ACTIVE" };
    const departments = await (db as any).department.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            designation: true,
            status: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (departments && departments.length > 0) {
      // Calculate real employee counts
      const counts = await db.user.groupBy({
        by: ["department"],
        _count: { id: true },
        where: { status: { not: "DELETED" } },
      });

      const countMap = new Map<string, number>();
      for (const c of counts) {
        if (c.department) countMap.set(c.department.toLowerCase(), c._count.id);
      }

      return departments.map((d: any) => ({
        ...d,
        employeeCount: countMap.get(d.name.toLowerCase()) || 0,
      }));
    }
  } catch (err) {
    // Fallback if table not ready or in tests
  }

  // 2. Query fallback registry in OrganizationSetting
  let fallbackList = await getFallbackDepartments();
  if (!includeInactive) {
    fallbackList = fallbackList.filter((d) => d.status === "ACTIVE");
  }

  // Calculate real employee counts from users
  const counts = await db.user.groupBy({
    by: ["department"],
    _count: { id: true },
    where: { status: { not: "DELETED" } },
  });

  const countMap = new Map<string, number>();
  for (const c of counts) {
    if (c.department) countMap.set(c.department.toLowerCase(), c._count.id);
  }

  // Hydrate manager information for fallback departments
  const enriched = await Promise.all(
    fallbackList.map(async (d) => {
      let manager = null;
      if (d.managerId) {
        const mgrUser = await db.user.findUnique({
          where: { id: d.managerId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            designation: true,
            status: true,
          },
        });
        if (mgrUser) manager = mgrUser;
      }
      return {
        ...d,
        manager,
        employeeCount: countMap.get(d.name.toLowerCase()) || 0,
      };
    })
  );

  return enriched.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Retrieves a single department by its unique ID.
 */
export async function getDepartmentById(id: string): Promise<DepartmentRecord> {
  const departments = await listAllDepartments(true);
  const found = departments.find((d) => d.id === id);
  if (!found) {
    throw new ApiError(404, "Department not found");
  }
  return found;
}

/**
 * Creates a new department.
 * IMPORTANT: Never creates a manager account automatically.
 */
export async function createDepartment(
  rawInput: unknown,
  actorId?: string | null
): Promise<DepartmentRecord> {
  const data = createDepartmentSchema.parse(rawInput);
  const normalizedName = data.name.trim();
  const normalizedCode = data.code.trim().toUpperCase();

  const allDepts = await listAllDepartments(true);

  // Check unique constraints
  const duplicateName = allDepts.find(
    (d) => d.name.toLowerCase() === normalizedName.toLowerCase()
  );
  if (duplicateName) {
    throw new ApiError(409, `A department named "${normalizedName}" already exists.`);
  }

  const duplicateCode = allDepts.find(
    (d) => d.code.toUpperCase() === normalizedCode
  );
  if (duplicateCode) {
    throw new ApiError(409, `Department code "${normalizedCode}" is already in use.`);
  }

  // If managerId specified, verify manager user exists
  let manager = null;
  if (data.managerId) {
    const mgrUser = await db.user.findUnique({
      where: { id: data.managerId },
      select: { id: true, name: true, email: true, status: true, designation: true },
    });
    if (!mgrUser) {
      throw new ApiError(404, "Assigned manager user not found.");
    }
    manager = mgrUser;
  }

  const newDeptId = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();

  const newDepartment: DepartmentRecord = {
    id: newDeptId,
    name: normalizedName,
    code: normalizedCode,
    description: data.description || null,
    status: "ACTIVE",
    managerId: data.managerId || null,
    manager,
    employeeCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Try writing to native table
  try {
    const org = await db.organization.findFirst();
    const created = await (db as any).department.create({
      data: {
        id: newDeptId,
        name: normalizedName,
        code: normalizedCode,
        description: data.description || null,
        status: "ACTIVE",
        organizationId: org?.id || null,
        managerId: data.managerId || null,
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true, designation: true, status: true },
        },
      },
    });
    if (created) {
      newDepartment.id = created.id;
    }
  } catch (err) {
    // If native table not present, persist to fallback registry
    const currentFallback = await getFallbackDepartments();
    currentFallback.push(newDepartment);
    await saveFallbackDepartments(currentFallback);
  }

  // Audit log
  if (actorId) {
    try {
      await db.auditLog.create({
        data: {
          userId: actorId,
          action: "DEPARTMENT_CREATED",
          resource: `Department:${newDepartment.id}`,
          details: {
            name: newDepartment.name,
            code: newDepartment.code,
            managerAssigned: Boolean(newDepartment.managerId),
          },
        },
      });
    } catch (e) {}
  }

  return newDepartment;
}

/**
 * Updates department details, status, or manager assignment.
 */
export async function updateDepartment(
  id: string,
  rawInput: unknown,
  actorId?: string | null
): Promise<DepartmentRecord> {
  const data = updateDepartmentSchema.parse(rawInput);
  const current = await getDepartmentById(id);

  const allDepts = await listAllDepartments(true);

  if (data.name && data.name.toLowerCase() !== current.name.toLowerCase()) {
    const dupName = allDepts.find(
      (d) => d.id !== id && d.name.toLowerCase() === data.name!.toLowerCase()
    );
    if (dupName) {
      throw new ApiError(409, `A department named "${data.name}" already exists.`);
    }
  }

  if (data.code && data.code.toUpperCase() !== current.code.toUpperCase()) {
    const dupCode = allDepts.find(
      (d) => d.id !== id && d.code.toUpperCase() === data.code!.toUpperCase()
    );
    if (dupCode) {
      throw new ApiError(409, `Department code "${data.code}" is already in use.`);
    }
  }

  // If manager assignment updated
  let newManagerId = current.managerId;
  if (data.managerId !== undefined) {
    if (data.managerId === null) {
      newManagerId = null;
    } else {
      const mgrUser = await db.user.findUnique({
        where: { id: data.managerId },
      });
      if (!mgrUser) {
        throw new ApiError(404, "Target manager user does not exist.");
      }
      newManagerId = data.managerId;
    }
  }

  const updatedRecord: DepartmentRecord = {
    ...current,
    name: data.name ? data.name.trim() : current.name,
    code: data.code ? data.code.trim().toUpperCase() : current.code,
    description: data.description !== undefined ? data.description : current.description,
    status: data.status || current.status,
    managerId: newManagerId,
    updatedAt: new Date(),
  };

  // Try updating native table
  try {
    await (db as any).department.update({
      where: { id },
      data: {
        name: updatedRecord.name,
        code: updatedRecord.code,
        description: updatedRecord.description,
        status: updatedRecord.status,
        managerId: updatedRecord.managerId,
      },
    });
  } catch (err) {
    // Fallback store update
    const currentFallback = await getFallbackDepartments();
    const idx = currentFallback.findIndex((d) => d.id === id);
    if (idx !== -1) {
      currentFallback[idx] = updatedRecord;
    } else {
      currentFallback.push(updatedRecord);
    }
    await saveFallbackDepartments(currentFallback);
  }

  // Audit log
  if (actorId) {
    try {
      await db.auditLog.create({
        data: {
          userId: actorId,
          action: "DEPARTMENT_UPDATED",
          resource: `Department:${id}`,
          details: {
            updatedFields: Object.keys(data),
            status: updatedRecord.status,
            managerId: updatedRecord.managerId,
          },
        },
      });
    } catch (e) {}
  }

  return getDepartmentById(id);
}

/**
 * Creates a department manager account explicitly through Admin Portal workflow.
 * IMPORTANT: Rejects duplicate emails, enforces password policy, links manager role.
 */
export async function createDepartmentManagerAccount(
  rawInput: unknown,
  actorId?: string | null
) {
  const data = createManagerAccountSchema.parse(rawInput);
  const normalizedEmail = data.email.toLowerCase().trim();

  // 1. Verify target department exists and is active
  const department = await getDepartmentById(data.departmentId);
  if (department.status !== "ACTIVE") {
    throw new ApiError(400, "Cannot assign a manager to an inactive department.");
  }

  // 2. Check email uniqueness across platform
  const existingEmail = await db.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  // 3. Password handling
  const rawPassword = data.password || `AxivonMgr@${Math.floor(1000 + Math.random() * 9000)}`;
  const strengthCheck = validatePasswordStrength(rawPassword);
  if (!strengthCheck.isValid) {
    throw new ApiError(
      400,
      `Password does not meet security requirements: ${strengthCheck.errors.join(" ")}`
    );
  }
  const passwordHash = await hashPassword(rawPassword);

  const org = await db.organization.findFirst();

  // 4. Ensure DEPARTMENT_MANAGER role exists
  let managerRole = await db.role.findUnique({ where: { name: "DEPARTMENT_MANAGER" } });
  if (!managerRole) {
    managerRole = await db.role.create({
      data: {
        name: "DEPARTMENT_MANAGER",
        description: "Department Manager with department-scoped access",
      },
    });
  }

  // 5. Create manager user
  const newManager = await db.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: data.phone || null,
      department: department.name,
      designation: data.designation?.trim() || `${department.name} Manager`,
      status: "ACTIVE",
      mustChangePassword: true, // Forces password change on initial login
      organizationId: org?.id || null,
      userRoles: {
        create: {
          roleId: managerRole.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      department: true,
      designation: true,
      status: true,
      createdAt: true,
    },
  });

  // 6. Assign as primary manager of the department
  await updateDepartment(department.id, { managerId: newManager.id }, actorId);

  // 7. Audit log
  if (actorId) {
    try {
      await db.auditLog.create({
        data: {
          userId: actorId,
          action: "DEPARTMENT_MANAGER_PROVISIONED",
          resource: `User:${newManager.id}`,
          details: {
            managerName: newManager.name,
            managerEmail: newManager.email,
            departmentId: department.id,
            departmentName: department.name,
          },
        },
      });
    } catch (e) {}
  }

  return {
    manager: newManager,
    temporaryPassword: rawPassword,
    department: {
      id: department.id,
      name: department.name,
      code: department.code,
    },
    invitation: {
      sent: false,
      deliveryNote: "Account provisioned. Temporary password requires first-login change.",
    },
  };
}

/**
 * Resolves the authorized department for an authenticated user.
 * Verified strictly from trusted server records.
 */
export async function getManagerAuthorizedDepartment(userId: string): Promise<DepartmentRecord> {
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: true } },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(403, "User account is inactive or not found");
  }

  const allDepts = await listAllDepartments(true);

  // 1. Direct assignment as primary managerId on department
  let matched = allDepts.find((d) => d.managerId === userId);

  // 2. Multi-manager assignment in DepartmentManager table
  if (!matched) {
    try {
      const dmRecords = await (db as any).departmentManager.findMany({
        where: { userId },
      });
      if (dmRecords && dmRecords.length > 0) {
        const activeDeptIds = new Set(dmRecords.map((r: any) => r.departmentId));
        matched = allDepts.find((d) => activeDeptIds.has(d.id));
      }
    } catch (e) {}
  }

  if (!matched) {
    throw new ApiError(
      403,
      "Forbidden: You are not assigned as a manager for any active department."
    );
  }

  if (matched.status !== "ACTIVE") {
    throw new ApiError(
      403,
      `Access Denied: The ${matched.name} department is currently inactive.`
    );
  }

  return matched;
}

/**
 * Enforces department data isolation.
 * Throws 403 Forbidden if a manager attempts to access another department's records.
 */
export async function enforceDepartmentIsolation(
  userId: string,
  targetDepartmentName: string
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) throw new ApiError(401, "Unauthorized");

  const roles = user.userRoles.map((ur) => normalizeRole(ur.role.name));
  const isSuperUser = roles.includes("ADMIN") || roles.includes("FOUNDER") || roles.includes("CO_FOUNDER");

  if (isSuperUser) {
    return; // Full administrative / executive oversight permitted
  }

  const authorizedDept = await getManagerAuthorizedDepartment(userId);
  if (authorizedDept.name.toLowerCase() !== targetDepartmentName.toLowerCase()) {
    throw new ApiError(
      403,
      `Cross-Department Access Denied: You are authorized only for the ${authorizedDept.name} department and cannot access records for ${targetDepartmentName}.`
    );
  }
}

/**
 * Gathers complete real-time dashboard data for an authorized manager's department.
 */
export async function getDepartmentDashboardMetrics(managerUserId: string) {
  const department = await getManagerAuthorizedDepartment(managerUserId);
  const deptName = department.name;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Department Employees
  const employees = await db.user.findMany({
    where: {
      department: { equals: deptName, mode: "insensitive" },
      status: { not: "DELETED" },
    },
    select: {
      id: true,
      name: true,
      email: true,
      designation: true,
      status: true,
      avatarUrl: true,
      joiningDate: true,
    },
    orderBy: { name: "asc" },
  });

  const employeeIds = employees.map((e) => e.id);

  // 2. Department Tasks
  const tasks = await db.task.findMany({
    where: {
      userId: { in: employeeIds },
    },
    select: {
      id: true,
      title: true,
      priority: true,
      status: true,
      dueDate: true,
      userId: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED").length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  // 3. Attendance Today
  const attendanceToday = await db.attendance.findMany({
    where: {
      userId: { in: employeeIds },
      date: { gte: today },
    },
    include: {
      user: { select: { name: true, designation: true } },
    },
  });

  // 4. Pending Leave Requests
  const pendingLeaves = await db.leaveRequest.findMany({
    where: {
      userId: { in: employeeIds },
      status: "PENDING",
    },
    include: {
      user: { select: { name: true, email: true, designation: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 5. Recent Work Reports
  const recentWorkReports = await db.workReport.findMany({
    where: {
      userId: { in: employeeIds },
    },
    include: {
      user: { select: { name: true, designation: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // 6. Department Announcements
  const announcements = await db.announcement.findMany({
    where: {
      OR: [
        { audienceScope: null },
        { audienceScope: "ALL" },
        { audienceScope: { contains: deptName, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    department: {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      status: department.status,
    },
    metrics: {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "ACTIVE").length,
      presentToday: attendanceToday.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      pendingLeavesCount: pendingLeaves.length,
    },
    employees,
    tasks,
    attendanceToday,
    pendingLeaves,
    recentWorkReports,
    announcements,
  };
}
