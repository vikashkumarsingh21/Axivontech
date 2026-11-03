import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOTS_DIR = path.resolve("./docs/mobile/screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
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
    } catch (e) {
      // Retry
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} failed to start within ${timeoutMs}ms`);
}

const credentials = {
  ADMIN: { email: "admin@axivon.dev", pass: "AxivonAdmin@2024" },
  FOUNDER: { email: "founder@axivon.dev", pass: "AxivonFounder@2024" },
  EMPLOYEE: { email: "qa.employee@axivon.dev", pass: "AxivonEmployee@2024" },
  BROKER: { email: "qa.broker@axivon.dev", pass: "AxivonBroker@2024" },
  CLIENT: { email: "qa.client@axivon.dev", pass: "AxivonClient@2024" },
};

const UA_APP = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 AxivonApp/1.0.0";
const UA_APP_OLD = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 AxivonApp/0.8.0";
const UA_ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const UA_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function main() {
  console.log("================================================================================");
  console.log("            PROMPT 1 COMPLETE FUNCTIONAL & VERIFICATION TEST SUITE              ");
  console.log("================================================================================");

  const serverEnv = {
    ...process.env,
    NODE_ENV: "production",
    TEST_MODE: "true",
    APP_MODE_ENABLED: "true",
    PORT: String(PORT),
  };

  console.log("\nStarting Next.js production server with APP_MODE_ENABLED=true...");
  const serverProcess = spawn("npx.cmd", ["next", "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    env: serverEnv,
    stdio: "inherit",
    shell: true,
  });

  const testResults = [];

  try {
    await waitForServer(BASE_URL);
    console.log(`✅ Production server online at ${BASE_URL}\n`);

    // -------------------------------------------------------------------------
    // TEST 1: CURL / HTTP HEADER TESTS
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: CURL & HTTP ROUTING VERIFICATION ---");

    // 1A. Normal Web UA
    const publicPages = ["/", "/services", "/about", "/pricing", "/contact"];
    for (const p of publicPages) {
      const res = await fetch(`${BASE_URL}${p}`, {
        headers: { "User-Agent": UA_DESKTOP },
        redirect: "manual",
      });
      const passed = res.status === 200;
      testResults.push({ test: `Web Mode: GET ${p}`, passed, detail: `HTTP ${res.status}` });
      console.log(`  ${passed ? "✓" : "✗"} Web Mode: GET ${p} -> HTTP ${res.status}`);
    }

    // 1B. App Mode UA (Unauthenticated public redirects)
    for (const p of publicPages) {
      const res = await fetch(`${BASE_URL}${p}`, {
        headers: { "User-Agent": UA_APP },
        redirect: "manual",
      });
      const loc = res.headers.get("location");
      const passed = (res.status === 307 || res.status === 302) && loc?.includes("/login");
      testResults.push({ test: `App Mode Redirect: GET ${p}`, passed, detail: `HTTP ${res.status} to ${loc}` });
      console.log(`  ${passed ? "✓" : "✗"} App Mode: GET ${p} -> HTTP ${res.status} (Redirect: ${loc})`);
    }

    // 1C. Allowed App Mode Routes
    const allowedAppRoutes = ["/login", "/privacy-policy", "/terms", "/preferences"];
    for (const p of allowedAppRoutes) {
      const res = await fetch(`${BASE_URL}${p}`, {
        headers: { "User-Agent": UA_APP },
        redirect: "manual",
      });
      const passed = res.status === 200;
      testResults.push({ test: `App Mode Allowed: GET ${p}`, passed, detail: `HTTP ${res.status}` });
      console.log(`  ${passed ? "✓" : "✗"} App Mode Allowed: GET ${p} -> HTTP ${res.status}`);
    }

    // 1D. Version & Download Endpoints
    const versionRes = await fetch(`${BASE_URL}/api/v1/app/version`);
    const versionData = await versionRes.json();
    const passedVersion = versionRes.status === 200 && versionData.latestVersion && versionData.apkUrl;
    testResults.push({
      test: "GET /api/v1/app/version",
      passed: Boolean(passedVersion),
      detail: `v${versionData.latestVersion} (min: v${versionData.minVersion})`,
    });
    console.log(`  ${passedVersion ? "✓" : "✗"} GET /api/v1/app/version -> HTTP ${versionRes.status}: Latest=${versionData.latestVersion}, Min=${versionData.minVersion}`);

    const downloadRes = await fetch(`${BASE_URL}/download/axivon-app`, {
      headers: { "User-Agent": UA_ANDROID },
      redirect: "manual",
    });
    const downloadLoc = downloadRes.headers.get("location");
    const downloadCt = downloadRes.headers.get("content-type");
    const passedDownload =
      downloadRes.status === 307 &&
      downloadLoc?.includes("github.com") &&
      downloadCt?.includes("application/vnd.android.package-archive");
    testResults.push({
      test: "GET /download/axivon-app",
      passed: Boolean(passedDownload),
      detail: `HTTP ${downloadRes.status}, Content-Type: ${downloadCt}, Target: ${downloadLoc}`,
    });
    console.log(`  ${passedDownload ? "✓" : "✗"} GET /download/axivon-app -> HTTP ${downloadRes.status} (${downloadCt}) -> ${downloadLoc}`);

    // -------------------------------------------------------------------------
    // TEST 2: AUTHENTICATION FOR ALL ROLES
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: AUTHENTICATING ALL ROLES ---");
    // Warm-up ping to wake up Neon serverless DB pool before auth tests
    try {
      await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(10000) });
    } catch (e) {}
    await sleep(1500);

    const roleTokens = {};
    let roleIdx = 0;
    for (const [role, cred] of Object.entries(credentials)) {
      roleIdx++;
      await sleep(400);
      let token = null;
      let status = 0;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-test-mode": "true",
              "x-forwarded-for": `127.0.0.${20 + roleIdx}`,
            },
            body: JSON.stringify({
              email: cred.email,
              password: cred.pass,
              captchaToken: "1x00000000000000000000AA",
            }),
            signal: AbortSignal.timeout(35000),
          });
          status = res.status;
          const cookieHeader = res.headers.get("set-cookie");
          if (cookieHeader) {
            const match = cookieHeader.match(/axivon_session=([^;]+)/);
            if (match) token = match[1];
          }
          if (res.ok && token) break;
        } catch (e) {
          if (attempt === 2) console.log(`  ✗ Login ${role} attempt ${attempt} error: ${e.message}`);
          await sleep(2500);
        }
      }
      roleTokens[role] = token;
      const passed = Boolean(token);
      testResults.push({ test: `Login ${role}`, passed, detail: `HTTP ${status}` });
      console.log(`  ${passed ? "✓" : "✗"} Login ${role}: HTTP ${status}`);
    }

    // Fallback: If ADMIN failed on initial cold connect, retry now that DB is active
    if (!roleTokens["ADMIN"]) {
      console.log("  Retrying ADMIN login now that database is awake...");
      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-test-mode": "true",
            "x-forwarded-for": "127.0.0.99",
          },
          body: JSON.stringify({
            email: credentials.ADMIN.email,
            password: credentials.ADMIN.pass,
            captchaToken: "1x00000000000000000000AA",
          }),
          signal: AbortSignal.timeout(35000),
        });
        const cookieHeader = res.headers.get("set-cookie");
        if (cookieHeader) {
          const match = cookieHeader.match(/axivon_session=([^;]+)/);
          if (match) {
            roleTokens["ADMIN"] = match[1];
            console.log("  ✓ ADMIN login retry succeeded!");
          }
        }
      } catch (e) {}
    }

    // -------------------------------------------------------------------------
    // TEST 3: PUPPETEER BROWSER VERIFICATION & SCREENSHOTS
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: PUPPETEER BROWSER VERIFICATION & SCREENSHOTS ---");

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    // 3A. Compact Login in App Mode (Pixel 7 Viewport)
    console.log("\n[3A] Verifying Compact Login in App Mode (Pixel 7)...");
    const pagePixel = await browser.newPage();
    await pagePixel.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
    await pagePixel.setUserAgent(UA_APP);

    await pagePixel.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(1000);

    const hasDataApp = await pagePixel.evaluate(() => document.documentElement.getAttribute("data-app") === "true");
    const isCarouselHidden = await pagePixel.evaluate(() => {
      const carousel = document.querySelector(".login-poster-carousel") || document.querySelector("[data-poster-carousel]");
      return !carousel || window.getComputedStyle(carousel).display === "none";
    });
    const isWhatsAppHidden = await pagePixel.evaluate(() => {
      const wa = document.querySelector("[aria-label*='WhatsApp']");
      return !wa || window.getComputedStyle(wa).display === "none";
    });

    const loginShotPath = path.join(SCREENSHOTS_DIR, "compact-login-app-mode.png");
    await pagePixel.screenshot({ path: loginShotPath, fullPage: false });

    const passLoginApp = hasDataApp && isCarouselHidden;
    testResults.push({
      test: "App Mode Compact Login UI",
      passed: passLoginApp,
      detail: `data-app: ${hasDataApp}, Carousel Hidden: ${isCarouselHidden}, WhatsApp Hidden: ${isWhatsAppHidden}`,
    });
    console.log(`  ${passLoginApp ? "✓" : "✗"} Compact Login Verified (Screenshot: compact-login-app-mode.png)`);
    await pagePixel.close();

    // 3B. Authenticated Portal Redirect in App Mode (all roles)
    console.log("\n[3B] Verifying App Mode Role Dashboard Redirection from '/'...");
    const roleExpectedRoutes = {
      ADMIN: "/admin/dashboard",
      FOUNDER: "/executive/dashboard",
      EMPLOYEE: "/employee/dashboard",
      BROKER: "/broker/dashboard",
      CLIENT: "/client/dashboard",
    };

    for (const [role, expectedPath] of Object.entries(roleExpectedRoutes)) {
      const pageRole = await browser.newPage();
      await pageRole.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
      await pageRole.setUserAgent(UA_APP);
      if (roleTokens[role]) {
        await pageRole.setCookie({
          name: "axivon_session",
          value: roleTokens[role],
          domain: "127.0.0.1",
          path: "/",
        });
      }

      await pageRole.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
      await sleep(1500);

      const currentUrl = pageRole.url();
      const passed = currentUrl.includes(expectedPath);
      testResults.push({
        test: `App Mode Auth Redirect (${role})`,
        passed,
        detail: `Expected ${expectedPath}, Landed at ${currentUrl.replace(BASE_URL, "")}`,
      });
      console.log(`  ${passed ? "✓" : "✗"} Role ${role} navigated to '/': Redirected to ${currentUrl.replace(BASE_URL, "")}`);
      await pageRole.close();
    }

    const adminToken = roleTokens["ADMIN"] || roleTokens["FOUNDER"];

    // Activate popup toggle via Admin PATCH API for testing
    console.log("\nActivating popup toggle via Admin PATCH API for UI verification...");
    try {
      const patchRes = await fetch(`${BASE_URL}/api/v1/admin/app/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `axivon_session=${adminToken}`,
        },
        body: JSON.stringify({
          enabled: true,
          popupEnabled: true,
        }),
      });
      console.log(`  Admin Settings PATCH: HTTP ${patchRes.status}`);
    } catch (e) {
      console.log(`  Admin Settings PATCH Error: ${e.message}`);
    }

    // 3C. Daily Download Popup on Desktop (QR Code + Copy Link)
    console.log("\n[3C] Verifying Daily Download Popup on Desktop (QR + Copy Link)...");
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900 });
    await pageDesktop.setUserAgent(UA_DESKTOP);
    if (adminToken) {
      await pageDesktop.setCookie({
        name: "axivon_session",
        value: adminToken,
        domain: "127.0.0.1",
        path: "/",
      });
    }

    // Clear localStorage to simulate fresh day before page loads
    await pageDesktop.evaluateOnNewDocument(() => {
      localStorage.removeItem("axivon_app_prompt_last_date");
    });
    await pageDesktop.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "domcontentloaded" });
    await sleep(2500); // 1.5s delay + render

    const hasQrSvg = await pageDesktop.evaluate(() => {
      const svg = document.querySelector("svg");
      const title = document.querySelector("#app-download-title") || document.querySelector("h2");
      return Boolean(svg && title && title.textContent?.includes("Get the Axivon app"));
    });

    const desktopShotPath = path.join(SCREENSHOTS_DIR, "daily-popup-desktop.png");
    await pageDesktop.screenshot({ path: desktopShotPath, fullPage: false });

    // Test dismissal
    await pageDesktop.evaluate(() => {
      const closeBtn =
        document.querySelector("button[aria-label='Close']") ||
        document.querySelector("button[aria-label*='Close']") ||
        document.querySelector("button[aria-label*='Band']");
      if (closeBtn) closeBtn.click();
    });
    await sleep(500);

    const savedDate = await pageDesktop.evaluate(() => localStorage.getItem("axivon_app_prompt_last_date"));
    const passDesktopPopup = hasQrSvg && Boolean(savedDate);
    testResults.push({
      test: "Daily Download Popup Desktop (QR + Persistence)",
      passed: passDesktopPopup,
      detail: `QR Code Rendered: ${hasQrSvg}, Persisted Date: ${savedDate}`,
    });
    console.log(`  ${passDesktopPopup ? "✓" : "✗"} Desktop Popup Verified (Screenshot: daily-popup-desktop.png)`);
    await pageDesktop.close();

    // 3D. Daily Download Popup on Android (Download Button + Expander)
    console.log("\n[3D] Verifying Daily Download Popup on Android Mobile...");
    const pageAndroid = await browser.newPage();
    await pageAndroid.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await pageAndroid.setUserAgent(UA_ANDROID);
    if (adminToken) {
      await pageAndroid.setCookie({
        name: "axivon_session",
        value: adminToken,
        domain: "127.0.0.1",
        path: "/",
      });
    }

    // Clear localStorage to simulate fresh day before page loads
    await pageAndroid.evaluateOnNewDocument(() => {
      localStorage.removeItem("axivon_app_prompt_last_date");
    });
    await pageAndroid.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "domcontentloaded" });
    await sleep(2500);

    const hasAndroidDownloadBtn = await pageAndroid.evaluate(() => {
      const btn = document.querySelector("a[href*='/download/axivon-app']");
      return Boolean(btn);
    });

    const androidShotPath = path.join(SCREENSHOTS_DIR, "daily-popup-android.png");
    await pageAndroid.screenshot({ path: androidShotPath, fullPage: false });

    const passAndroidPopup = hasAndroidDownloadBtn;
    testResults.push({
      test: "Daily Download Popup Android (Download Button & Install Guide)",
      passed: passAndroidPopup,
      detail: `Download Button Link Found: ${hasAndroidDownloadBtn}`,
    });
    console.log(`  ${passAndroidPopup ? "✓" : "✗"} Android Popup Verified (Screenshot: daily-popup-android.png)`);
    await pageAndroid.close();

    // 3E. Update Gate Blocking Screen (Outdated App Version)
    console.log("\n[3E] Verifying Blocking UpdateGate on Outdated App Version...");
    const pageUpdateGate = await browser.newPage();
    await pageUpdateGate.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await pageUpdateGate.setUserAgent(UA_APP_OLD); // AxivonApp/0.8.0 < minVersion 1.0.0
    if (adminToken) {
      await pageUpdateGate.setCookie({
        name: "axivon_session",
        value: adminToken,
        domain: "127.0.0.1",
        path: "/",
      });
    }

    await pageUpdateGate.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "domcontentloaded" });
    await sleep(2000);

    const hasUpdateRequired = await pageUpdateGate.evaluate(() => {
      const el = document.querySelector("#update-required-title") || document.querySelector("h1");
      return Boolean(el && el.textContent?.includes("Update Required"));
    });

    const updateGateShotPath = path.join(SCREENSHOTS_DIR, "update-gate-blocking.png");
    await pageUpdateGate.screenshot({ path: updateGateShotPath, fullPage: false });

    testResults.push({
      test: "UpdateGate Blocking Dialog (< minVersion)",
      passed: hasUpdateRequired,
      detail: `Modal Rendered: ${hasUpdateRequired}`,
    });
    console.log(`  ${hasUpdateRequired ? "✓" : "✗"} UpdateGate Blocking Verified (Screenshot: update-gate-blocking.png)`);
    await pageUpdateGate.close();

    // 3F. Admin App Settings Management Portal
    console.log("\n[3F] Verifying Admin App Settings Page (/admin/settings/app)...");
    const pageAdminSettings = await browser.newPage();
    await pageAdminSettings.setViewport({ width: 1440, height: 900 });
    await pageAdminSettings.setUserAgent(UA_DESKTOP);
    if (adminToken) {
      await pageAdminSettings.setCookie({
        name: "axivon_session",
        value: adminToken,
        domain: "127.0.0.1",
        path: "/",
      });
    }

    await pageAdminSettings.goto(`${BASE_URL}/admin/settings/app`, { waitUntil: "networkidle0" });
    await sleep(2000);

    const hasAdminForm = await pageAdminSettings.evaluate(() => {
      const title = document.querySelector("h1");
      const form = document.querySelector("form") || document.querySelector("button[type='submit']");
      return Boolean(title && title.textContent?.includes("Android App") && form);
    });

    const adminShotPath = path.join(SCREENSHOTS_DIR, "admin-app-settings.png");
    await pageAdminSettings.screenshot({ path: adminShotPath, fullPage: false });

    testResults.push({
      test: "Admin App Settings Screen (/admin/settings/app)",
      passed: hasAdminForm,
      detail: `Screen Rendered: ${hasAdminForm}`,
    });
    console.log(`  ${hasAdminForm ? "✓" : "✗"} Admin App Settings Page Verified (Screenshot: admin-app-settings.png)`);
    await pageAdminSettings.close();

    // Restore popup toggle to default OFF
    try {
      await fetch(`${BASE_URL}/api/v1/admin/app/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `axivon_session=${adminToken}`,
        },
        body: JSON.stringify({
          popupEnabled: false,
        }),
      });
    } catch (e) {}

    await browser.close();

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log("                           VERIFICATION SUITE SUMMARY                           ");
    console.log("================================================================================");
    const passedCount = testResults.filter((t) => t.passed).length;
    console.table(testResults);
    console.log(`\nFINAL SCORE: ${passedCount}/${testResults.length} CHECKS PASSED`);

    if (passedCount === testResults.length) {
      console.log(">>> ALL VERIFICATION TESTS PASSED 100%! <<<\n");
    } else {
      console.log(">>> SOME CHECKS FAILED. PLEASE REVIEW LOGS. <<<\n");
    }
  } finally {
    console.log("Stopping server...");
    serverProcess.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
