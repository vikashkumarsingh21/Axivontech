import { db } from "../src/lib/db";

async function listUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
    console.log("Users:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.$disconnect();
  }
}

listUsers();
