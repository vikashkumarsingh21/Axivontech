import { db } from "../src/lib/db";

async function checkMantra() {
  try {
    const user = await db.user.findFirst({
      where: { email: "mantrakhandelwaljee@gmail.com" },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
    console.log("Mantra user:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.$disconnect();
  }
}

checkMantra();
