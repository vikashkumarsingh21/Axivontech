import { PrismaClient as CoreClient } from "@prisma/client/core";
import { PrismaClient as ClientClient } from "@prisma/client/client";
import { PrismaClient as EmployeeClient } from "@prisma/client/employee";
import { PrismaClient as BrokerClient } from "@prisma/client/broker";
import fs from "fs";

async function runOrphanCheck() {
  console.log("🔍 Starting Phase 2 Orphan & Reference Integrity Check");
  const coreDb = new CoreClient({ datasourceUrl: process.env.CORE_DATABASE_URL });
  const clientDb = new ClientClient({ datasourceUrl: process.env.CLIENT_DATABASE_URL });
  const employeeDb = new EmployeeClient({ datasourceUrl: process.env.EMPLOYEE_DATABASE_URL });
  const brokerDb = new BrokerClient({ datasourceUrl: process.env.BROKER_DATABASE_URL });

  const errors: any[] = [];

  try {
    // Check 1: Employee.Task.partnerProjectId -> Client.PartnerProject.id
    console.log("Checking Task -> PartnerProject references...");
    const tasks = await employeeDb.task.findMany({ where: { partnerProjectId: { not: null } }});
    for (const task of tasks) {
      if (task.partnerProjectId) {
        const proj = await clientDb.partnerProject.findUnique({ where: { id: task.partnerProjectId }});
        if (!proj) {
          errors.push({ type: "ORPHAN_REFERENCE", source: "Employee.Task", id: task.id, missingRef: "Client.PartnerProject", refId: task.partnerProjectId });
        }
      }
    }

    // Check 2: Broker.Commission.partnerProjectId -> Client.PartnerProject.id
    console.log("Checking Commission -> PartnerProject references...");
    const commissions = await brokerDb.commission.findMany();
    for (const comm of commissions) {
      const proj = await clientDb.partnerProject.findUnique({ where: { id: comm.partnerProjectId }});
      if (!proj) {
        errors.push({ type: "ORPHAN_REFERENCE", source: "Broker.Commission", id: comm.id, missingRef: "Client.PartnerProject", refId: comm.partnerProjectId });
      }
    }

    // Check 3: Cross-DB userId references (e.g., Client.PartnerProjectMember -> Core.User)
    console.log("Checking ProjectMember -> User references...");
    const members = await clientDb.partnerProjectMember.findMany();
    for (const m of members) {
      const user = await coreDb.user.findUnique({ where: { id: m.userId }});
      if (!user) {
        errors.push({ type: "ORPHAN_REFERENCE", source: "Client.PartnerProjectMember", id: m.id, missingRef: "Core.User", refId: m.userId });
      }
    }

    fs.writeFileSync("migration/migration-reference-integrity.json", JSON.stringify(errors, null, 2));
    
    if (errors.length > 0) {
      console.error(`❌ Found ${errors.length} orphan references. Staging Validation FAILED.`);
    } else {
      console.log("✅ Zero orphan references found. Staging Validation PASSED.");
    }
    
  } finally {
    await coreDb.$disconnect();
    await clientDb.$disconnect();
    await employeeDb.$disconnect();
    await brokerDb.$disconnect();
  }
}

runOrphanCheck().catch(console.error);
