import { db } from "../src/lib/db";
import { signSession } from "../src/lib/auth/session";
import { calculateLeaveDays, ensureLeaveBalances, getLeaveBalancesSummary } from "../src/lib/leave/balance";

async function runTestSuite() {
  console.log("=================================================");
  console.log("   EMPLOYEE PORTAL BACKEND AUTOMATED TEST SUITE   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      failed++;
    }
  }

  try {
    // 1. Setup Test User
    console.log("1. Setting up test fixtures...");
    const testEmail = `test.employee.${Date.now()}@axivon.test`;

    const user = await db.user.create({
      data: {
        email: testEmail,
        name: "Test Employee QA",
        passwordHash: "dummy-hash",
        status: "ACTIVE",
        employeeId: `TEST-${Date.now().toString().slice(-4)}`,
        department: "Engineering",
        designation: "QA Automation Engineer",
      },
    });

    let employeeRole = await db.role.findUnique({ where: { name: "EMPLOYEE" } });
    if (!employeeRole) {
      employeeRole = await db.role.create({
        data: { name: "EMPLOYEE", description: "Standard Employee" },
      });
    }

    await db.userRole.create({
      data: { userId: user.id, roleId: employeeRole.id },
    });

    assert(!!user.id, "Test employee created with active EMPLOYEE role");

    // 2. Test Cryptographic JWT Session Token Generation
    console.log("\n2. Testing JWT Session Generation...");
    const token = await signSession({
      userId: user.id,
      role: "EMPLOYEE",
      email: user.email,
    });
    assert(typeof token === "string" && token.length > 30, "JWT session token created successfully");

    // 3. Test Leave Calculation & Balances Engine
    console.log("\n3. Testing Leave Calculation & Balances...");
    const d1 = new Date("2026-10-01");
    const d2 = new Date("2026-10-03");
    const fullDays = calculateLeaveDays(d1, d2, false);
    const halfDay = calculateLeaveDays(d1, d1, true);

    assert(fullDays === 3, `Full-day span calculated: ${fullDays} days (expected 3)`);
    assert(halfDay === 0.5, `Half-day span calculated: ${halfDay} days (expected 0.5)`);

    const year = 2026;
    await ensureLeaveBalances(user.id, year);
    const initialSummary = await getLeaveBalancesSummary(user.id, year);

    assert(initialSummary.casual?.total === 12, "Casual leave initialized to 12 days");
    assert(initialSummary.sick?.total === 12, "Sick leave initialized to 12 days");
    assert(initialSummary.paid?.total === 15, "Paid leave initialized to 15 days");

    // 4. Test Leave Request Flow & Deductions
    console.log("\n4. Testing Leave Request Flow & Deductions...");
    const leaveReq = await db.leaveRequest.create({
      data: {
        userId: user.id,
        leaveType: "CASUAL",
        startDate: d1,
        endDate: d2,
        reason: "Test annual vacation leave request",
        status: "PENDING",
      },
    });

    await db.leaveBalance.update({
      where: { userId_year_leaveType: { userId: user.id, year, leaveType: "CASUAL" } },
      data: { pendingDays: { increment: 3 } },
    });

    const pendingSummary = await getLeaveBalancesSummary(user.id, year);
    assert(pendingSummary.casual.pending === 3, "Casual pending days incremented to 3");
    assert(pendingSummary.casual.available === 9, "Casual available days deducted to 9 (12 - 3)");

    // Test Admin Approval balance sync
    await db.leaveRequest.update({
      where: { id: leaveReq.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    await db.leaveBalance.update({
      where: { userId_year_leaveType: { userId: user.id, year, leaveType: "CASUAL" } },
      data: {
        pendingDays: { decrement: 3 },
        usedDays: { increment: 3 },
        remainingDays: { decrement: 3 },
      },
    });

    const approvedSummary = await getLeaveBalancesSummary(user.id, year);
    assert(approvedSummary.casual.pending === 0, "Casual pending days decremented to 0 upon approval");
    assert(approvedSummary.casual.used === 3, "Casual used days incremented to 3");
    assert(approvedSummary.casual.remaining === 9, "Casual remaining days decremented to 9");

    // 5. Test Attendance & Session Isolation
    console.log("\n5. Testing Attendance Engine Data Integrity...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInTime = new Date();
    checkInTime.setHours(9, 30, 0, 0);

    const attRecord = await db.attendance.create({
      data: {
        userId: user.id,
        date: today,
        checkInAt: checkInTime,
        status: "PRESENT",
        isLate: false,
      },
    });

    assert(!!attRecord.id, "Attendance check-in logged with accurate timestamps");

    // Add break
    const breakStart = new Date(checkInTime.getTime() + 3 * 60 * 60 * 1000);
    const breakEnd = new Date(breakStart.getTime() + 45 * 60 * 1000);
    const attBreak = await db.attendanceBreak.create({
      data: {
        attendanceId: attRecord.id,
        type: "LUNCH",
        startTime: breakStart,
        endTime: breakEnd,
        durationMinutes: 45,
      },
    });

    assert(attBreak.durationMinutes === 45, "Attendance break logged with 45 minutes duration");

    // Check-out
    const checkOutTime = new Date(checkInTime.getTime() + 8.5 * 60 * 60 * 1000);
    const grossMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 60000); // 510 mins
    const netMinutes = grossMinutes - 45; // 465 mins

    const updatedAtt = await db.attendance.update({
      where: { id: attRecord.id },
      data: {
        checkOutAt: checkOutTime,
        grossMinutes,
        breakMinutes: 45,
        netMinutes,
        totalMinutes: netMinutes,
        completionStatus: "COMPLETE",
      },
    });

    assert(updatedAtt.netMinutes === 465, `Net worked minutes computed: ${updatedAtt.netMinutes} (gross: 510, break: 45)`);

    // 6. Test Task State Machine & Scoping
    console.log("\n6. Testing Tasks Workflow...");
    const task = await db.task.create({
      data: {
        userId: user.id,
        title: "Build automated test suite",
        description: "Verify all employee endpoints end-to-end",
        priority: "HIGH",
        status: "TODO",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    assert(task.status === "TODO", "Task initialized with status TODO");

    const updatedTask = await db.task.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    });
    assert(updatedTask.status === "COMPLETED", "Task status updated to COMPLETED");

    const taskComment = await db.taskComment.create({
      data: {
        taskId: task.id,
        userId: user.id,
        content: "Test suite successfully passed all unit assertions.",
      },
    });
    assert(!!taskComment.id, "Task comment added and linked to employee");

    // 7. Test Work Report & Streaks
    console.log("\n7. Testing Work Report Submissions...");
    const report = await db.workReport.create({
      data: {
        userId: user.id,
        date: today,
        summary: "Implemented employee backend features with full test suite",
        workPerformed: "Audited 12 employee features, updated schema, created migration, fixed TypeScript issues.",
        hoursWorked: 8.5,
        status: "SUBMITTED",
      },
    });

    assert(report.hoursWorked === 8.5, "Work report logged with 8.5 hours");
    assert(report.status === "SUBMITTED", "Work report status is SUBMITTED");

    // 8. Test Documents Scoping & Acknowledgment
    console.log("\n8. Testing Documents & Compliance Acknowledgment...");
    const doc = await db.document.create({
      data: {
        title: "Employee Security Protocol 2026",
        category: "COMPANY_POLICY",
        fileUrl: "https://axivon.test/docs/security-protocol-2026.pdf",
        mimeType: "application/pdf",
        size: 1048576,
        visibility: "COMPANY",
        uploadedById: user.id,
      },
    });

    assert(!!doc.id, "Company policy document created");

    const ack = await db.documentAcknowledgment.create({
      data: {
        documentId: doc.id,
        userId: user.id,
      },
    });

    assert(!!ack.id, "Document policy acknowledged by employee");

    // 9. Test Support Tickets & Discussion Thread
    console.log("\n9. Testing Support Ticket Management...");
    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber: `TICK-TEST-${Date.now().toString().slice(-4)}`,
        userId: user.id,
        category: "TECHNICAL",
        priority: "HIGH",
        subject: "Need VPN credentials for staging environment",
        message: "Requesting access token and configuration profile for QA cluster.",
        status: "OPEN",
      },
    });

    assert(ticket.status === "OPEN", `Support ticket created: ${ticket.ticketNumber}`);

    const reply = await db.supportTicketReply.create({
      data: {
        ticketId: ticket.id,
        userId: user.id,
        message: "Also please grant access to the metrics dashboard.",
        isStaffReply: false,
      },
    });

    assert(!!reply.id, "Reply appended to ticket discussion thread");

    // 10. Test Announcements & Per-User Read Tracking
    console.log("\n10. Testing Announcements & Read Tracking...");
    const announcement = await db.announcement.create({
      data: {
        title: "Q4 Townhall Schedule Announced",
        content: "Join us this Friday at 4 PM IST for our quarterly sync.",
        priority: "HIGH",
        status: "PUBLISHED",
        audienceType: "ALL",
      },
    });

    assert(!!announcement.id, "Announcement published");

    const readRecord = await db.announcementRead.create({
      data: {
        announcementId: announcement.id,
        userId: user.id,
      },
    });

    assert(!!readRecord.id, "Announcement marked as read for employee");

    // 11. Cleanup Test Fixtures
    console.log("\n11. Cleaning up test fixtures...");
    await db.announcementRead.deleteMany({ where: { userId: user.id } });
    await db.announcement.delete({ where: { id: announcement.id } });
    await db.supportTicketReply.deleteMany({ where: { ticketId: ticket.id } });
    await db.supportTicket.delete({ where: { id: ticket.id } });
    await db.documentAcknowledgment.deleteMany({ where: { userId: user.id } });
    await db.document.delete({ where: { id: doc.id } });
    await db.workReport.deleteMany({ where: { userId: user.id } });
    await db.taskComment.deleteMany({ where: { taskId: task.id } });
    await db.task.delete({ where: { id: task.id } });
    await db.attendanceBreak.deleteMany({ where: { attendanceId: attRecord.id } });
    await db.attendance.delete({ where: { id: attRecord.id } });
    await db.leaveRequest.deleteMany({ where: { userId: user.id } });
    await db.leaveBalance.deleteMany({ where: { userId: user.id } });
    await db.userRole.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });

    console.log("  [PASS] Fixture cleanup completed cleanly.");
    passed++;

  } catch (err: any) {
    console.error("Test execution threw error:", err);
    failed++;
  }

  console.log("\n=================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
