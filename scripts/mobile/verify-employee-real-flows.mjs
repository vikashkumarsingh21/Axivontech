import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = path.resolve("./docs/mobile/screenshots/real-flows");
const ARTIFACT_DIR = "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return true;
    } catch (e) {}
    await sleep(500);
  }
  throw new Error(`Server at ${url} failed to start within ${timeoutMs}ms`);
}

const EMPLOYEE_CRED = { email: "qa.employee@axivon.dev", pass: "AxivonEmployee@2024" };
const UA_PIXEL7_APP =
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 AxivonApp/1.0.0";

async function main() {
  console.log("================================================================================");
  console.log("     REAL MOBILE EMPLOYEE FLOWS IN PIXEL 7 EMULATION WITH DB VERIFICATION       ");
  console.log("================================================================================");

  let localEnv = {};
  if (fs.existsSync(".env.local")) {
    const lines = fs.readFileSync(".env.local", "utf8").split("\n");
    for (const l of lines) {
      const [k, ...v] = l.trim().split("=");
      if (k && v.length) {
        localEnv[k] = v.join("=");
      }
    }
  }

  const serverEnv = {
    ...process.env,
    ...localEnv,
    NODE_ENV: "production",
    TEST_MODE: "true",
    APP_MODE_ENABLED: "true",
    PORT: String(PORT),
  };

  console.log("Starting Next.js production server with APP_MODE_ENABLED=true...");
  const serverProcess = spawn("npx.cmd", ["next", "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    env: serverEnv,
    stdio: "inherit",
    shell: true,
  });

  const flowResults = [];

  try {
    await waitForServer(BASE_URL);
    console.log(`✅ Production server online at ${BASE_URL}\n`);

    // Lookup user in DB
    const user = await db.user.findUnique({ where: { email: EMPLOYEE_CRED.email } });
    if (!user) throw new Error(`User ${EMPLOYEE_CRED.email} not found in database`);
    console.log(`Test Employee User ID: ${user.id} (${user.name})`);

    // Authenticate
    console.log("Authenticating employee credentials...");
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-mode": "true",
        "x-forwarded-for": "127.0.0.50",
      },
      body: JSON.stringify({
        email: EMPLOYEE_CRED.email,
        password: EMPLOYEE_CRED.pass,
        captchaToken: "1x00000000000000000000AA",
      }),
    });
    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    const match = cookieHeader.match(/axivon_session=([^;]+)/);
    if (!match) throw new Error(`Login failed with HTTP ${loginRes.status}`);
    const sessionToken = match[1];
    console.log("✓ Authenticated successfully, session cookie acquired\n");

    // Clean any prior attendance session for this user created today
    const attendanceBefore = await db.attendance.findFirst({
      where: { userId: user.id },
      orderBy: { checkInAt: "desc" },
    });
    if (attendanceBefore) {
      await db.attendanceBreak.deleteMany({ where: { attendanceId: attendanceBefore.id } });
      await db.attendance.delete({ where: { id: attendanceBefore.id } });
      console.log(`Cleaned previous attendance record (${attendanceBefore.id}) for fresh test lifecycle.`);
    }

    // Launch Pixel 7 Emulation
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 412,
      height: 915,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2.625,
    });
    await page.setUserAgent(UA_PIXEL7_APP);

    await page.setCookie({
      name: "axivon_session",
      value: sessionToken,
      domain: "127.0.0.1",
      path: "/",
    });

    // -------------------------------------------------------------------------
    // FLOW 1: CHECK-IN
    // -------------------------------------------------------------------------
    console.log("\n--- FLOW 1: CHECK-IN ---");
    await page.goto(`${BASE_URL}/employee/dashboard`, { waitUntil: "networkidle0" });
    await sleep(2000);

    const checkinBtn = await page.waitForSelector("button ::-p-text(Check In Now)", { timeout: 8000 });
    await checkinBtn.click();
    console.log("Clicked 'Check In Now' button");

    // Wait for checked-in state
    await page.waitForFunction(
      () => document.body.innerText.includes("Checked In") || document.body.innerText.includes("Take Break"),
      { timeout: 8000 }
    );
    await sleep(1500);

    // Verify DB with polling to allow serverless write to settle
    let attendanceAfterCheckin = null;
    for (let i = 0; i < 10; i++) {
      attendanceAfterCheckin = await db.attendance.findFirst({
        where: { userId: user.id },
        orderBy: { checkInAt: "desc" },
      });
      if (attendanceAfterCheckin && attendanceAfterCheckin.checkInAt && !attendanceAfterCheckin.checkOutAt) {
        break;
      }
      await sleep(600);
    }
    console.log("DB record after check-in:", JSON.stringify(attendanceAfterCheckin));
    const checkinPassed =
      Boolean(attendanceAfterCheckin) &&
      Boolean(attendanceAfterCheckin.checkInAt) &&
      attendanceAfterCheckin.checkOutAt === null;

    const shot1 = path.join(SCREENSHOT_DIR, "01_pixel7_checkin.png");
    await page.screenshot({ path: shot1, fullPage: false });
    fs.copyFileSync(shot1, path.join(ARTIFACT_DIR, "01_pixel7_checkin.png"));

    flowResults.push({
      flow: "1. Check-In",
      passed: checkinPassed,
      dbDetail: `ID: ${attendanceAfterCheckin?.id}, checkInAt: ${attendanceAfterCheckin?.checkInAt?.toISOString()}, checkOutAt: null`,
      screenshot: "01_pixel7_checkin.png",
    });
    console.log(`  ${checkinPassed ? "✓ PASSED" : "✗ FAILED"}: DB check-in verified. Screenshot saved.`);

    // -------------------------------------------------------------------------
    // FLOW 2: BREAK START & END
    // -------------------------------------------------------------------------
    console.log("\n--- FLOW 2: BREAK START & END ---");
    const breakStartBtn = await page.waitForSelector("button ::-p-text(Take Break)", { timeout: 5000 });
    await breakStartBtn.click();
    console.log("Clicked 'Take Break'");

    await page.waitForFunction(
      () => document.body.innerText.includes("End Break") || document.body.innerText.includes("Currently on Break"),
      { timeout: 8000 }
    );
    await sleep(2000);

    // Verify DB for Break Start
    const attendanceOnBreak = await db.attendance.findFirst({
      where: { userId: user.id },
      orderBy: { checkInAt: "desc" },
      include: { breaks: true },
    });
    const ongoingBreak = attendanceOnBreak?.breaks?.find((b) => !b.endTime);
    const breakActivePassed = Boolean(ongoingBreak);
    console.log("DB record during break:", JSON.stringify(attendanceOnBreak));

    const shot2 = path.join(SCREENSHOT_DIR, "02_pixel7_break_active.png");
    await page.screenshot({ path: shot2, fullPage: false });
    fs.copyFileSync(shot2, path.join(ARTIFACT_DIR, "02_pixel7_break_active.png"));
    console.log(`  ${breakActivePassed ? "✓ Break Start Verified" : "✗ Break Start Failed"} in DB.`);

    // Resume from break
    const breakEndBtn = await page.waitForSelector("button ::-p-text(End Break)", { timeout: 5000 });
    await breakEndBtn.click();
    console.log("Clicked 'End Break'");

    await page.waitForFunction(
      () => document.body.innerText.includes("Take Break") || document.body.innerText.includes("Active Work Session"),
      { timeout: 8000 }
    );
    await sleep(2000);

    const attendanceResumed = await db.attendance.findFirst({
      where: { userId: user.id },
      orderBy: { checkInAt: "desc" },
      include: { breaks: true },
    });
    const allBreaksEnded = Boolean(
      attendanceResumed?.breaks &&
      attendanceResumed.breaks.length > 0 &&
      attendanceResumed.breaks.every((b) => Boolean(b.endTime))
    );
    const breakEndPassed = allBreaksEnded;
    console.log("DB record after resuming:", JSON.stringify(attendanceResumed));

    const shot3 = path.join(SCREENSHOT_DIR, "03_pixel7_break_resumed.png");
    await page.screenshot({ path: shot3, fullPage: false });
    fs.copyFileSync(shot3, path.join(ARTIFACT_DIR, "03_pixel7_break_resumed.png"));

    const totalBreakPassed = breakActivePassed && breakEndPassed;
    flowResults.push({
      flow: "2. Break Start & End",
      passed: totalBreakPassed,
      dbDetail: `breakId: ${ongoingBreak?.id}, breaksCompleted: ${attendanceResumed?.breaks?.length}`,
      screenshot: "02_pixel7_break_active.png, 03_pixel7_break_resumed.png",
    });
    console.log(`  ${totalBreakPassed ? "✓ PASSED" : "✗ FAILED"}: Break cycle verified in DB.`);

    // -------------------------------------------------------------------------
    // FLOW 3: CHECK-OUT
    // -------------------------------------------------------------------------
    console.log("\n--- FLOW 3: CHECK-OUT ---");
    const checkoutBtn = await page.waitForSelector("button ::-p-text(Check Out)", { timeout: 5000 });
    await checkoutBtn.click();
    console.log("Clicked 'Check Out'");
    await sleep(1000);

    // Confirm dialog
    const confirmBtn = await page.waitForSelector("button ::-p-text(Confirm Check Out)", { timeout: 5000 });
    await confirmBtn.click();
    console.log("Confirmed check out");

    await page.waitForFunction(
      () =>
        document.body.innerText.includes("Shift Completed") ||
        document.body.innerText.includes("Day closed") ||
        document.body.innerText.includes("Shift Completed for Today"),
      { timeout: 8000 }
    );
    await sleep(2000);

    // Verify DB
    const attendanceClosed = await db.attendance.findFirst({
      where: { userId: user.id },
      orderBy: { checkInAt: "desc" },
    });
    const checkoutPassed =
      Boolean(attendanceClosed) &&
      Boolean(attendanceClosed.checkInAt) &&
      Boolean(attendanceClosed.checkOutAt);

    const shot4 = path.join(SCREENSHOT_DIR, "04_pixel7_checkout.png");
    await page.screenshot({ path: shot4, fullPage: false });
    fs.copyFileSync(shot4, path.join(ARTIFACT_DIR, "04_pixel7_checkout.png"));

    flowResults.push({
      flow: "3. Check-Out",
      passed: checkoutPassed,
      dbDetail: `checkInAt: ${attendanceClosed?.checkInAt?.toISOString()}, checkOutAt: ${attendanceClosed?.checkOutAt?.toISOString()}`,
      screenshot: "04_pixel7_checkout.png",
    });
    console.log(`  ${checkoutPassed ? "✓ PASSED" : "✗ FAILED"}: Check-out verified in DB.`);

    // -------------------------------------------------------------------------
    // FLOW 4: APPLY LEAVE
    // -------------------------------------------------------------------------
    console.log("\n--- FLOW 4: APPLY LEAVE ---");
    await page.goto(`${BASE_URL}/employee/leave`, { waitUntil: "networkidle0" });
    await sleep(2000);

    // Click "Apply for Time Off" CTA button
    const openLeaveModalBtn = await page.waitForSelector("button ::-p-text(Apply for Time Off)", { timeout: 8000 });
    await openLeaveModalBtn.click();
    console.log("Opened Apply for Time Off bottom sheet");
    await sleep(1000);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const uniqueReason = `Verified mobile flow leave request #${Date.now()}`;

    // Fill the inputs using native prototype setters for React 19 synthetic event recognition
    await page.evaluate((tomorrowStr) => {
      const select = document.querySelector("select");
      if (select) {
        const selectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
        selectSetter.call(select, "CASUAL");
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }

      const setInput = (input, val) => {
        const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        inputSetter.call(input, val);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs.length >= 2) {
        setInput(dateInputs[0], tomorrowStr);
        setInput(dateInputs[1], tomorrowStr);
      }
    }, tomorrowStr);

    const reasonTextarea = await page.waitForSelector("textarea", { timeout: 3000 });
    await reasonTextarea.click();
    await reasonTextarea.type(uniqueReason);
    await sleep(600);

    // Submit leave form
    const submitLeaveBtn = await page.waitForSelector("button ::-p-text(Submit Leave Request)", { timeout: 5000 });
    await submitLeaveBtn.click();
    console.log("Submitted leave request form");
    await sleep(2000);

    // Verify DB with polling
    let leaveRecord = null;
    for (let i = 0; i < 10; i++) {
      leaveRecord = await db.leaveRequest.findFirst({
        where: {
          userId: user.id,
          reason: uniqueReason,
        },
        orderBy: { createdAt: "desc" },
      });
      if (leaveRecord) break;
      await sleep(600);
    }
    const leavePassed =
      Boolean(leaveRecord) &&
      leaveRecord.leaveType === "CASUAL" &&
      leaveRecord.status === "PENDING";

    const shot5 = path.join(SCREENSHOT_DIR, "05_pixel7_leave_applied.png");
    await page.screenshot({ path: shot5, fullPage: false });
    fs.copyFileSync(shot5, path.join(ARTIFACT_DIR, "05_pixel7_leave_applied.png"));

    flowResults.push({
      flow: "4. Apply Leave",
      passed: leavePassed,
      dbDetail: `ID: ${leaveRecord?.id}, type: ${leaveRecord?.leaveType}, status: ${leaveRecord?.status}, reason: ${leaveRecord?.reason}`,
      screenshot: "05_pixel7_leave_applied.png",
    });
    console.log(`  ${leavePassed ? "✓ PASSED" : "✗ FAILED"}: Leave request verified in DB.`);

    // -------------------------------------------------------------------------
    // FLOW 5: SUBMIT WORK REPORT
    // -------------------------------------------------------------------------
    console.log("\n--- FLOW 5: SUBMIT WORK REPORT ---");
    await page.goto(`${BASE_URL}/employee/work-reports`, { waitUntil: "networkidle0" });
    await sleep(2000);

    const reportContent = `Completed mobile real flow verification across attendance, breaks, checkout, leaves, and work reporting #${Date.now()}`;

    const reportTextarea = await page.waitForSelector("textarea", { timeout: 5000 });
    await reportTextarea.click();
    await reportTextarea.type(reportContent);
    await sleep(500);

    const submitReportBtn = await page.waitForSelector("button ::-p-text(Submit EOD Work Report)", { timeout: 5000 });
    await submitReportBtn.click();
    console.log("Submitted EOD work report");
    await sleep(3000);

    // Verify DB
    const workReportRecord = await db.workReport.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });
    const reportPassed =
      Boolean(workReportRecord) &&
      (workReportRecord.summary.includes("Completed mobile") ||
        workReportRecord.workPerformed.includes("Completed mobile") ||
        workReportRecord.tasksCompleted?.includes("Completed mobile"));

    const shot6 = path.join(SCREENSHOT_DIR, "06_pixel7_work_report_submitted.png");
    await page.screenshot({ path: shot6, fullPage: false });
    fs.copyFileSync(shot6, path.join(ARTIFACT_DIR, "06_pixel7_work_report_submitted.png"));

    flowResults.push({
      flow: "5. Submit Work Report",
      passed: reportPassed,
      dbDetail: `ID: ${workReportRecord?.id}, hoursWorked: ${workReportRecord?.hoursWorked}, status: ${workReportRecord?.status}`,
      screenshot: "06_pixel7_work_report_submitted.png",
    });
    console.log(`  ${reportPassed ? "✓ PASSED" : "✗ FAILED"}: Work report verified in DB.`);

    await browser.close();

    // -------------------------------------------------------------------------
    // SUMMARY TABLE
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log("               REAL EMPLOYEE FLOW VERIFICATION RESULTS                          ");
    console.log("================================================================================");
    console.log("| Flow                   | Status  | Database Verification Record Details |");
    console.log("|------------------------|---------|--------------------------------------|");
    for (const r of flowResults) {
      console.log(`| ${r.flow.padEnd(22)} | ${r.passed ? "✅ PASS" : "❌ FAIL"} | ${r.dbDetail} |`);
    }

    const allFlowsPassed = flowResults.every((r) => r.passed);
    console.log(`\nAll 5 employee mobile flows passed: ${allFlowsPassed ? "YES (5/5)" : "NO"}`);

    // Save results JSON
    fs.writeFileSync(
      "./docs/mobile/baseline/employee-real-flows-results.json",
      JSON.stringify(flowResults, null, 2),
      "utf8"
    );
  } finally {
    console.log("\nStopping production server...");
    serverProcess.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Employee real flows verification failed with error:", err);
  process.exit(1);
});
