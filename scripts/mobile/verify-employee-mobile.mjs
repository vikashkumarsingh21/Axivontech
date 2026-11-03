import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOTS_DIR = path.resolve("./docs/mobile/screenshots/employee");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return true;
    } catch {
      // Continue polling
    }
    await sleep(1000);
  }
  return false;
}

const VIEWPORTS = [
  { name: "390x844_standard", width: 390, height: 844 },
  { name: "360x800_android", width: 360, height: 800 },
  { name: "412x915_pixel7", width: 412, height: 915 },
  { name: "320x640_small", width: 320, height: 640 },
];

async function main() {
  console.log("=== Employee Mobile UX Verification & Screenshots Suite ===");

  console.log("Starting dedicated Next.js server with APP_MODE_ENABLED=true...");
  const serverProcess = spawn(
    "npm.cmd",
    ["run", "dev", "--", "-p", String(PORT), "-H", "127.0.0.1"],
    {
      env: {
        ...process.env,
        APP_MODE_ENABLED: "true",
        NODE_ENV: "development",
      },
      shell: true,
      stdio: "pipe",
    }
  );

  const started = await waitForServer(BASE_URL, 60000);
  if (!started) {
    console.error("Failed to start server within 60s.");
    serverProcess.kill();
    process.exit(1);
  }

  console.log("Server is ready at " + BASE_URL);

  // Authenticate as QA Employee
  console.log("Authenticating QA Employee...");
  let sessionToken = null;
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.120",
    },
    body: JSON.stringify({
      email: "qa.employee@axivon.dev",
      password: "AxivonEmployee@2024",
      captchaToken: "1x00000000000000000000AA",
    }),
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    console.error(`Login failed (${loginRes.status}):`, errText);
    serverProcess.kill();
    process.exit(1);
  }

  const setCookieHeader = loginRes.headers.get("set-cookie") || "";
  const match = setCookieHeader.match(/axivon_session=([^;]+)/);
  if (match) {
    sessionToken = match[1];
  } else {
    console.error("No session cookie returned.");
    serverProcess.kill();
    process.exit(1);
  }
  console.log("Authentication successful! Acquired session token.");

  // Launch Puppeteer with Chrome
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const SCREENS = [
    { id: "dashboard", name: "01_employee_home", path: "/employee/dashboard" },
    { id: "attendance", name: "02_employee_attendance", path: "/employee/attendance" },
    { id: "tasks", name: "03_employee_tasks", path: "/employee/tasks" },
    { id: "leave", name: "04_employee_leave", path: "/employee/leave" },
    { id: "work-reports", name: "05_employee_work_reports", path: "/employee/work-reports" },
    { id: "notifications", name: "06_employee_notifications", path: "/employee/notifications" },
    { id: "profile", name: "07_employee_profile", path: "/employee/profile" },
  ];

  const results = [];

  try {
    for (const screen of SCREENS) {
      console.log(`\nTesting screen: ${screen.id} (${screen.path})...`);
      const page = await browser.newPage();

      // Listen for console errors
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (!text.includes("webpack-hmr") && !text.includes("favicon") && !text.includes("fonts.gstatic.com")) {
            consoleErrors.push(text);
            console.log("  [CONSOLE ERROR]:", text);
          }
        }
      });

      // Set cookies on 127.0.0.1
      await page.setCookie(
        {
          name: "axivon_session",
          value: sessionToken,
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        },
        {
          name: "axivon_app_dev",
          value: "1",
          domain: "127.0.0.1",
          path: "/",
        }
      );

      // Set User-Agent with AxivonApp token
      await page.setUserAgent(
        "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240205.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36 AxivonApp/1.0.0"
      );

      // Evaluate standard 390x844 first
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      await page.goto(`${BASE_URL}${screen.path}?app=1`, { waitUntil: "networkidle2" });
      await sleep(1500);

      // Audit checks
      const audit = await page.evaluate(() => {
        const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
        const dataApp = document.documentElement.getAttribute("data-app");
        const hasTopBar = Boolean(document.querySelector("header"));
        const hasTabBar = Boolean(document.querySelector("nav[role='navigation']"));
        const mobileShell = Boolean(document.querySelector("[data-mobile-shell='true']"));

        return {
          hasHorizontalScroll,
          dataApp,
          hasTopBar,
          hasTabBar,
          mobileShell,
        };
      });

      console.log(`  Audit: data-app=${audit.dataApp}, Shell=${audit.mobileShell}, H-Scroll=${audit.hasHorizontalScroll}, TopBar=${audit.hasTopBar}, TabBar=${audit.hasTabBar}, Errors=${consoleErrors.length}`);

      // Capture screenshots for all 4 viewports
      for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
        await sleep(300);
        const screenshotFile = path.join(SCREENSHOTS_DIR, `${screen.name}_${vp.name}.png`);
        await page.screenshot({ path: screenshotFile });
      }

      console.log(`  Saved 4 screenshots for ${screen.id}`);

      // If screen is dashboard, also capture the "More" bottom sheet open
      if (screen.id === "dashboard") {
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
        const moreBtn = await page.$("nav button[aria-label='More navigation items']");
        if (moreBtn) {
          await moreBtn.click();
          await sleep(500);
          const moreFile = path.join(SCREENSHOTS_DIR, `08_employee_more_sheet_390x844.png`);
          await page.screenshot({ path: moreFile });
          console.log(`  Saved More bottom sheet screenshot: ${moreFile}`);
        }
      }

      results.push({
        screen: screen.id,
        path: screen.path,
        hasHorizontalScroll: audit.hasHorizontalScroll,
        consoleErrors: consoleErrors.length,
        hasTopBar: audit.hasTopBar,
        hasTabBar: audit.hasTabBar,
        mobileShell: audit.mobileShell,
      });

      await page.close();
    }
  } finally {
    await browser.close();
    serverProcess.kill();
  }

  // Print Summary Table
  console.log("\n==========================================================================");
  console.log("EMPLOYEE MOBILE UX VERIFICATION RESULTS");
  console.log("==========================================================================");
  console.table(results);

  const allPassed = results.every(
    (r) => !r.hasHorizontalScroll && r.consoleErrors === 0 && r.hasTopBar && r.hasTabBar && r.mobileShell
  );

  console.log(`\nOverall Result: ${allPassed ? "100% PASS (All screens verified!)" : "FAILED"}`);
}

main().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
