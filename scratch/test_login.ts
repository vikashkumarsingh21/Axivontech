import { db } from "../src/lib/db";
import { verifyPassword } from "../src/lib/auth/password";

async function testAccounts() {
  const accounts = [
    { email: "admin@axivon.dev", pass: "AxivonAdmin@2024" },
    { email: "founder@axivon.dev", pass: "AxivonFounder@2024" },
    { email: "tech.cofounder@axivon.dev", pass: "AxivonCoFounder@2024" },
    { email: "ops.cofounder@axivon.dev", pass: "AxivonCoFounder@2024" },
    { email: "testemployee@axivon.dev", pass: "AxivonTest@2024" },
  ];

  console.log("Testing database user login verification...\n");

  for (const acc of accounts) {
    const user = await db.user.findUnique({
      where: { email: acc.email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      console.log(`❌ User NOT FOUND: ${acc.email}`);
      continue;
    }

    const isValid = await verifyPassword(acc.pass, user.passwordHash);
    const roles = user.userRoles.map((ur) => ur.role.name).join(", ");
    console.log(`User: ${acc.email} | Found: YES | Pass Match: ${isValid ? "✅ YES" : "❌ NO"} | Roles: [${roles}]`);
  }
}

testAccounts()
  .catch(console.error)
  .finally(() => db.$disconnect());
