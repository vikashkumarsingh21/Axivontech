import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const brokerPermissions = [
    { name: "broker:profile", description: "View and update broker profile" },
    { name: "broker:leads", description: "View own leads" },
    { name: "broker:projects", description: "View own projects" },
  ];

  console.log("Seeding Broker Permissions...");
  
  for (const p of brokerPermissions) {
    await db.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  let role = await db.role.findUnique({ where: { name: "BROKER" } });
  if (!role) {
    role = await db.role.create({
      data: { name: "BROKER", description: "External Referral Partner" },
    });
  }

  const allPerms = await db.permission.findMany({
    where: { name: { in: brokerPermissions.map((p) => p.name) } },
  });

  for (const perm of allPerms) {
    await db.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
