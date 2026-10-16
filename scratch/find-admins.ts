import { db } from "../src/lib/db";

async function findAdmins() {
  try {
    const adminRoles = await db.userRole.findMany({
      where: {
        role: {
          name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] },
        },
      },
      include: {
        user: true,
        role: true,
      },
    });
    console.log("Admin/Founder Users:", JSON.stringify(adminRoles.map(ar => ({
      userId: ar.userId,
      email: ar.user.email,
      name: ar.user.name,
      role: ar.role.name,
    })), null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.$disconnect();
  }
}

findAdmins();
