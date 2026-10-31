import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const isExecute = process.argv.includes("--execute");

  console.log("==================================================================");
  console.log(" AXIVON TECHNOLOGIES — ATTENDANCE BACKFILL: MISSED CHECK-OUTS");
  console.log("==================================================================");
  console.log(`Mode: ${isExecute ? "🚨 LIVE EXECUTION" : "🛡️ DRY-RUN (No changes will be written)"}`);
  console.log(`Database Host: ${process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : "Unknown"}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("------------------------------------------------------------------");

  const now = new Date();
  // Company day boundary in Asia/Kolkata
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now);
  const [year, month, day] = todayStr.split("-").map(Number);
  const todayCalendarDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  console.log(`Company Timezone: Asia/Kolkata`);
  console.log(`Current Calendar Date: ${todayStr}`);
  console.log(`Querying records strictly older than: ${todayCalendarDate.toISOString().split("T")[0]}`);
  console.log("------------------------------------------------------------------");

  const staleRecords = await prisma.attendance.findMany({
    where: {
      date: { lt: todayCalendarDate },
      checkOutAt: null,
      status: { not: "MISSED_CHECKOUT" },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          department: true,
        },
      },
      breaks: true,
    },
    orderBy: { date: "asc" },
  });

  console.log(`Found ${staleRecords.length} unclosed attendance record(s) from past days.\n`);

  if (staleRecords.length === 0) {
    console.log("✅ Zero unclosed past records found. All historical attendance records are cleanly closed.");
    return;
  }

  staleRecords.forEach((rec, idx) => {
    const sessionDateStr = rec.date.toISOString().split("T")[0];
    const checkInStr = rec.checkInAt ? rec.checkInAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "None";
    const openBreaks = rec.breaks.filter((b) => !b.endTime);

    console.log(
      `[${idx + 1}/${staleRecords.length}] Record ID: ${rec.id}`
    );
    console.log(`   Employee: ${rec.user?.name} (${rec.user?.email}) [Dept: ${rec.user?.department || "General"}]`);
    console.log(`   Session Date: ${sessionDateStr} | Check-In Time: ${checkInStr}`);
    console.log(`   Current Status: ${rec.status} | Check-Out: ${rec.checkOutAt ?? "NULL"}`);
    console.log(`   Open Breaks to Close: ${openBreaks.length}`);
    console.log(`   Action to take: Set status = 'MISSED_CHECKOUT', autoClosedAt = now(), checkOutAt = NULL, netMinutes = NULL`);
    console.log("");
  });

  if (!isExecute) {
    console.log("------------------------------------------------------------------");
    console.log("🛡️ DRY-RUN COMPLETE. No records were modified.");
    console.log("To execute this update for real after receiving user approval, re-run with: --execute");
    console.log("------------------------------------------------------------------");
    return;
  }

  console.log("------------------------------------------------------------------");
  console.log("🚨 EXECUTING LIVE DATABASE UPDATES...");
  console.log("------------------------------------------------------------------");

  let updatedCount = 0;
  for (const rec of staleRecords) {
    // 1. Close open breaks
    for (const b of rec.breaks) {
      if (!b.endTime) {
        await prisma.attendanceBreak.update({
          where: { id: b.id },
          data: {
            endTime: now,
            isAutoClosed: true,
            autoClosedAt: now,
            notes: b.notes ? `${b.notes} | [Backfilled Missed Check-Out]` : "[Backfilled Missed Check-Out]",
          },
        });
      }
    }

    // 2. Close attendance
    await prisma.attendance.update({
      where: { id: rec.id },
      data: {
        status: "MISSED_CHECKOUT",
        completionStatus: "MISSED_CHECKOUT",
        autoClosedAt: now,
        checkOutAt: null,
        grossMinutes: null,
        netMinutes: null,
        totalMinutes: null,
        remainingMinutes: null,
      },
    });

    updatedCount++;
    console.log(`✅ Closed record ${rec.id} for ${rec.user?.email}`);
  }

  console.log("\n==================================================================");
  console.log(`🎉 BACKFILL COMPLETED. Successfully closed ${updatedCount} record(s).`);
  console.log("==================================================================");
}

main()
  .catch((e) => {
    console.error("Backfill failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
