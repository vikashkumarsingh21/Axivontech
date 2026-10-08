import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.staging" });

async function checkConnection(name: string, url: string | undefined) {
  if (!url) {
    console.log(`${name}: BLOCKED (No URL)`);
    return false;
  }
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    await prisma.$connect();
    console.log(`${name}: REACHABLE`);
    await prisma.$disconnect();
    return true;
  } catch (e: any) {
    console.log(`${name}: BLOCKED`);
    return false;
  }
}

async function main() {
  console.log("Testing DB Connectivity...");
  await checkConnection("SOURCE", process.env.SOURCE_DATABASE_URL);
  await checkConnection("CORE", process.env.CORE_DATABASE_URL);
  await checkConnection("CLIENT", process.env.CLIENT_DATABASE_URL);
  await checkConnection("EMPLOYEE", process.env.EMPLOYEE_DATABASE_URL);
  await checkConnection("BROKER", process.env.BROKER_DATABASE_URL);
}

main();
