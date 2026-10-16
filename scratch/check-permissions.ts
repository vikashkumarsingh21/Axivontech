import { db } from "../src/lib/db";

async function checkPerms() {
  try {
    const perms = await db.permission.findMany();
    console.log("Permissions count:", perms.length);
    console.log("admin:access exists?", perms.some(p => p.name === "admin:access"));
    console.log("All permission names:", perms.map(p => p.name));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.$disconnect();
  }
}

checkPerms();
