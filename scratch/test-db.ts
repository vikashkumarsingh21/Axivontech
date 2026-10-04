import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function test() {
  try {
    const count = await db.businessPartnerApplication.count();
    console.log("Count:", count);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await db.$disconnect();
  }
}

test();
