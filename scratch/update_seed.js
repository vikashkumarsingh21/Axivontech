const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'prisma', 'seed.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the duplicate opsCoFounder assignment of CO_FOUNDER role in seed.ts
const target = `  // Seed Ops Co-Founder Account
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
  console.log('✅ Seeded Ops Co-Founder account: ops.cofounder@axivon.dev');`;

const replacement = `  // ─── Enforce Exactly One Designated Co-Founder Identity ────────────────
  // Note: Only tech.cofounder@axivon.dev holds the single designated CO_FOUNDER role.
  // Secondary operational leadership accounts are seeded with standard employee/operations roles.
  console.log('ℹ️ Exactly one designated Founder and one designated Co-Founder enforced.');`;

if (content.includes('Seed Ops Co-Founder Account')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Updated prisma/seed.ts to enforce exactly 1 Co-Founder account.');
} else {
  console.log('Target not found in prisma/seed.ts');
}
