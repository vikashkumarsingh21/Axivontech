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
    { name: "attendance:write", description: "Check in / check out and breaks" },
    { name: "attendance:manage", description: "Manage all attendance records" },
    { name: "attendance.policy.manage", description: "Configure company attendance window and policies" },
    { name: "attendance.regularization.review", description: "Review attendance regularization requests" },
    { name: "attendance.regularization.submit", description: "Submit attendance regularization requests" },

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

    // Phase 4 Executive Permissions
    { name: "executive.dashboard.view", description: "View executive dashboard" },
    { name: "executive.company.view", description: "View company overview" },
    { name: "executive.analytics.view", description: "View executive analytics" },
    { name: "people.view", description: "View executive people directory" },
    { name: "people.sensitive.view", description: "View sensitive employee HR info" },
    { name: "people.manage", description: "Executive management of people" },
    { name: "people.role.manage", description: "Manage high-privilege user roles" },
    { name: "attendance.company.view", description: "View company-wide attendance" },
    { name: "leave.company.view", description: "View company-wide leave" },
    { name: "work_reports.company.view", description: "View company-wide work reports" },
    { name: "tasks.company.view", description: "View company-wide tasks" },
    { name: "projects.company.view", description: "View company-wide projects" },
    { name: "governance.role_changes.approve", description: "Approve high-privilege role changes" },
    { name: "governance.settings.approve", description: "Approve organizational setting changes" },
    { name: "governance.audit.view", description: "View governance audit log" },
    { name: "governance.security.view", description: "View governance security events" },
    { name: "reports.executive.view", description: "View executive reports" },
    { name: "reports.executive.export", description: "Export executive reports" },
    { name: "reports.sensitive.export", description: "Export sensitive executive reports" },

    // Phase 5 CRM Permissions
    { name: "crm.dashboard.view", description: "View CRM dashboard and metrics" },
    { name: "crm.lead.view", description: "View CRM leads list and details" },
    { name: "crm.lead.create", description: "Create new leads in CRM" },
    { name: "crm.lead.update", description: "Update lead details and status" },
    { name: "crm.lead.assign", description: "Assign lead owners" },
    { name: "crm.lead.convert", description: "Convert leads to clients and opportunities" },
    { name: "crm.opportunity.view", description: "View sales opportunities" },
    { name: "crm.opportunity.create", description: "Create sales opportunities" },
    { name: "crm.opportunity.update", description: "Update opportunity details" },
    { name: "crm.opportunity.stage", description: "Change opportunity pipeline stage" },
    { name: "crm.opportunity.close", description: "Mark opportunity as Won or Lost" },
    { name: "crm.followup.view", description: "View scheduled follow-ups" },
    { name: "crm.followup.create", description: "Create follow-ups" },
    { name: "crm.followup.update", description: "Update/complete follow-ups" },
    { name: "crm.client.view", description: "View CRM client records" },
    { name: "crm.client.create", description: "Create CRM clients" },
    { name: "crm.client.update", description: "Update CRM client details" },
    { name: "crm.proposal.view", description: "View proposals" },
    { name: "crm.proposal.create", description: "Create proposals" },
    { name: "crm.proposal.send", description: "Mark proposal as sent" },
    { name: "crm.report.view", description: "View CRM reports and funnels" },
    { name: "crm.export", description: "Export CRM data" },
    { name: "crm.audit.view", description: "View CRM audit logs" },

    // Phase 6 Advanced Platform Permissions
    { name: "notification.view", description: "View personal and system notifications" },
    { name: "notification.manage", description: "Manage system-wide notifications" },
    { name: "announcement.view", description: "View targeted and published announcements" },
    { name: "announcement.create", description: "Create new draft announcements" },
    { name: "announcement.publish", description: "Publish and schedule company announcements" },
    { name: "announcement.archive", description: "Archive or expire announcements" },
    { name: "document.view", description: "View and download authorized documents" },
    { name: "document.upload", description: "Upload new documents and versions" },
    { name: "document.manage", description: "Manage document permissions and categories" },
    { name: "document.share", description: "Share documents with users or teams" },
    { name: "activity.view", description: "View human-readable activity feeds" },
    { name: "audit.view", description: "View security and audit event logs" },
    { name: "automation.view", description: "View automation workflows and history" },
    { name: "automation.manage", description: "Create and modify automation rules" },
    { name: "search.use", description: "Use global system search" },
    { name: "template.manage", description: "Manage communication and email templates" },
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
    "notification.view",
    "announcement.view",
    "document.view",
    "search.use",
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
    "notification.manage",
    "announcement.create",
    "announcement.publish",
    "announcement.archive",
    "document.upload",
    "document.manage",
    "document.share",
    "activity.view",
    "audit.view",
    "automation.view",
    "automation.manage",
    "template.manage",
  ];

  // FOUNDER / CO_FOUNDER get all permissions
  const allPermissionNames = permissionDefinitions.map((p) => p.name);

  const rolePermissionMap: Record<string, string[]> = {
    FOUNDER: allPermissionNames,
    CO_FOUNDER: allPermissionNames,
    ADMIN: adminPermissions,
    EMPLOYEE: employeePermissions,
  };

  const rolePermissionsToCreate: { roleId: string; permissionId: string }[] = [];
  for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
    const roleId = roles[roleName];
    for (const permName of permNames) {
      const permissionId = permissions[permName];
      if (roleId && permissionId) {
        rolePermissionsToCreate.push({ roleId, permissionId });
      }
    }
  }

  // Insert in small chunks to prevent pooler timeouts
  const CHUNK_SIZE = 20;
  for (let i = 0; i < rolePermissionsToCreate.length; i += CHUNK_SIZE) {
    const chunk = rolePermissionsToCreate.slice(i, i + CHUNK_SIZE);
    await prisma.rolePermission.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
  console.log(`✅ RolePermission mappings: ${rolePermissionsToCreate.length} verified`);

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
      status: "ACTIVE",
      department: "Engineering",
      designation: "Software Developer",
      employeeId: "EMP-DEV-001",
      organization: { connect: { id: org.id } },
    },
    create: {
      email: testEmployeeEmail,
      name: "Dev Test Employee",
      passwordHash: hashedPassword,
      status: "ACTIVE",
      department: "Engineering",
      designation: "Software Developer",
      employeeId: "EMP-DEV-001",
      joiningDate: new Date("2024-01-15"),
      organization: { connect: { id: org.id } },
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
      organization: { connect: { id: 'axivon-org-001' } }
    }
  });
  
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole!.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole!.id }
  });
  console.log('Seeded Admin account: admin@axivon.dev');

  // ─── 7. Executive Accounts (Founder & Co-Founders) ─────────────────
  const founderRole = await prisma.role.findUnique({ where: { name: "FOUNDER" } });
  const coFounderRole = await prisma.role.findUnique({ where: { name: "CO_FOUNDER" } });

  // Seed Founder Account
  const founderPasswordHash = await bcrypt.hash(process.env.FOUNDER_SEED_PASSWORD || "AxivonFounder@2024", 10);
  const founderUser = await prisma.user.upsert({
    where: { email: "founder@axivon.dev" },
    update: {},
    create: {
      email: "founder@axivon.dev",
      name: "Platform Founder",
      passwordHash: founderPasswordHash,
      department: "Executive",
      designation: "Founder & CEO",
      status: "ACTIVE",
      organization: { connect: { id: "axivon-org-001" } },
    },
  });

  if (founderRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: founderUser.id, roleId: founderRole.id } },
      update: {},
      create: { userId: founderUser.id, roleId: founderRole.id },
    });
  }

  await prisma.executiveProfile.upsert({
    where: { userId: founderUser.id },
    update: {},
    create: {
      userId: founderUser.id,
      responsibilityProfile: "FULL",
    },
  });
  console.log('✅ Seeded Founder account: founder@axivon.dev');

  // Seed Tech Co-Founder Account
  const coFounderPasswordHash = await bcrypt.hash(process.env.COFOUNDER_SEED_PASSWORD || "AxivonCoFounder@2024", 10);
  const techCoFounder = await prisma.user.upsert({
    where: { email: "tech.cofounder@axivon.dev" },
    update: {},
    create: {
      email: "tech.cofounder@axivon.dev",
      name: "Tech Co-Founder",
      passwordHash: coFounderPasswordHash,
      department: "Engineering",
      designation: "Co-Founder & CTO",
      status: "ACTIVE",
      organization: { connect: { id: "axivon-org-001" } },
    },
  });

  if (coFounderRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: techCoFounder.id, roleId: coFounderRole.id } },
      update: {},
      create: { userId: techCoFounder.id, roleId: coFounderRole.id },
    });
  }

  await prisma.executiveProfile.upsert({
    where: { userId: techCoFounder.id },
    update: {},
    create: {
      userId: techCoFounder.id,
      responsibilityProfile: "TECHNOLOGY",
      departmentScope: "Engineering,IT",
    },
  });
  console.log('✅ Seeded Tech Co-Founder account: tech.cofounder@axivon.dev');

  // Seed Ops Co-Founder Account
  const opsCoFounder = await prisma.user.upsert({
    where: { email: "ops.cofounder@axivon.dev" },
    update: {},
    create: {
      email: "ops.cofounder@axivon.dev",
      name: "Ops Co-Founder",
      passwordHash: coFounderPasswordHash,
      department: "Operations",
      designation: "Co-Founder & COO",
      status: "ACTIVE",
      organization: { connect: { id: "axivon-org-001" } },
    },
  });

  if (coFounderRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: opsCoFounder.id, roleId: coFounderRole.id } },
      update: {},
      create: { userId: opsCoFounder.id, roleId: coFounderRole.id },
    });
  }

  await prisma.executiveProfile.upsert({
    where: { userId: opsCoFounder.id },
    update: {},
    create: {
      userId: opsCoFounder.id,
      responsibilityProfile: "OPERATIONS",
      departmentScope: "Operations,HR",
    },
  });
  console.log('✅ Seeded Ops Co-Founder account: ops.cofounder@axivon.dev');

  // ─── 8. Seed CRM Pipeline Stages ──────────────────────────────────
  const pipelineStages = [
    { key: "QUALIFIED", name: "Qualified", order: 1, probability: 20, description: "Lead has passed initial qualification criteria" },
    { key: "DISCOVERY", name: "Discovery", order: 2, probability: 40, description: "Technical and business requirement discovery in progress" },
    { key: "PROPOSAL", name: "Proposal", order: 3, probability: 60, description: "Formal technical and commercial proposal submitted" },
    { key: "NEGOTIATION", name: "Negotiation", order: 4, probability: 80, description: "Contract negotiation and pricing discussion" },
    { key: "WON", name: "Closed Won", order: 5, probability: 100, description: "Deal successfully won and converted" },
    { key: "LOST", name: "Closed Lost", order: 6, probability: 0, description: "Deal lost or cancelled" },
  ];

  for (const stage of pipelineStages) {
    await prisma.pipelineStage.upsert({
      where: { key: stage.key },
      update: { name: stage.name, order: stage.order, probability: stage.probability, description: stage.description },
      create: stage,
    });
  }
  console.log('✅ Seeded CRM Pipeline Stages (6 stages)');

  // ─── 9. Seed Default Communication & Email Templates ───────────────
  const defaultTemplates = [
    {
      key: "WELCOME_EMAIL",
      category: "EMAIL",
      name: "Employee Welcome & Account Credentials",
      subject: "Welcome to Axivon Technologies, {{name}}!",
      content: "<p>Hello <strong>{{name}}</strong>,</p><p>Welcome to the Axivon Technologies team. Your portal account has been provisioned.</p><p>Role: {{role}}<br/>Department: {{department}}</p><p>Best regards,<br/>Axivon Operations</p>",
      variables: ["name", "role", "department", "email"],
    },
    {
      key: "TASK_ASSIGNED",
      category: "EMAIL",
      name: "New Task Assignment Notification",
      subject: "New Task Assigned: {{taskTitle}}",
      content: "<p>Hello {{name}},</p><p>You have been assigned a new task: <strong>{{taskTitle}}</strong>.</p><p>Priority: {{priority}}<br/>Due Date: {{dueDate}}</p><p>Please log in to the employee portal to review details.</p>",
      variables: ["name", "taskTitle", "priority", "dueDate"],
    },
    {
      key: "LEAVE_DECISION",
      category: "EMAIL",
      name: "Leave Request Decision Notification",
      subject: "Leave Request {{status}}: {{leaveType}} Leave",
      content: "<p>Hello {{name}},</p><p>Your leave request for <strong>{{leaveType}}</strong> from {{startDate}} to {{endDate}} has been <strong>{{status}}</strong>.</p><p>Notes: {{notes}}</p>",
      variables: ["name", "leaveType", "startDate", "endDate", "status", "notes"],
    },
    {
      key: "LEAD_ASSIGNED",
      category: "EMAIL",
      name: "CRM Lead Assigned Notification",
      subject: "New CRM Lead Assigned: {{leadName}} ({{companyName}})",
      content: "<p>Hello {{ownerName}},</p><p>A new lead <strong>{{leadName}}</strong> from <em>{{companyName}}</em> has been assigned to you in the CRM.</p><p>Service Interest: {{serviceInterest}}<br/>Budget: {{budget}}</p>",
      variables: ["ownerName", "leadName", "companyName", "serviceInterest", "budget"],
    },
    {
      key: "FOLLOWUP_REMINDER",
      category: "EMAIL",
      name: "CRM Follow-up Reminder",
      subject: "Reminder: Follow-up with {{clientName}} is due today",
      content: "<p>Hello {{assigneeName}},</p><p>This is a reminder that your scheduled follow-up with <strong>{{clientName}}</strong> is due at {{dueTime}}.</p><p>Notes: {{notes}}</p>",
      variables: ["assigneeName", "clientName", "dueTime", "notes"],
    },
    {
      key: "IMPORTANT_ANNOUNCEMENT",
      category: "EMAIL",
      name: "Company Announcement Broadcast",
      subject: "[Announcement] {{title}}",
      content: "<h2>{{title}}</h2><p>{{content}}</p><p style='color:#888; font-size:12px;'>Published by Axivon Management on {{publishDate}}</p>",
      variables: ["title", "content", "publishDate"],
    },
    {
      key: "ATTENDANCE_INCOMPLETE_ALERT",
      category: "EMAIL",
      name: "Attendance Incomplete Hours Alert",
      subject: "Axivon Attendance Alert — Required Working Hours Not Completed ({{date}})",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #27272a; border-radius: 12px; background-color: #09090b; color: #f4f4f5;">
          <div style="border-bottom: 1px solid #27272a; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #ef4444; margin: 0 0 6px 0; font-size: 20px;">Attendance Working Hours Notice</h2>
            <p style="margin: 0; color: #a1a1aa; font-size: 13px;">Axivon Technologies Workforce Management System</p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #e4e4e7;">
            Dear <strong>{{employeeName}}</strong> (ID: {{employeeId}}),
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #d4d4d8;">
            Our daily attendance reconciliation for <strong>{{date}}</strong> indicates that your required working hours were not completed within the official company attendance window.
          </p>

          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Company Window:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f4f4f5;">{{companyWindow}}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Required Target:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #60a5fa;">{{requiredHours}}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Net Worked Time:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f59e0b;">{{workedHours}}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Unpaid Break Time:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #a1a1aa;">{{breakHours}}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Shortfall Time:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #ef4444;">{{shortfallHours}}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Check-in / Check-out:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f4f4f5;">{{checkInTime}} → {{checkOutTime}}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #a1a1aa;">Day Status:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f87171;">{{status}}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #a1a1aa;">
            If you experienced an untracked shift, technical issue, or work-related field duty, you may submit an <strong>Attendance Regularization Request</strong> via the Axivon Employee Portal for Admin/Manager review.
          </p>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a;">
            This is an automated system notification from Axivon Technologies internal attendance engine. Please do not reply directly to this email.
          </div>
        </div>
      `,
      variables: [
        "employeeName",
        "employeeId",
        "date",
        "companyWindow",
        "requiredHours",
        "workedHours",
        "breakHours",
        "shortfallHours",
        "checkInTime",
        "checkOutTime",
        "status",
      ],
    },
  ];

  for (const tmpl of defaultTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key: tmpl.key },
      update: { subject: tmpl.subject, htmlBody: tmpl.content, textBody: tmpl.content, variables: tmpl.variables },
      create: { key: tmpl.key, subject: tmpl.subject, htmlBody: tmpl.content, textBody: tmpl.content, variables: tmpl.variables },
    });

    await prisma.communicationTemplate.upsert({
      where: { key: tmpl.key },
      update: { name: tmpl.name, category: tmpl.category, subject: tmpl.subject, content: tmpl.content, variables: tmpl.variables },
      create: { key: tmpl.key, name: tmpl.name, category: tmpl.category, subject: tmpl.subject, content: tmpl.content, variables: tmpl.variables },
    });
  }
  console.log(`✅ Seeded ${defaultTemplates.length} default communication & email templates`);

  // ─── 10. Seed Default Attendance Policy ──────────────────────────
  const policy = await prisma.attendancePolicy.findFirst();
  if (!policy) {
    await prisma.attendancePolicy.create({
      data: {
        workWindowStart: "08:00",
        workWindowEnd: "19:00",
        defaultRequiredMinutes: 480, // 8 Hours
        graceMinutes: 15,
        cutoffTime: "19:00",
        weeklyOffDays: [0], // Sunday
        enableIncompleteAlerts: true,
        allowRemoteRegularization: true,
      },
    });
    console.log('✅ Seeded Default Attendance Policy (08:00 AM - 07:00 PM, 480 mins)');
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
