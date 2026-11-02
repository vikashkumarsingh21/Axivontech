import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const emails = [
    "admin@axivon.dev",
    "founder@axivon.dev",
    "tech.cofounder@axivon.dev",
    "qa.employee@axivon.dev",
    "qa.broker@axivon.dev",
    "qa.client@axivon.dev",
  ];
  for (const email of emails) {
    const u = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
    if (u) {
      console.log("User found:", email, "Roles:", u.userRoles.map((r) => r.role.name).join(","), "Status:", u.status);
    } else {
      console.log("User NOT found:", email);
    }
  }
  await prisma.$disconnect();
}

check().catch(console.error);
