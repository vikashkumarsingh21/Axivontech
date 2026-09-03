const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../prisma/seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

const phase4Permissions = [
  // Executive
  { name: "executive.dashboard.view", description: "View executive dashboard" },
  { name: "executive.company.view", description: "View company overview" },
  { name: "executive.analytics.view", description: "View executive analytics" },

  // People
  { name: "people.view", description: "View executive people directory" },
  { name: "people.sensitive.view", description: "View sensitive employee HR info" },
  { name: "people.manage", description: "Executive management of people" },
  { name: "people.role.manage", description: "Manage high-privilege user roles" },

  // Operations Company-Wide
  { name: "attendance.company.view", description: "View company-wide attendance" },
  { name: "leave.company.view", description: "View company-wide leave" },
  { name: "work_reports.company.view", description: "View company-wide work reports" },
  { name: "tasks.company.view", description: "View company-wide tasks" },
  { name: "projects.company.view", description: "View company-wide projects" },

  // Governance
  { name: "governance.role_changes.approve", description: "Approve high-privilege role changes" },
  { name: "governance.settings.approve", description: "Approve organizational setting changes" },
  { name: "governance.audit.view", description: "View governance audit log" },
  { name: "governance.security.view", description: "View governance security events" },

  // Reports
  { name: "reports.executive.view", description: "View executive reports" },
  { name: "reports.executive.export", description: "Export executive reports" },
  { name: "reports.sensitive.export", description: "Export sensitive executive reports" },
];

// Add permissions to permissionDefinitions array
const newPermsCode = phase4Permissions.map(p => `    { name: "${p.name}", description: "${p.description}" },`).join('\n');
content = content.replace('    // Admin\n    { name: "admin:access", description: "Access admin panel" },\n    { name: "admin:settings", description: "Manage platform settings" },', `    // Admin\n    { name: "admin:access", description: "Access admin panel" },\n    { name: "admin:settings", description: "Manage platform settings" },\n\n    // Phase 4 Executive Permissions\n${newPermsCode}`);

// Add Founder & Co-Founder seeding at end of main()
const executiveSeedCode = `
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
`;

content = content.replace("  console.log('Seeded Admin account: admin@axivon.dev');", "  console.log('Seeded Admin account: admin@axivon.dev');\n" + executiveSeedCode);

fs.writeFileSync(seedPath, content);
console.log("Updated seed.ts with Phase 4 permissions and executive accounts.");
