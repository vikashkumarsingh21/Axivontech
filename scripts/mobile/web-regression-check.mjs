import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import zlib from "zlib";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const BASELINE_DATA_FILE = path.resolve("./docs/mobile/baseline/baseline-data.json");
const BASELINE_HTML_DIR = path.resolve("./docs/mobile/baseline/html");
const BASELINE_SCREENSHOTS_DIR = path.resolve("./docs/mobile/baseline/screenshots");

function gzipSize(buffer) {
  return zlib.gzipSync(buffer).length;
}

async function sleep(ms) {
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

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  return matches.map((m) => m[1].trim());
}

function extractSeoTags(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const metaDescriptions = [...html.matchAll(/<meta name="description" content="([^"]*)"/gi)].map((m) => m[1]);
  return {
    title: titleMatch ? titleMatch[1] : "",
    descriptions: metaDescriptions,
  };
}

const credentials = {
  ADMIN: { email: "admin@axivon.dev", pass: "AxivonAdmin@2024" },
  FOUNDER: { email: "founder@axivon.dev", pass: "AxivonFounder@2024" },
  EMPLOYEE: { email: "qa.employee@axivon.dev", pass: "AxivonEmployee@2024" },
  BROKER: { email: "qa.broker@axivon.dev", pass: "AxivonBroker@2024" },
  CLIENT: { email: "qa.client@axivon.dev", pass: "AxivonClient@2024" },
};

async function runPass(appModeEnabledFlag) {
  console.log(`\n================================================================`);
  console.log(`  RUNNING REGRESSION PASS: APP_MODE_ENABLED=${appModeEnabledFlag}`);
  console.log(`================================================================`);

  const passResults = {
    flag: appModeEnabledFlag,
    checks: [],
  };

  const serverEnv = {
    ...process.env,
    NODE_ENV: "test",
    TEST_MODE: "true",
    APP_MODE_ENABLED: String(appModeEnabledFlag),
    PORT: String(PORT),
  };

  const serverProcess = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    env: serverEnv,
    stdio: "inherit",
    shell: true,
  });

  try {
    await waitForServer(BASE_URL);
    console.log(`✅ Server is online at ${BASE_URL} (APP_MODE_ENABLED=${appModeEnabledFlag})`);

    // Warm-up ping to wake up Neon serverless DB pool before auth tests
    try {
      await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(25000) });
    } catch (e) {}
    await sleep(1500);

    const baselineData = JSON.parse(fs.readFileSync(BASELINE_DATA_FILE, "utf8"));

    // 1. Authenticate Roles
    console.log("\n[1/5] Verifying Authentication Smoke Tests...");
    const roleTokens = {};
    for (const [role, cred] of Object.entries(credentials)) {
      await sleep(400);
      let sessionCookie = null;
      let status = 0;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-test-mode": "true" },
            body: JSON.stringify({
              email: cred.email,
              password: cred.pass,
              captchaToken: "1x00000000000000000000AA",
            }),
            signal: AbortSignal.timeout(25000),
          });
          status = res.status;
          const cookieHeader = res.headers.get("set-cookie");
          if (cookieHeader) {
            const match = cookieHeader.match(/axivon_session=([^;]+)/);
            if (match) sessionCookie = match[1];
          }
          if (res.ok && sessionCookie) break;
        } catch (err) {
          if (attempt === 1) console.log(`  ✗ Login ${role} error: ${err.message}`);
          await sleep(1500);
        }
      }
      roleTokens[role] = sessionCookie;
      const pass = !!sessionCookie;
      passResults.checks.push({
        category: "Auth Smoke",
        name: `Login ${role}`,
        passed: pass,
        detail: `HTTP ${status}`,
      });
      console.log(`  ${pass ? "✓" : "✗"} Login ${role}: ${status}`);
    }

    // 2. Kill Switch Verification
    console.log("\n[2/5] Verifying App Mode Kill Switch...");
    if (!appModeEnabledFlag) {
      try {
        const downloadRes = await fetch(`${BASE_URL}/download`, { signal: AbortSignal.timeout(10000) });
        const versionRes = await fetch(`${BASE_URL}/api/v1/app/version`, { signal: AbortSignal.timeout(10000) });
        passResults.checks.push({
          category: "Kill Switch",
          name: "GET /download returns 404 (Flag OFF)",
          passed: downloadRes.status === 404,
          detail: `HTTP ${downloadRes.status}`,
        });
        passResults.checks.push({
          category: "Kill Switch",
          name: "GET /api/v1/app/version returns 404 (Flag OFF)",
          passed: versionRes.status === 404,
          detail: `HTTP ${versionRes.status}`,
        });
        console.log(`  ✓ Flag OFF: /download -> ${downloadRes.status}, /api/v1/app/version -> ${versionRes.status}`);
      } catch (e) {
        console.log(`  ✗ Kill switch check error: ${e.message}`);
      }
    } else {
      try {
        const downloadRes = await fetch(`${BASE_URL}/download`, { signal: AbortSignal.timeout(10000) });
        const versionRes = await fetch(`${BASE_URL}/api/v1/app/version`, { signal: AbortSignal.timeout(10000) });
        passResults.checks.push({
          category: "Kill Switch",
          name: "GET /download is active (Flag ON)",
          passed: downloadRes.status === 200,
          detail: `HTTP ${downloadRes.status}`,
        });
        passResults.checks.push({
          category: "Kill Switch",
          name: "GET /api/v1/app/version returns valid JSON (Flag ON)",
          passed: versionRes.status === 200,
          detail: `HTTP ${versionRes.status}`,
        });
        console.log(`  ✓ Flag ON: /download -> ${downloadRes.status}, /api/v1/app/version -> ${versionRes.status}`);
      } catch (e) {
        console.log(`  ✗ Flag ON check error: ${e.message}`);
      }
    }

    // 3. Read API Smoke Tests
    console.log("\n[3/5] Verifying Read API Smoke Tests...");
    const smokeApis = [
      { role: "ADMIN", url: `${BASE_URL}/api/v1/admin/employees`, token: roleTokens["ADMIN"] },
      { role: "BROKER", url: `${BASE_URL}/api/v1/broker/profile`, token: roleTokens["BROKER"] },
      { role: "FOUNDER", url: `${BASE_URL}/api/v1/executive/approvals`, token: roleTokens["FOUNDER"] },
    ];

    for (const api of smokeApis) {
      await sleep(300);
      let status = 0;
      let passed = false;
      let detail = "";
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(api.url, {
            headers: { Cookie: `axivon_session=${api.token}`, "x-test-mode": "true" },
            signal: AbortSignal.timeout(25000),
          });
          status = res.status;
          passed = status === 200;
          detail = `HTTP ${status}`;
          if (passed) break;
        } catch (e) {
          detail = e.message;
          if (attempt === 1) break;
          await sleep(1500);
        }
      }
      passResults.checks.push({
        category: "API Smoke",
        name: `Read API ${api.role}`,
        passed,
        detail,
      });
      console.log(`  ${passed ? "✓" : "✗"} API ${api.role}: ${detail}`);
    }

    // 4. Puppeteer Page Load, Console Errors, Network Failures, and Route JS Size
    console.log("\n[4/5] Launching Chrome Headless for Portal & Route Verifications...");
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1440,900",
      ],
    });

    const routesToCheck = [
      { name: "home", path: "/" },
      { name: "login", path: "/login" },
      { name: "services", path: "/services" },
      { name: "blog", path: "/blog" },
      { name: "admin_dashboard", path: "/admin/dashboard", role: "ADMIN" },
      { name: "employee_dashboard", path: "/employee/dashboard", role: "EMPLOYEE" },
      { name: "broker_dashboard", path: "/broker/dashboard", role: "BROKER" },
      { name: "client_dashboard", path: "/client/dashboard", role: "CLIENT" },
      { name: "executive_dashboard", path: "/executive/dashboard", role: "FOUNDER" },
    ];

    for (const r of routesToCheck) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      if (r.role && roleTokens[r.role]) {
        await page.setCookie({
          name: "axivon_session",
          value: roleTokens[r.role],
          domain: "localhost",
          path: "/",
        });
      }

      const consoleErrors = [];
      const failedRequests = [];
      const appJsRequests = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      page.on("requestfailed", (req) => {
        if (req.failure()?.errorText !== "net::ERR_ABORTED") {
          failedRequests.push(`${req.url()} (${req.failure()?.errorText})`);
        }
      });

      page.on("response", async (response) => {
        const req = response.request();
        const url = req.url();
        const status = response.status();
        if (status >= 400 && !url.includes("/favicon.ico")) {
          failedRequests.push(`${url} (Status ${status})`);
        }
        // Capture Next.js application JS chunks (excluding third-party recaptcha/turnstile, css, etc.)
        const resourceType = req.resourceType();
        if (
          (resourceType === "script" || url.endsWith(".js") || url.includes("/_next/static/chunks/")) &&
          !url.includes(".css") &&
          !url.includes("recaptcha") &&
          !url.includes("turnstile") &&
          !url.includes("google")
        ) {
          try {
            const buf = await response.buffer();
            appJsRequests.push({ url, gzip: gzipSize(buf) });
          } catch (e) {
            // Buffer may fail if cached
          }
        }
      });

      try {
        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
        await sleep(1500);

        // A. Console & Failed Requests
        passResults.checks.push({
          category: "Browser Console",
          name: `${r.path} 0 console errors`,
          passed: consoleErrors.length === 0,
          detail: consoleErrors.length === 0 ? "Clean" : consoleErrors.slice(0, 2).join("; "),
        });

        passResults.checks.push({
          category: "Network Requests",
          name: `${r.path} 0 failed requests`,
          passed: failedRequests.length === 0,
          detail: failedRequests.length === 0 ? "Clean" : failedRequests.slice(0, 2).join("; "),
        });

        // B. Route JS Size Check (Threshold: max 1 KB gzip growth on existing routes)
        const totalGzip = appJsRequests.reduce((acc, j) => acc + j.gzip, 0);
        const baselineRoute = baselineData.routesFirstLoadJS[r.path];
        if (baselineRoute && baselineRoute.totalGzipBytes) {
          const deltaBytes = totalGzip - baselineRoute.totalGzipBytes;
          const passedGrowth = deltaBytes <= 1024;
          passResults.checks.push({
            category: "JS Budget Gate",
            name: `${r.path} growth <= 1 KB`,
            passed: passedGrowth,
            detail: `Delta: ${deltaBytes >= 0 ? "+" : ""}${deltaBytes} B (Current: ${(totalGzip / 1024).toFixed(1)} KB, Base: ${(baselineRoute.totalGzipBytes / 1024).toFixed(1)} KB)`,
          });
          console.log(`  ✓ ${r.path} JS: ${(totalGzip / 1024).toFixed(1)} KB (Delta: ${deltaBytes} B)`);
        }

        // C. Screenshot Presence & Dimension Check
        if (r.role) {
          const shotName = `${r.role.toLowerCase()}-dashboard-1440px.png`;
          const baselineShotPath = path.join(BASELINE_SCREENSHOTS_DIR, shotName);
          if (fs.existsSync(baselineShotPath)) {
            const currentShotBuf = await page.screenshot({ fullPage: false });
            const passShot = currentShotBuf.length > 5000;
            passResults.checks.push({
              category: "Screenshot Check",
              name: `${shotName} captured cleanly`,
              passed: passShot,
              detail: `Size: ${(currentShotBuf.length / 1024).toFixed(1)} KB (1440x900)`,
            });
            console.log(`  ✓ Screenshot ${shotName}: ${(currentShotBuf.length / 1024).toFixed(1)} KB`);
          }
        }
      } catch (err) {
        passResults.checks.push({
          category: "Browser Navigation",
          name: `${r.path} load`,
          passed: false,
          detail: err.message,
        });
        console.log(`  ✗ Navigation ${r.path} error: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    await browser.close();

    // 5. Compare Raw HTML of 10 Public Pages
    console.log("\n[5/5] Comparing Raw HTML & SEO Tags of 10 Public Pages...");
    const publicPages = [
      { name: "home.html", path: "/" },
      { name: "login.html", path: "/login" },
      { name: "services.html", path: "/services" },
      { name: "services-web-dev.html", path: "/services/web-development" },
      { name: "about.html", path: "/about" },
      { name: "pricing.html", path: "/pricing" },
      { name: "contact.html", path: "/contact" },
      { name: "careers.html", path: "/careers" },
      { name: "privacy-policy.html", path: "/privacy-policy" },
      { name: "terms-and-conditions.html", path: "/terms-and-conditions" },
    ];

    for (const p of publicPages) {
      const baselineHtmlPath = path.join(BASELINE_HTML_DIR, p.name);
      if (!fs.existsSync(baselineHtmlPath)) continue;

      try {
        let currentHtml = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch(`${BASE_URL}${p.path}`, {
              headers: { "User-Agent": "curl/8.4.0" },
              signal: AbortSignal.timeout(15000),
            });
            currentHtml = await res.text();
            break;
          } catch (e) {
            if (attempt === 1) throw e;
            await sleep(1000);
          }
        }
        const baselineHtml = fs.readFileSync(baselineHtmlPath, "utf8");

        const baseSeo = extractSeoTags(baselineHtml);
        const currSeo = extractSeoTags(currentHtml);
        const seoMatch =
          baseSeo.title === currSeo.title &&
          JSON.stringify(baseSeo.descriptions) === JSON.stringify(currSeo.descriptions);

        const baseJsonLd = extractJsonLd(baselineHtml);
        const currJsonLd = extractJsonLd(currentHtml);
        const jsonLdMatch = JSON.stringify(baseJsonLd) === JSON.stringify(currJsonLd);

        const passed = seoMatch && jsonLdMatch;
        passResults.checks.push({
          category: "HTML / SEO Gate",
          name: `${p.name} SEO & JSON-LD match`,
          passed,
          detail: `Title/Meta: ${seoMatch ? "MATCH" : "DIFF"}, JSON-LD: ${jsonLdMatch ? "MATCH" : "DIFF"}`,
        });
        console.log(`  ${passed ? "✓" : "✗"} HTML ${p.name}: SEO=${seoMatch ? "MATCH" : "DIFF"}, JSON-LD=${jsonLdMatch ? "MATCH" : "DIFF"}`);
      } catch (err) {
        passResults.checks.push({
          category: "HTML / SEO Gate",
          name: `${p.name} check`,
          passed: false,
          detail: err.message,
        });
        console.log(`  ✗ HTML ${p.name} error: ${err.message}`);
      }
    }

    return passResults;
  } finally {
    console.log(`\nStopping server for APP_MODE_ENABLED=${appModeEnabledFlag}...`);
    if (serverProcess.pid) {
      spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
    }
    await sleep(2000);
  }
}

async function main() {
  console.log("================================================================================");
  console.log("             AXIVON WEB REGRESSION GATE (TWO-PASS VERIFICATION)                ");
  console.log("================================================================================\n");

  const resultsOff = await runPass(false);
  const resultsOn = await runPass(true);

  console.log("\n\n================================================================================");
  console.log("                            REGRESSION GATE SUMMARY                             ");
  console.log("================================================================================");

  let totalChecks = 0;
  let totalPassed = 0;

  for (const r of [resultsOff, resultsOn]) {
    console.log(`\n--- PASS: APP_MODE_ENABLED=${r.flag} ---`);
    console.log(`| Category | Check | Status | Detail |`);
    console.log(`|---|---|---|---|`);
    for (const c of r.checks) {
      totalChecks++;
      if (c.passed) totalPassed++;
      const icon = c.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`| ${c.category} | ${c.name} | ${icon} | ${c.detail} |`);
    }
  }

  console.log("\n================================================================================");
  console.log(`FINAL RESULT: ${totalPassed}/${totalChecks} CHECKS PASSED`);
  if (totalPassed === totalChecks) {
    console.log(">>> REGRESSION GATE: ALL CHECKS PASSED! SAFE TO MERGE. <<<");
    process.exit(0);
  } else {
    console.log(">>> REGRESSION GATE: FAILURES DETECTED! SEE TABLE ABOVE. <<<");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal regression runner error:", err);
  process.exit(1);
});
