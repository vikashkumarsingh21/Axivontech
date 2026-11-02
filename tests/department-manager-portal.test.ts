import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createManagerAccountSchema,
  listAllDepartments,
  createDepartment,
  updateDepartment,
  getDepartmentById,
  createDepartmentManagerAccount,
  getManagerAuthorizedDepartment,
  enforceDepartmentIsolation,
} from "@/lib/services/department.service";
import {
  normalizeRole,
  resolveRoleDashboardUrl,
  ROLE_PRIORITY,
} from "@/lib/auth/roles";
import { POST as postTask } from "@/app/api/v1/manager/tasks/route";
import { PATCH as patchLeave } from "@/app/api/v1/manager/leave/route";
import { GET as getEmployees } from "@/app/api/v1/manager/employees/route";
import { NextRequest } from "next/server";

// In-memory data store for isolated unit tests
let mockDepartments: any[] = [];
let mockUsers: any[] = [];
let mockDepartmentManagers: any[] = [];
let mockAuditLogs: any[] = [];
let mockOrgSettings: any[] = [];
let mockTasks: any[] = [];
let mockLeaveRequests: any[] = [];

vi.mock("@/lib/db", () => {
  return {
    db: {
      organization: {
        findFirst: vi.fn().mockResolvedValue({ id: "org_default", name: "Axivon Technologies" }),
      },
      role: {
        findUnique: vi.fn().mockResolvedValue({ id: "role_dept_mgr", name: "DEPARTMENT_MANAGER" }),
        create: vi.fn().mockImplementation(async ({ data }: any) => ({
          id: `role_${Date.now()}`,
          ...data,
        })),
      },
      department: {
        findMany: vi.fn().mockImplementation(async (args?: any) => {
          let list = [...mockDepartments];
          if (args?.where?.status) {
            list = list.filter((d) => d.status === args.where.status);
          }
          if (args?.where?.name) {
            if (typeof args.where.name === "object" && args.where.name.equals) {
              list = list.filter(
                (d) => d.name.toLowerCase() === args.where.name.equals.toLowerCase()
              );
            } else if (typeof args.where.name === "string") {
              list = list.filter(
                (d) => d.name.toLowerCase() === args.where.name.toLowerCase()
              );
            }
          }
          return list.map((d) => {
            const mgr = mockUsers.find((u) => u.id === d.managerId);
            return {
              ...d,
              manager: mgr || null,
            };
          });
        }),
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          const dept = mockDepartments.find(
            (d) =>
              (where.id && d.id === where.id) ||
              (where.name && d.name.toLowerCase() === where.name.toLowerCase()) ||
              (where.code && d.code.toUpperCase() === where.code.toUpperCase())
          );
          if (!dept) return null;
          const mgr = mockUsers.find((u) => u.id === dept.managerId);
          return {
            ...dept,
            manager: mgr || null,
          };
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          if (where?.OR) {
            const match = mockDepartments.find((d) => {
              return where.OR.some((condition: any) => {
                if (condition.name && typeof condition.name === "object") {
                  return d.name.toLowerCase() === condition.name.equals.toLowerCase();
                }
                if (condition.code && typeof condition.code === "object") {
                  return d.code.toUpperCase() === condition.code.equals.toUpperCase();
                }
                return false;
              });
            });
            return match || null;
          }
          return mockDepartments[0] || null;
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const newDept = {
            id: `dept_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: data.name,
            code: data.code.toUpperCase(),
            description: data.description || null,
            status: data.status || "ACTIVE",
            managerId: data.managerId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockDepartments.push(newDept);
          return newDept;
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const idx = mockDepartments.findIndex((d) => d.id === where.id);
          if (idx === -1) throw new Error("Department not found");
          mockDepartments[idx] = {
            ...mockDepartments[idx],
            ...data,
            updatedAt: new Date(),
          };
          const mgr = mockUsers.find((u) => u.id === mockDepartments[idx].managerId);
          return {
            ...mockDepartments[idx],
            manager: mgr || null,
          };
        }),
      },
      departmentManager: {
        findFirst: vi.fn().mockImplementation(async ({ where }: any) => {
          return (
            mockDepartmentManagers.find(
              (dm) =>
                dm.userId === where.userId &&
                (!where.departmentId || dm.departmentId === where.departmentId)
            ) || null
          );
        }),
        findMany: vi.fn().mockImplementation(async ({ where }: any) => {
          return mockDepartmentManagers.filter((dm) => dm.userId === where.userId);
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const record = { id: `dm_${Date.now()}`, ...data, createdAt: new Date() };
          mockDepartmentManagers.push(record);
          return record;
        }),
      },
      user: {
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          const user = mockUsers.find(
            (u) =>
              (where.id && u.id === where.id) ||
              (where.email && u.email.toLowerCase() === where.email.toLowerCase())
          );
          if (!user) return null;
          return {
            ...user,
            userRoles: user.userRoles || [
              { role: { name: user.role || "DEPARTMENT_MANAGER" } },
            ],
          };
        }),
        findMany: vi.fn().mockImplementation(async ({ where }: any) => {
          let list = [...mockUsers];
          if (where?.department) {
            const deptName =
              typeof where.department === "object"
                ? where.department.equals
                : where.department;
            list = list.filter(
              (u) => u.department && u.department.toLowerCase() === deptName.toLowerCase()
            );
          }
          if (where?.status?.not) {
            list = list.filter((u) => u.status !== where.status.not);
          }
          return list;
        }),
        groupBy: vi.fn().mockImplementation(async () => {
          const counts: Record<string, number> = {};
          for (const u of mockUsers) {
            if (u.department && u.status !== "DELETED") {
              counts[u.department] = (counts[u.department] || 0) + 1;
            }
          }
          return Object.entries(counts).map(([department, count]) => ({
            department,
            _count: { id: count },
          }));
        }),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const newUser = {
            id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ...data,
            role: "DEPARTMENT_MANAGER",
            status: "ACTIVE",
            mustChangePassword: true,
            userRoles: [{ role: { name: "DEPARTMENT_MANAGER" } }],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockUsers.push(newUser);
          return newUser;
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const idx = mockUsers.findIndex((u) => u.id === where.id);
          if (idx === -1) throw new Error("User not found");
          mockUsers[idx] = { ...mockUsers[idx], ...data, updatedAt: new Date() };
          return mockUsers[idx];
        }),
      },
      auditLog: {
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          mockAuditLogs.push({ id: `log_${Date.now()}`, ...data, createdAt: new Date() });
          return mockAuditLogs[mockAuditLogs.length - 1];
        }),
      },
      organizationSetting: {
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          return mockOrgSettings.find((s) => s.key === where.key) || null;
        }),
        upsert: vi.fn().mockImplementation(async ({ where, create, update }: any) => {
          const idx = mockOrgSettings.findIndex((s) => s.key === where.key);
          if (idx >= 0) {
            mockOrgSettings[idx] = { ...mockOrgSettings[idx], ...update };
            return mockOrgSettings[idx];
          } else {
            const newItem = { id: `setting_${Date.now()}`, ...create };
            mockOrgSettings.push(newItem);
            return newItem;
          }
        }),
      },
      task: {
        count: vi.fn().mockImplementation(async () => mockTasks.length),
        findMany: vi.fn().mockImplementation(async () => mockTasks),
        create: vi.fn().mockImplementation(async ({ data }: any) => {
          const t = { id: `task_${Date.now()}`, ...data, createdAt: new Date() };
          mockTasks.push(t);
          return t;
        }),
      },
      workReport: {
        count: vi.fn().mockResolvedValue(5),
        findMany: vi.fn().mockResolvedValue([]),
      },
      leaveRequest: {
        count: vi.fn().mockImplementation(async () => mockLeaveRequests.length),
        findMany: vi.fn().mockImplementation(async () => mockLeaveRequests),
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          const l = mockLeaveRequests.find((r) => r.id === where.id);
          if (!l) return null;
          const u = mockUsers.find((usr) => usr.id === l.userId);
          return {
            ...l,
            user: u || { id: l.userId, name: "Employee", department: "Engineering" },
          };
        }),
        update: vi.fn().mockImplementation(async ({ where, data }: any) => {
          const idx = mockLeaveRequests.findIndex((r) => r.id === where.id);
          if (idx === -1) throw new Error("Leave not found");
          mockLeaveRequests[idx] = { ...mockLeaveRequests[idx], ...data };
          return mockLeaveRequests[idx];
        }),
      },
      attendance: {
        count: vi.fn().mockResolvedValue(8),
        findMany: vi.fn().mockResolvedValue([]),
      },
      announcement: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  };
});

describe("Department Manager Portal & Account Management Test Suite", () => {
  beforeEach(() => {
    mockDepartments = [];
    mockUsers = [];
    mockDepartmentManagers = [];
    mockAuditLogs = [];
    mockOrgSettings = [];
    mockTasks = [];
    mockLeaveRequests = [];
    vi.clearAllMocks();
  });

  // =========================================================================
  // SECTION 1: Department Creation & Isolation from Manager Auto-Creation
  // =========================================================================
  describe("1. Department Creation & Manager Separation", () => {
    it("should validate department schemas correctly", () => {
      // Valid department creation
      const valid = createDepartmentSchema.safeParse({
        name: "Engineering",
        code: "ENG",
        description: "Software engineering and technical infrastructure",
      });
      expect(valid.success).toBe(true);

      // Rejects invalid code with special characters or too short
      const invalidCode = createDepartmentSchema.safeParse({
        name: "Design",
        code: "@#$",
      });
      expect(invalidCode.success).toBe(false);

      // Rejects empty name
      const emptyName = createDepartmentSchema.safeParse({
        name: "  ",
        code: "DES",
      });
      expect(emptyName.success).toBe(false);
    });

    it("should create department without creating any manager account by default", async () => {
      const dept = await createDepartment(
        {
          name: "Marketing",
          code: "MKTG",
          description: "Digital campaigns and brand growth",
        },
        "admin_user_01"
      );

      expect(dept).toBeDefined();
      expect(dept.name).toBe("Marketing");
      expect(dept.code).toBe("MKTG");
      expect(dept.status).toBe("ACTIVE");
      // CRITICAL REQUIREMENT: Manager account MUST NOT be created automatically by default
      expect(dept.managerId).toBeNull();
      expect(mockUsers.length).toBe(0); // Zero users provisioned

      // Verify audit log
      expect(mockAuditLogs.length).toBeGreaterThan(0);
      expect(mockAuditLogs[0].action).toBe("DEPARTMENT_CREATED");
    });

    it("should prevent creating duplicate departments with the same name or code", async () => {
      await createDepartment(
        { name: "Finance", code: "FIN", description: "Financial operations" },
        "admin_user_01"
      );

      // Attempt duplicate name
      await expect(
        createDepartment({ name: "Finance", code: "FIN2" }, "admin_user_01")
      ).rejects.toThrow(/already exists|already in use/i);

      // Attempt duplicate code
      await expect(
        createDepartment({ name: "Finance Operations", code: "FIN" }, "admin_user_01")
      ).rejects.toThrow(/already in use|already exists/i);
    });

    it("should allow soft deactivation of departments", async () => {
      const dept = await createDepartment(
        { name: "Human Resources", code: "HR" },
        "admin_user_01"
      );

      const updated = await updateDepartment(
        dept.id,
        { status: "INACTIVE" },
        "admin_user_01"
      );

      expect(updated.status).toBe("INACTIVE");

      // By default listAllDepartments(false) excludes inactive
      const activeList = await listAllDepartments(false);
      expect(activeList.some((d) => d.id === dept.id)).toBe(false);

      // With includeInactive=true, it is included
      const fullList = await listAllDepartments(true);
      expect(fullList.some((d) => d.id === dept.id)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 2: Manual Department Manager Provisioning & Credential Security
  // =========================================================================
  describe("2. Manual Department Manager Account Provisioning", () => {
    it("should validate createManagerAccountSchema correctly", () => {
      const valid = createManagerAccountSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@axivontech.com",
        departmentId: "dept_123",
      });
      expect(valid.success).toBe(true);

      const invalidEmail = createManagerAccountSchema.safeParse({
        name: "Ada",
        email: "not-an-email",
        departmentId: "dept_123",
      });
      expect(invalidEmail.success).toBe(false);
    });

    it("should securely provision a department manager account with required initial password reset", async () => {
      const dept = await createDepartment(
        { name: "Engineering", code: "ENG" },
        "admin_user_01"
      );

      const result = await createDepartmentManagerAccount(
        {
          name: "Alan Turing",
          email: "alan.turing@axivontech.com",
          departmentId: dept.id,
          designation: "Head of Engineering",
          phone: "+91 9876543210",
        },
        "admin_user_01"
      );

      expect(result.manager).toBeDefined();
      expect(result.manager.name).toBe("Alan Turing");
      expect(result.manager.email).toBe("alan.turing@axivontech.com");
      expect(result.manager.department).toBe("Engineering");
      expect(result.temporaryPassword).toBeDefined();

      // Password must be hashed in store - never stored as plain text
      const storedUser = mockUsers.find((u) => u.email === "alan.turing@axivontech.com");
      expect(storedUser).toBeDefined();
      expect(storedUser.mustChangePassword).toBe(true);
      expect(storedUser.passwordHash).toBeDefined();
      expect(storedUser.passwordHash).not.toBe(result.temporaryPassword);
      expect(storedUser.passwordHash.length).toBeGreaterThan(20); // bcrypt hash length

      // Department manager assignment must be updated
      const updatedDept = await getDepartmentById(dept.id);
      expect(updatedDept.managerId).toBe(result.manager.id);

      // Audit log must record the provisioning without exposing passwords
      const provLog = mockAuditLogs.find((l) => l.action === "DEPARTMENT_MANAGER_PROVISIONED");
      expect(provLog).toBeDefined();
      expect(JSON.stringify(provLog)).not.toContain(result.temporaryPassword);
    });

    it("should reject creating a manager with an existing user's email", async () => {
      const dept = await createDepartment({ name: "Sales", code: "SALES" }, "admin_01");

      await createDepartmentManagerAccount(
        {
          name: "Ada Lovelace",
          email: "ada@axivontech.com",
          departmentId: dept.id,
        },
        "admin_01"
      );

      // Duplicate email attempt
      await expect(
        createDepartmentManagerAccount(
          {
            name: "Duplicate Ada",
            email: "ada@axivontech.com",
            departmentId: dept.id,
          },
          "admin_01"
        )
      ).rejects.toThrow(/already exists/i);
    });
  });

  // =========================================================================
  // SECTION 3: Authorized Department Resolution & Server-Side Security
  // =========================================================================
  describe("3. Manager Department Resolution", () => {
    it("should resolve the authorized department strictly from server-side records", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const mgr = await createDepartmentManagerAccount(
        {
          name: "Linus Torvalds",
          email: "linus@axivontech.com",
          departmentId: engDept.id,
        },
        "admin_01"
      );

      const resolved = await getManagerAuthorizedDepartment(mgr.manager.id);
      expect(resolved).toBeDefined();
      expect(resolved.id).toBe(engDept.id);
      expect(resolved.name).toBe("Engineering");
      expect(resolved.code).toBe("ENG");
    });

    it("should reject manager authorization for users without a department", async () => {
      // Create user without department
      const unassignedUser = {
        id: "usr_unassigned",
        name: "No Dept User",
        email: "nodept@axivontech.com",
        status: "ACTIVE",
        role: "DEPARTMENT_MANAGER",
        department: null,
        userRoles: [{ role: { name: "DEPARTMENT_MANAGER" } }],
      };
      mockUsers.push(unassignedUser);

      await expect(getManagerAuthorizedDepartment(unassignedUser.id)).rejects.toThrow(
        /not assigned as a manager/i
      );
    });
  });

  // =========================================================================
  // SECTION 4: Cross-Department Isolation & Access Denial
  // =========================================================================
  describe("4. Cross-Department Data Isolation & Strict Enforcement", () => {
    it("should enforce strict separation between Engineering and Marketing managers", async () => {
      // Create Engineering and Marketing departments
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const mktDept = await createDepartment({ name: "Marketing", code: "MKTG" }, "admin_01");

      const engMgr = await createDepartmentManagerAccount(
        { name: "Grace Hopper", email: "grace@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      const mktMgr = await createDepartmentManagerAccount(
        { name: "Don Draper", email: "don@axivontech.com", departmentId: mktDept.id },
        "admin_01"
      );

      // Engineering manager accessing Engineering data -> Allowed
      await expect(
        enforceDepartmentIsolation(engMgr.manager.id, "Engineering")
      ).resolves.not.toThrow();

      // Engineering manager accessing Marketing data -> Denied (HTTP 403)
      await expect(
        enforceDepartmentIsolation(engMgr.manager.id, "Marketing")
      ).rejects.toThrow(/Cross-department access denied/i);

      // Marketing manager accessing Engineering data -> Denied (HTTP 403)
      await expect(
        enforceDepartmentIsolation(mktMgr.manager.id, "Engineering")
      ).rejects.toThrow(/Cross-department access denied/i);
    });

    it("should prevent managers from managing employees belonging to another department", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const mktDept = await createDepartment({ name: "Marketing", code: "MKTG" }, "admin_01");

      const engMgr = await createDepartmentManagerAccount(
        { name: "Tech Lead", email: "techlead@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      // Employee in Marketing
      const mktEmployee = {
        id: "emp_marketing_01",
        name: "Copywriter Bob",
        email: "bob@axivontech.com",
        department: "Marketing",
        role: "EMPLOYEE",
        status: "ACTIVE",
      };
      mockUsers.push(mktEmployee);

      // Engineering manager attempts to operate on Marketing employee
      await expect(
        enforceDepartmentIsolation(engMgr.manager.id, mktEmployee.department)
      ).rejects.toThrow(/Cross-department access denied/i);
    });
  });

  // =========================================================================
  // SECTION 5: Manager Role Hierarchy & Self-Elevation Prevention
  // =========================================================================
  describe("5. Role Hierarchy & Privilege Boundaries", () => {
    it("should correctly define DEPARTMENT_MANAGER in role hierarchy and canonical normalization", () => {
      expect(normalizeRole("DEPARTMENT_MANAGER")).toBe("DEPARTMENT_MANAGER");
      expect(normalizeRole("MANAGER")).toBe("DEPARTMENT_MANAGER");
      expect(normalizeRole("department_manager")).toBe("DEPARTMENT_MANAGER");
      expect(normalizeRole("manager")).toBe("DEPARTMENT_MANAGER");

      // Verify hierarchy: DEPARTMENT_MANAGER (65) < ADMIN (80) < CO_FOUNDER (90) < FOUNDER (100)
      const managerPriority = ROLE_PRIORITY["DEPARTMENT_MANAGER"];
      const adminPriority = ROLE_PRIORITY["ADMIN"];
      const founderPriority = ROLE_PRIORITY["FOUNDER"];
      const cofounderPriority = ROLE_PRIORITY["CO_FOUNDER"];

      expect(managerPriority).toBe(65);
      expect(managerPriority).toBeLessThan(adminPriority);
      expect(managerPriority).toBeLessThan(founderPriority);
      expect(managerPriority).toBeLessThan(cofounderPriority);
    });

    it("should direct DEPARTMENT_MANAGER strictly to /manager/dashboard", () => {
      expect(resolveRoleDashboardUrl("DEPARTMENT_MANAGER")).toBe("/manager/dashboard");
      expect(resolveRoleDashboardUrl("MANAGER")).toBe("/manager/dashboard");
      expect(resolveRoleDashboardUrl("manager")).toBe("/manager/dashboard");
    });

    it("should verify existing portals remain untouched and map to their designated dashboards", () => {
      expect(resolveRoleDashboardUrl("ADMIN")).toBe("/admin/dashboard");
      expect(resolveRoleDashboardUrl("FOUNDER")).toBe("/executive/dashboard");
      expect(resolveRoleDashboardUrl("CO_FOUNDER")).toBe("/executive/dashboard");
      expect(resolveRoleDashboardUrl("EMPLOYEE")).toBe("/employee/dashboard");
      expect(resolveRoleDashboardUrl("BROKER")).toBe("/broker/dashboard");
      expect(resolveRoleDashboardUrl("PARTNER")).toBe("/broker/dashboard");
    });
  });

  // =========================================================================
  // SECTION 6: Admin Reassignment and Revocation of Manager Access
  // =========================================================================
  describe("6. Admin Manager Reassignment and Revocation", () => {
    it("should allow Admin to revoke a manager and reassign to a new manager", async () => {
      const dept = await createDepartment({ name: "Finance", code: "FIN" }, "admin_01");

      const mgrA = await createDepartmentManagerAccount(
        { name: "Manager A", email: "mgra@axivontech.com", departmentId: dept.id },
        "admin_01"
      );

      expect((await getDepartmentById(dept.id)).managerId).toBe(mgrA.manager.id);

      // Reassign to null (Revoke)
      await updateDepartment(dept.id, { managerId: null }, "admin_01");
      const revokedDept = await getDepartmentById(dept.id);
      expect(revokedDept.managerId).toBeNull();

      // Revoked manager can no longer access department
      await expect(getManagerAuthorizedDepartment(mgrA.manager.id)).rejects.toThrow(
        /not assigned as a manager/i
      );

      // Assign Manager B
      const mgrB = {
        id: "usr_mgr_b",
        name: "Manager B",
        email: "mgrb@axivontech.com",
        role: "DEPARTMENT_MANAGER",
        status: "ACTIVE",
        department: "Finance",
        userRoles: [{ role: { name: "DEPARTMENT_MANAGER" } }],
      };
      mockUsers.push(mgrB);

      await updateDepartment(dept.id, { managerId: mgrB.id }, "admin_01");
      const reassignedDept = await getDepartmentById(dept.id);
      expect(reassignedDept.managerId).toBe(mgrB.id);

      // Manager B can now access department
      const bAuth = await getManagerAuthorizedDepartment(mgrB.id);
      expect(bAuth.id).toBe(dept.id);
      expect(bAuth.name).toBe("Finance");
    });
  });

  // =========================================================================
  // SECTION 7: API Route Scoping & Cross-Department Security Enforcement
  // =========================================================================
  describe("7. Manager API Routes Boundary Protection", () => {
    it("should reject task assignment across departments at API level with 403 Forbidden", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const mktDept = await createDepartment({ name: "Marketing", code: "MKTG" }, "admin_01");

      const engMgr = await createDepartmentManagerAccount(
        { name: "Eng Mgr", email: "engmgr@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      const mktEmployee = {
        id: "emp_mkt_99",
        name: "Marketing Staff",
        email: "staff@mkt.com",
        department: "Marketing",
        role: "EMPLOYEE",
        status: "ACTIVE",
      };
      mockUsers.push(mktEmployee);

      // Engineering manager attempts to assign a task to marketing employee
      const req = new NextRequest("http://localhost:3000/api/v1/manager/tasks", {
        method: "POST",
        headers: {
          "x-user-id": engMgr.manager.id,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Build landing page",
          userId: mktEmployee.id,
          priority: "HIGH",
        }),
      });

      const res = await postTask(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.message || json.error).toContain("Cannot assign tasks across departments");
    });

    it("should allow task assignment to an employee in the same department", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const engMgr = await createDepartmentManagerAccount(
        { name: "Eng Mgr", email: "engmgr2@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      const engEmployee = {
        id: "emp_eng_01",
        name: "Dev Charlie",
        email: "charlie@eng.com",
        department: "Engineering",
        role: "EMPLOYEE",
        status: "ACTIVE",
      };
      mockUsers.push(engEmployee);

      const req = new NextRequest("http://localhost:3000/api/v1/manager/tasks", {
        method: "POST",
        headers: {
          "x-user-id": engMgr.manager.id,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Implement OAuth2 Flow",
          userId: engEmployee.id,
          priority: "URGENT",
        }),
      });

      const res = await postTask(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.task.title).toBe("Implement OAuth2 Flow");
      expect(json.task.userId).toBe(engEmployee.id);
    });

    it("should reject leave action across departments at API level with 403 Forbidden", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const mktDept = await createDepartment({ name: "Marketing", code: "MKTG" }, "admin_01");

      const engMgr = await createDepartmentManagerAccount(
        { name: "Eng Mgr", email: "engmgr3@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      const mktEmployee = {
        id: "emp_mkt_02",
        name: "Marketing David",
        email: "david@mkt.com",
        department: "Marketing",
        role: "EMPLOYEE",
        status: "ACTIVE",
      };
      mockUsers.push(mktEmployee);

      const leaveReq = {
        id: "leave_mkt_01",
        userId: mktEmployee.id,
        leaveType: "ANNUAL",
        startDate: new Date("2026-11-10"),
        endDate: new Date("2026-11-15"),
        reason: "Vacation",
        status: "PENDING",
        user: mktEmployee,
      };
      mockLeaveRequests.push(leaveReq);

      // Engineering manager attempts to approve Marketing employee's leave
      const req = new NextRequest("http://localhost:3000/api/v1/manager/leave", {
        method: "PATCH",
        headers: {
          "x-user-id": engMgr.manager.id,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          leaveId: leaveReq.id,
          action: "APPROVE",
          comment: "Looks good",
        }),
      });

      const res = await patchLeave(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.message || json.error).toContain("Cannot action leave requests across departments");
    });

    it("should allow manager to approve leave for department employee", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const engMgr = await createDepartmentManagerAccount(
        { name: "Eng Mgr", email: "engmgr4@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      const engEmployee = {
        id: "emp_eng_02",
        name: "Dev Fiona",
        email: "fiona@eng.com",
        department: "Engineering",
        role: "EMPLOYEE",
        status: "ACTIVE",
      };
      mockUsers.push(engEmployee);

      const leaveReq = {
        id: "leave_eng_01",
        userId: engEmployee.id,
        leaveType: "SICK",
        startDate: new Date("2026-11-05"),
        endDate: new Date("2026-11-06"),
        reason: "Medical appointment",
        status: "PENDING",
        user: engEmployee,
      };
      mockLeaveRequests.push(leaveReq);

      const req = new NextRequest("http://localhost:3000/api/v1/manager/leave", {
        method: "PATCH",
        headers: {
          "x-user-id": engMgr.manager.id,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          leaveId: leaveReq.id,
          action: "APPROVE",
          comment: "Approved, get well soon",
        }),
      });

      const res = await patchLeave(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.leave.status).toBe("APPROVED");
      expect(json.leave.approvedById).toBe(engMgr.manager.id);
    });

    it("should scope employee roster exclusively to manager's department", async () => {
      const engDept = await createDepartment({ name: "Engineering", code: "ENG" }, "admin_01");
      const mktDept = await createDepartment({ name: "Marketing", code: "MKTG" }, "admin_01");

      const engMgr = await createDepartmentManagerAccount(
        { name: "Eng Mgr", email: "engmgr5@axivontech.com", departmentId: engDept.id },
        "admin_01"
      );

      // Add employees to both departments
      mockUsers.push({
        id: "eng_1",
        name: "Eng Dev 1",
        email: "dev1@eng.com",
        department: "Engineering",
        status: "ACTIVE",
        _count: { tasks: 0, workReports: 0 },
      });
      mockUsers.push({
        id: "mkt_1",
        name: "Mkt Exec 1",
        email: "exec1@mkt.com",
        department: "Marketing",
        status: "ACTIVE",
        _count: { tasks: 0, workReports: 0 },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/manager/employees", {
        method: "GET",
        headers: { "x-user-id": engMgr.manager.id },
      });

      const res = await getEmployees(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.department.name).toBe("Engineering");
      // Must contain only Engineering employee and manager
      expect(json.employees.every((e: any) => e.department.toLowerCase() === "engineering")).toBe(true);
      expect(json.employees.some((e: any) => e.id === "mkt_1")).toBe(false);
    });
  });
});
