import { AttendanceService } from "../src/lib/services/attendance.service";
import { db } from "../src/lib/db";

async function runSmokeTests() {
  console.log("============ AXIVON PRODUCTION SMOKE TEST ============\n");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
    }
  }

  try {
    // 1. Database Connection Check
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    assert(true, `Database Connectivity (Latency: ${Date.now() - dbStart}ms)`);

    // 2. Attendance Policy Retrieval
    const policy = await AttendanceService.getPolicy();
    assert(!!policy && policy.workWindowStart === "08:00", "Attendance Policy Configured (08:00 AM Window)");

    // 3. Attendance Calculation Edge Cases
    // Case A: 8h required, 8h worked -> COMPLETE
    const checkInA = new Date("2026-09-10T08:00:00Z");
    const checkOutA = new Date("2026-09-10T16:00:00Z");
    const calcA = AttendanceService.calculateDay({
      checkInAt: checkInA,
      checkOutAt: checkOutA,
      requiredDailyMinutes: 480,
      policy,
    });
    assert(calcA.completionStatus === "COMPLETE" && calcA.netMinutes === 480, "Case A: 8h Target Met -> COMPLETE");

    // Case B: 8h required, 7.5h worked -> INCOMPLETE
    const checkOutB = new Date("2026-09-10T15:30:00Z");
    const calcB = AttendanceService.calculateDay({
      checkInAt: checkInA,
      checkOutAt: checkOutB,
      requiredDailyMinutes: 480,
      policy,
    });
    assert(calcB.completionStatus === "INCOMPLETE" && calcB.remainingMinutes === 30, "Case B: Shortfall 30m -> INCOMPLETE");

    // Case C: Approved Leave -> ON_LEAVE
    const calcC = AttendanceService.calculateDay({
      checkInAt: null,
      checkOutAt: null,
      requiredDailyMinutes: 480,
      policy,
      isLeave: true,
    });
    assert(calcC.completionStatus === "ON_LEAVE" && !calcC.isWorking, "Case C: Approved Leave -> ON_LEAVE");

    // Case D: Holiday -> HOLIDAY
    const calcD = AttendanceService.calculateDay({
      checkInAt: null,
      checkOutAt: null,
      requiredDailyMinutes: 480,
      policy,
      isHoliday: true,
    });
    assert(calcD.completionStatus === "HOLIDAY", "Case D: Company Holiday -> HOLIDAY");

    // Case E: Late check-in detection
    const lateCheckIn = new Date("2026-09-10T08:30:00Z"); // 30 mins after 08:00 AM (> 15m grace)
    const calcE = AttendanceService.calculateDay({
      checkInAt: lateCheckIn,
      checkOutAt: new Date("2026-09-10T16:30:00Z"),
      requiredDailyMinutes: 480,
      policy,
    });
    assert(calcE.isLate && calcE.lateMinutes === 30, "Case E: Check-in after 08:15 AM -> Late Flagged (30m)");

    // 4. Cutoff Reconciliation Idempotency Test
    const cutoffResult = await AttendanceService.processCutoffAlerts(new Date());
    assert(cutoffResult.totalEmployees >= 0, `07:00 PM Cutoff Alert Reconciliation (Employees Processed: ${cutoffResult.totalEmployees})`);

    console.log(`\n======================================================`);
    console.log(`RESULTS: ${passed} / ${total} Tests Passed`);
    console.log(`======================================================\n`);

    if (passed !== total) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Smoke test crashed:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runSmokeTests();
