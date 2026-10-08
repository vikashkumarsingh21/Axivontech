import { PrismaClient as MonolithClient } from "@prisma/client";
import { PrismaClient as CoreClient } from "@prisma/client/core";
import { PrismaClient as ClientClient } from "@prisma/client/client";
import { PrismaClient as EmployeeClient } from "@prisma/client/employee";
import { PrismaClient as BrokerClient } from "@prisma/client/broker";
import { modelOwnership, BATCH_SIZE } from "./config";
import fs from "fs";

// Initialize clients
const monolithDb = new MonolithClient({ datasourceUrl: process.env.SOURCE_DATABASE_URL });
const coreDb = new CoreClient({ datasourceUrl: process.env.CORE_DATABASE_URL });
const clientDb = new ClientClient({ datasourceUrl: process.env.CLIENT_DATABASE_URL });
const employeeDb = new EmployeeClient({ datasourceUrl: process.env.EMPLOYEE_DATABASE_URL });
const brokerDb = new BrokerClient({ datasourceUrl: process.env.BROKER_DATABASE_URL });

const dbs = {
  CORE: coreDb,
  CLIENT: clientDb,
  EMPLOYEE: employeeDb,
  BROKER: brokerDb,
};

async function runMigration() {
  console.log("🚀 Starting AXIVON ONE Multi-Database Phase 2 ETL");

  const results = [];
  const start = Date.now();

  for (const [modelName, targetDbName] of Object.entries(modelOwnership)) {
    console.log(`\n📦 Migrating ${modelName} to ${targetDbName} DB`);
    const targetDb = dbs[targetDbName as keyof typeof dbs];
    
    // Using uncapitalized model name for Prisma client property
    const prismaProp = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    
    try {
      // @ts-ignore
      const count = await monolithDb[prismaProp].count();
      console.log(`   Found ${count} records.`);

      if (count === 0) {
        results.push({ model: modelName, source: 0, target: 0, status: "PASS (Empty)" });
        continue;
      }

      let processed = 0;
      while (processed < count) {
        // @ts-ignore
        const records = await monolithDb[prismaProp].findMany({
          skip: processed,
          take: BATCH_SIZE,
        });

        // Strip Prisma relations safely (exclude objects/arrays when sending to createMany)
        const cleanRecords = records.map((record: any) => {
           const clean: any = {};
           for (const key in record) {
              if (typeof record[key] !== 'object' || record[key] === null || record[key] instanceof Date) {
                 clean[key] = record[key];
              }
           }
           return clean;
        });

        // @ts-ignore
        await targetDb[prismaProp].createMany({
          data: cleanRecords,
          skipDuplicates: true, // Idempotency
        });

        processed += records.length;
        console.log(`   -> Copied ${processed}/${count}`);
      }
      
      // @ts-ignore
      const targetCount = await targetDb[prismaProp].count();
      
      results.push({
        model: modelName,
        source: count,
        target: targetCount,
        status: count === targetCount ? "PASS" : "FAIL_MISMATCH",
      });

    } catch (err: any) {
      console.error(`❌ Failed to migrate ${modelName}:`, err.message);
      results.push({ model: modelName, source: -1, target: -1, status: "ERROR" });
    }
  }

  const duration = (Date.now() - start) / 1000;
  console.log(`\n✅ Migration pipeline finished in ${duration}s`);
  
  fs.writeFileSync("migration/migration-counts.json", JSON.stringify(results, null, 2));
  console.log("📊 Results saved to migration/migration-counts.json");
}

runMigration().catch(console.error).finally(async () => {
  await monolithDb.$disconnect();
  await coreDb.$disconnect();
  await clientDb.$disconnect();
  await employeeDb.$disconnect();
  await brokerDb.$disconnect();
});
