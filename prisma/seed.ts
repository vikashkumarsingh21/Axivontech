/**
 * Axivon Technologies — Prisma Database Seed Script
 *
 * Seeds foundational data for the platform:
 *   - Organization
 *   - Roles (FOUNDER, CO_FOUNDER, ADMIN, EMPLOYEE)
 *   - Permissions (resource:action format)
 *   - RolePermission relationships
 *   - One development test employee account (EMPLOYEE role)
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * It uses upsert operations to avoid duplicate records.
 *
 * DEV TEST CREDENTIAL (local development only):
 *   Email:    testemployee@axivon.dev
 *   Password: AxivonTest@2024
 *
 * DO NOT use these credentials in production.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log("🌱 Starting Axivon Technologies database seed...\n");

  // ─── 1. Organization ───────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: "axivon-org-001" },
    update: { name: "Axivon Technologies" },
    create: {
      id: "axivon-org-001",
      name: "Axivon Technologies",
    },
  });
  console.log(`✅ Organization: "${org.name}" (${org.id})`);

  // ─── 2. Roles ──────────────────────────────────────────────────────
  const roleDefinitions = [
    { name: "FOUNDER", description: "Platform founder with full access" },
    { name: "CO_FOUNDER", description: "Platform co-founder with executive access" },
    { name: "ADMIN", description: "Administrative access to manage the platform" },
    { name: "EMPLOYEE", description: "Standard employee with portal access" },
  ];

  const roles: Record<string, string> = {};

  for (const def of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: def.name },
      update: { description: def.description },
      create: { name: def.name, description: def.description },
    });
    roles[def.name] = role.id;
    console.log(`✅ Role: ${role.name} (${role.id})`);
  }

  // ─── 3. Permissions ────────────────────────────────────────────────
  const permissionDefinitions = [
    // User & Profile
    { name: "profile:read", description: "View own profile" },
    { name: "profile:write", description: "Update own profile" },
    { name: "users:read", description: "View user list" },
    { name: "users:write", description: "Create and update users" },
    { name: "users:delete", description: "Delete users" },

    // Attendance
    { name: "attendance:read", description: "View own attendance" },
    { name: "attendance:write", description: "Check in / check out" },
    { name: "attendance:manage", description: "Manage all attendance records" },

    // Tasks
    { name: "tasks:read", description: "View assigned tasks" },
    { name: "tasks:write", description: "Update task status and add comments" },
    { name: "tasks:manage", description: "Create, assign, and delete tasks" },

    // Work Reports
    { name: "reports:read", description: "View own work reports" },
    { name: "reports:write", description: "Submit work reports" },
    { name: "reports:manage", description: "Review and manage all work reports" },

    // Leave
    { name: "leave:read", description: "View own leave requests" },
    { name: "leave:write", description: "Submit leave requests" },
    { name: "leave:manage", description: "Approve, reject, and manage all leave" },

    // Notifications & Announcements
    { name: "notifications:read", description: "View own notifications" },
    { name: "announcements:read", description: "View announcements" },
    { name: "announcements:manage", description: "Create and manage announcements" },

    // Documents
    { name: "documents:read", description: "View authorized documents" },
    { name: "documents:manage", description: "Upload and manage documents" },

    // Admin
    { name: "admin:access", description: "Access admin panel" },
    { name: "admin:settings", description: "Manage platform settings" },
  ];

  const permissions: Record<string, string> = {};

  for (const def of permissionDefinitions) {
    const perm = await prisma.permission.upsert({
      where: { name: def.name },
      update: { description: def.description },
      create: { name: def.name, description: def.description },
    });
    permissions[def.name] = perm.id;
  }
  console.log(`✅ Permissions: ${Object.keys(permissions).length} created/verified`);

  // ─── 4. RolePermission Relationships ───────────────────────────────

  // EMPLOYEE permissions
  const employeePermissions = [
    "profile:read", "profile:write",
    "attendance:read", "attendance:write",
    "tasks:read", "tasks:write",
    "reports:read", "reports:write",
    "leave:read", "leave:write",
    "notifications:read",
    "announcements:read",
    "documents:read",
  ];

  // ADMIN gets everything EMPLOYEE has + management permissions
  const adminPermissions = [
    ...employeePermissions,
    "users:read", "users:write", "users:delete",
    "attendance:manage",
    "tasks:manage",
    "reports:manage",
    "leave:manage",
    "announcements:manage",
    "documents:manage",
    "admin:access", "admin:settings",
  ];

  // FOUNDER / CO_FOUNDER get all permissions
  const allPermissionNames = permissionDefinitions.map((p) => p.name);

  const rolePermissionMap: Record<string, string[]> = {
    FOUNDER: allPermissionNames,
    CO_FOUNDER: allPermissionNames,
    ADMIN: adminPermissions,
    EMPLOYEE: employeePermissions,
  };

  let totalRolePermissions = 0;
  for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
    const roleId = roles[roleName];
    for (const permName of permNames) {
      const permissionId = permissions[permName];
      if (!roleId || !permissionId) continue;

      // Upsert via raw findFirst + create to handle composite PK
      const existing = await prisma.rolePermission.findFirst({
        where: { roleId, permissionId },
      });
      if (!existing) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId },
        });
      }
      totalRolePermissions++;
    }
  }
  console.log(`✅ RolePermission mappings: ${totalRolePermissions} verified`);

  // ─── 5. Development Test Employee ──────────────────────────────────
  //
  // DEV CREDENTIAL (local development only):
  //   Email:    testemployee@axivon.dev
  //   Password: AxivonTest@2024
  //
  const testEmployeeEmail = "testemployee@axivon.dev";
  const testEmployeePassword = "AxivonTest@2024";
  const hashedPassword = await hashPassword(testEmployeePassword);

  const testEmployee = await prisma.user.upsert({
    where: { email: testEmployeeEmail },
    update: {
      name: "Dev Test Employee",
      organizationId: org.id,
      status: "ACTIVE",
      department: "Engineering",
      designation: "Software Developer",
      employeeId: "EMP-DEV-001",
    },
    create: {
      email: testEmployeeEmail,
      name: "Dev Test Employee",
      passwordHash: hashedPassword,
      organizationId: org.id,
      status: "ACTIVE",
      department: "Engineering",
      designation: "Software Developer",
      employeeId: "EMP-DEV-001",
      joiningDate: new Date("2024-01-15"),
    },
  });
  console.log(`✅ Test Employee: "${testEmployee.name}" <${testEmployee.email}> (${testEmployee.id})`);

  // Assign EMPLOYEE role to test employee (idempotent)
  const employeeRoleId = roles["EMPLOYEE"];
  const existingUserRole = await prisma.userRole.findFirst({
    where: { userId: testEmployee.id, roleId: employeeRoleId },
  });
  if (!existingUserRole) {
    await prisma.userRole.create({
      data: { userId: testEmployee.id, roleId: employeeRoleId },
    });
  }
  console.log(`✅ Test Employee assigned role: EMPLOYEE`);

  // ─── 6. Verification Summary ───────────────────────────────────────
  console.log("\n─── Seed Verification ───────────────────────────────────");
  const orgCount = await prisma.organization.count();
  const roleCount = await prisma.role.count();
  const permCount = await prisma.permission.count();
  const rpCount = await prisma.rolePermission.count();
  const userCount = await prisma.user.count();
  const urCount = await prisma.userRole.count();

  console.log(`  Organizations:     ${orgCount}`);
  console.log(`  Roles:             ${roleCount}`);
  console.log(`  Permissions:       ${permCount}`);
  console.log(`  RolePermissions:   ${rpCount}`);
  console.log(`  Users:             ${userCount}`);
  console.log(`  UserRoles:         ${urCount}`);

  // Verify password is stored as hash
  const verifyUser = await prisma.user.findUnique({
    where: { email: testEmployeeEmail },
    select: { passwordHash: true },
  });
  const isHash = verifyUser?.passwordHash?.startsWith("$2");
  console.log(`  Password is hash:  ${isHash ? "YES ✅" : "NO ❌"}`);

  console.log("\n🎉 Seed completed successfully!\n");

  // Admin Seed
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || 'AxivonAdmin@2024', 10);
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@axivon.dev' },
    update: {},
    create: {
      email: 'admin@axivon.dev',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      department: 'Management',
      designation: 'Administrator',
      status: 'ACTIVE',
      organizationId: 'axivon-org-001'
    }
  });
  
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole!.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole!.id }
  });
  console.log('Seeded Admin account: admin@axivon.dev');
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
