import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const existing = await db.user.findUnique({
    where: { email: "suspended.user@axivon.dev" },
  });

  if (!existing) {
    const passwordHash = await hashPassword("AxivonSuspended@2024");
    const user = await db.user.create({
      data: {
        email: "suspended.user@axivon.dev",
        name: "Suspended Test User",
        passwordHash,
        status: "SUSPENDED",
        userRoles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: "EMPLOYEE" },
                create: { name: "EMPLOYEE" },
              },
            },
          },
        },
      },
    });
    console.log("Created suspended user:", user.email);
  } else {
    await db.user.update({
      where: { email: "suspended.user@axivon.dev" },
      data: { status: "SUSPENDED" },
    });
    console.log("Updated suspended user:", existing.email);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
