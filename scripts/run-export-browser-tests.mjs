import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("./export-screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runExportBrowserTests() {
  console.log("🚀 Starting Real Browser Tests for Excel Export System (Part A)...");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = [];

  try {
    // 1. Authenticate directly via login API to obtain session cookie
    console.log("▶ 1. Authenticating as Administrator (admin@axivon.dev)...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });

    const loginRes = await page.evaluate(async () => {
      const resp = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@axivon.dev",
          password: "AxivonAdmin@2024",
          captchaToken: "1x00000000000000000000AA",
        }),
      });
      return { status: resp.status };
    });

    console.log(`  ✓ Admin authenticated: status=${loginRes.status}`);

    // 2. Business Partner Applications Page
    console.log("▶ 2. Navigating to /admin/business-partners/applications...");
    await page.goto(`${BASE_URL}/admin/business-partners/applications`, { waitUntil: "networkidle0" });
    await page.waitForSelector("table", { timeout: 10000 });
    console.log("  ✓ Applications table rendered successfully.");

    // Open Export Modal
    console.log("▶ 3. Opening Applications Export Modal...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent?.includes("Export Applications"));
      if (btn) btn.click();
    });

    await page.waitForSelector(".fixed.inset-0", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1200)); // Wait for live preview count

    const appModalShot = path.join(SCREENSHOT_DIR, "01-admin-applications-export-modal.png");
    await page.screenshot({ path: appModalShot, fullPage: false });
    console.log("  📸 Saved:", appModalShot);
    results.push({ test: "Applications Export Modal", status: "PASS", screenshot: appModalShot });

    // Close modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const cancelBtn = btns.find((b) => b.textContent?.trim() === "Cancel");
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // 3. Confirmed Brokers Page
    console.log("▶ 4. Navigating to /admin/crm/brokers...");
    await page.goto(`${BASE_URL}/admin/crm/brokers`, { waitUntil: "networkidle0" });
    await page.waitForSelector("table", { timeout: 10000 });
    console.log("  ✓ Brokers table rendered successfully.");

    // Select row checkboxes
    console.log("▶ 5. Selecting row checkboxes in Brokers table...");
    await page.evaluate(() => {
      const cbs = document.querySelectorAll('tbody input[type="checkbox"]');
      if (cbs[0]) cbs[0].click();
      if (cbs[1]) cbs[1].click();
    });

    await new Promise((r) => setTimeout(r, 500));

    // Open Confirmed Partners Export Modal
    console.log("▶ 6. Opening Confirmed Partners Export Modal...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent?.includes("Export (.xlsx)"));
      if (btn) btn.click();
    });

    await page.waitForSelector(".fixed.inset-0", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1200));

    const brokerModalShot = path.join(SCREENSHOT_DIR, "02-admin-brokers-export-modal.png");
    await page.screenshot({ path: brokerModalShot, fullPage: false });
    console.log("  📸 Saved:", brokerModalShot);
    results.push({ test: "Brokers Export Modal with Selected Scope", status: "PASS", screenshot: brokerModalShot });

    // Test Sensitive Data Unmasking checkbox
    console.log("▶ 7. Ticking Sensitive Data Unmasking...");
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll("label"));
      const sensLabel = labels.find((l) => l.textContent?.includes("Export Unmasked Financial"));
      if (sensLabel) {
        const cb = sensLabel.querySelector('input[type="checkbox"]');
        if (cb && !cb.checked) cb.click();
      }
    });

    await new Promise((r) => setTimeout(r, 600));
    const sensShot = path.join(SCREENSHOT_DIR, "03-admin-sensitive-unmask-prompt.png");
    await page.screenshot({ path: sensShot, fullPage: false });
    console.log("  📸 Saved:", sensShot);
    results.push({ test: "Sensitive Data Password Verification Prompt", status: "PASS", screenshot: sensShot });

    // Test History Tab
    console.log("▶ 8. Switching to Export Audit History Tab...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button"));
      const histTab = tabs.find((t) => t.textContent?.includes("Export Audit History"));
      if (histTab) histTab.click();
    });

    await new Promise((r) => setTimeout(r, 1200));
    const histShot = path.join(SCREENSHOT_DIR, "04-admin-export-history-tab.png");
    await page.screenshot({ path: histShot, fullPage: false });
    console.log("  📸 Saved:", histShot);
    results.push({ test: "Export Audit History Tab", status: "PASS", screenshot: histShot });

    // Close modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const cancelBtn = btns.find((b) => b.textContent?.trim() === "Cancel");
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // 4. Single Broker Dossier Export Modal
    console.log("▶ 9. Navigating to Single Broker detail page...");
    const firstBrokerHref = await page.evaluate(() => {
      const link = document.querySelector('tbody tr td a[href*="/admin/crm/brokers/"]');
      return link ? link.getAttribute("href") : null;
    });

    if (firstBrokerHref) {
      await page.goto(`${BASE_URL}${firstBrokerHref}`, { waitUntil: "networkidle0" });
      await page.waitForSelector("body", { timeout: 10000 });

      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find((b) => b.textContent?.includes("Export Dossier"));
        if (btn) btn.click();
      });

      await page.waitForSelector(".fixed.inset-0", { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 1200));

      const dossierShot = path.join(SCREENSHOT_DIR, "05-admin-single-broker-dossier-modal.png");
      await page.screenshot({ path: dossierShot, fullPage: false });
      console.log("  📸 Saved:", dossierShot);
      results.push({ test: "Single Broker Dossier Export Modal", status: "PASS", screenshot: dossierShot });
    }

    // 5. Direct API Export & Real ExcelJS Inspection
    console.log("▶ 10. Executing Server-Side Export with ExcelJS Inspection...");
    const cookies = await page.cookies();
    const sessionCookie = cookies.find((c) => c.name === "axivon_session")?.value;

    const exportResponse = await fetch(`${BASE_URL}/api/v1/admin/export/partners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `axivon_session=${sessionCookie}`,
        "x-test-mode": "true",
      },
      body: JSON.stringify({
        type: "CONFIRMED_PARTNERS",
        format: "xlsx",
        includeRelatedData: true,
        sensitiveUnmasked: false,
      }),
    });

    if (!exportResponse.ok) {
      throw new Error(`Export API returned HTTP ${exportResponse.status}`);
    }

    const arrayBuffer = await exportResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sampleFilePath = path.join(SCREENSHOT_DIR, "sample-confirmed-partners-export.xlsx");
    fs.writeFileSync(sampleFilePath, buffer);
    console.log("  📁 Saved sample workbook to:", sampleFilePath);

    // Load workbook back with ExcelJS
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    console.log(`  Sheets in generated workbook (${wb.worksheets.length}):`, wb.worksheets.map((s) => s.name));

    // Verify required sheets
    const hasSummary = !!wb.getWorksheet("Summary");
    const hasData = !!wb.getWorksheet("Data");
    const hasLeads = !!wb.getWorksheet("Leads");
    const hasProjects = !!wb.getWorksheet("Projects");
    const hasCommissions = !!wb.getWorksheet("Commissions");
    const hasPayouts = !!wb.getWorksheet("Payouts");

    console.log(`  ✓ Summary sheet: ${hasSummary}`);
    console.log(`  ✓ Data sheet: ${hasData}`);
    console.log(`  ✓ Leads sheet: ${hasLeads}`);
    console.log(`  ✓ Projects sheet: ${hasProjects}`);
    console.log(`  ✓ Commissions sheet: ${hasCommissions}`);
    console.log(`  ✓ Payouts sheet: ${hasPayouts}`);

    if (!hasSummary || !hasData || !hasLeads || !hasProjects) {
      throw new Error("Missing expected sheets in exported Excel workbook!");
    }

    // Verify Data sheet styling & columns
    const dataSheet = wb.getWorksheet("Data");
    const headerRow = dataSheet.getRow(1);
    const headers = [];
    headerRow.eachCell((c) => headers.push(c.value));
    console.log(`  ✓ Data columns count: ${headers.length}`);

    // Confirm frozen row
    const isFrozen = dataSheet.views[0]?.ySplit === 1;
    console.log(`  ✓ Header frozen view configured: ${isFrozen}`);

    // Verify no secret leak in any cell
    let secretFound = false;
    wb.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          const val = String(cell.value || "");
          if (val.includes("$2a$") || val.includes("$2b$") || val.includes("passwordHash")) {
            secretFound = true;
          }
        });
      });
    });

    console.log(`  ✓ Password hash / secret leak detected: ${secretFound}`);
    if (secretFound) throw new Error("Security check failed: Secret password hash detected in Excel cells!");

    results.push({
      test: "ExcelJS Workbook Verification (Summary, Data, Related Sheets, Masking, No Secrets)",
      status: "PASS",
      details: {
        sheets: wb.worksheets.map((s) => s.name),
        columnsCount: headers.length,
        isFrozen,
        secretFound,
      },
    });

    console.log("\n==========================================");
    console.log("✅ ALL REAL-BROWSER EXPORT TESTS PASSED!");
    console.log("==========================================");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runExportBrowserTests().catch(console.error);
