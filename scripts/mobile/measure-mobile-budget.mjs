import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

const PIXEL_7_VIEWPORT = {
  width: 412,
  height: 915,
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
};

const PIXEL_7_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

const credentials = {
  ADMIN: { email: "admin@axivon.dev", pass: "AxivonAdmin@2024" },
  FOUNDER: { email: "founder@axivon.dev", pass: "AxivonFounder@2024" },
  EMPLOYEE: { email: "qa.employee@axivon.dev", pass: "AxivonEmployee@2024" },
  BROKER: { email: "qa.broker@axivon.dev", pass: "AxivonBroker@2024" },
  CLIENT: { email: "qa.client@axivon.dev", pass: "AxivonClient@2024" },
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch (e) {
      // Retry
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} failed to start within ${timeoutMs}ms`);
}

async function loginRole(email, password) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-test-mode": "true" },
        body: JSON.stringify({
          email,
          password,
          captchaToken: "1x00000000000000000000AA",
        }),
        signal: AbortSignal.timeout(20000),
      });
      const cookieHeader = res.headers.get("set-cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/axivon_session=([^;]+)/);
        if (match) return match[1];
      }
    } catch (e) {
      await sleep(1000);
    }
  }
  return null;
}

async function main() {
  console.log("Starting Next.js server for Mobile Data Budget measurement...");
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    env: { ...process.env, NODE_ENV: "test", TEST_MODE: "true" },
    stdio: "inherit",
    shell: true,
  });

  try {
    await waitForServer(BASE_URL);
    console.log("Server online! Authenticating test roles...");

    const roleTokens = {};
    for (const [role, cred] of Object.entries(credentials)) {
      await sleep(600);
      roleTokens[role] = await loginRole(cred.email, cred.pass);
      console.log(`  ✓ ${role} logged in: ${!!roleTokens[role]}`);
      await sleep(600);
    }

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
    });

    const results = {
      timestamp: new Date().toISOString(),
      pixel7: {
        viewport: PIXEL_7_VIEWPORT,
        userAgent: PIXEL_7_UA,
      },
      login: null,
      dashboards: {},
      idlePolls: null,
      heaviestApis: [],
    };

    // 1. Measure Login Page (Cold Cache)
    console.log("\n[1] Measuring /login (Mobile Pixel 7, Cold Cache)...");
    const loginPage = await browser.newPage();
    await loginPage.setViewport(PIXEL_7_VIEWPORT);
    await loginPage.setUserAgent(PIXEL_7_UA);

    const client = await loginPage.target().createCDPSession();
    await client.send("Network.enable");

    let loginTransferred = 0;
    let loginNextJsJsTransferred = 0;
    let loginCaptchaTransferred = 0;
    let loginReqCount = 0;

    client.on("Network.loadingFinished", (event) => {
      loginTransferred += event.encodedDataLength;
    });

    loginPage.on("response", async (res) => {
      loginReqCount++;
      const url = res.url();
      const headers = res.headers();
      const cl = parseInt(headers["content-length"] || "0", 10);
      if (url.includes("/_next/static/chunks/")) {
        loginNextJsJsTransferred += cl;
      }
      if (url.includes("recaptcha") || url.includes("turnstile") || url.includes("challenges.cloudflare")) {
        loginCaptchaTransferred += cl;
      }
    });

    await loginPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);

    results.login = {
      totalTransferredBytes: loginTransferred,
      totalTransferredKB: (loginTransferred / 1024).toFixed(2),
      requestCount: loginReqCount,
      nextJsJsBytes: loginNextJsJsTransferred,
      captchaBytes: loginCaptchaTransferred,
    };
    console.log(`  ✓ /login Total Transferred: ${(loginTransferred / 1024).toFixed(2)} KB in ${loginReqCount} reqs`);
    await loginPage.close();

    // 2. Measure Each Role Dashboard (Cold vs Warm Repeat Load)
    const dashboardRoutes = [
      { role: "ADMIN", path: "/admin/dashboard" },
      { role: "EMPLOYEE", path: "/employee/dashboard" },
      { role: "BROKER", path: "/broker/dashboard" },
      { role: "CLIENT", path: "/client/dashboard" },
      { role: "FOUNDER", path: "/executive/dashboard" },
    ];

    console.log("\n[2] Measuring Role Dashboards (Cold vs Warm Load)...");
    for (const item of dashboardRoutes) {
      const page = await browser.newPage();
      await page.setViewport(PIXEL_7_VIEWPORT);
      await page.setUserAgent(PIXEL_7_UA);

      if (roleTokens[item.role]) {
        await page.setCookie({
          name: "axivon_session",
          value: roleTokens[item.role],
          domain: "localhost",
          path: "/",
        });
      }

      const cdp = await page.target().createCDPSession();
      await cdp.send("Network.enable");

      // Cold Load
      let coldBytes = 0;
      let coldReqs = 0;
      cdp.on("Network.loadingFinished", (ev) => {
        coldBytes += ev.encodedDataLength;
      });
      page.on("request", () => coldReqs++);

      await page.goto(`${BASE_URL}${item.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await sleep(3000);

      const coldTotal = coldBytes;
      const coldTotalReqs = coldReqs;

      // Warm Repeat Load (same page navigation with browser cache enabled)
      let warmBytes = 0;
      let warmReqs = 0;
      const warmFinishedListener = (ev) => {
        warmBytes += ev.encodedDataLength;
      };
      cdp.on("Network.loadingFinished", warmFinishedListener);
      page.on("request", () => warmReqs++);

      await page.goto(`${BASE_URL}${item.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await sleep(2000);

      results.dashboards[item.role] = {
        path: item.path,
        coldTransferredBytes: coldTotal,
        coldTransferredKB: (coldTotal / 1024).toFixed(2),
        coldReqs: coldTotalReqs,
        warmTransferredBytes: warmBytes,
        warmTransferredKB: (warmBytes / 1024).toFixed(2),
        warmReqs,
      };

      console.log(
        `  ✓ ${item.role} (${item.path}): Cold = ${(coldTotal / 1024).toFixed(2)} KB (${coldTotalReqs} reqs) | Warm = ${(warmBytes / 1024).toFixed(2)} KB`
      );

      // If this is EMPLOYEE or ADMIN, test idle background polling
      if (item.role === "EMPLOYEE" && !results.idlePolls) {
        console.log("  Measuring 30s idle polling activity...");
        let idleReqs = 0;
        let idleBytes = 0;
        const idleReqUrls = [];

        page.on("response", (res) => {
          idleReqs++;
          idleReqUrls.push(res.url());
        });
        cdp.on("Network.loadingFinished", (ev) => {
          idleBytes += ev.encodedDataLength;
        });

        await sleep(30000); // 30s sample

        results.idlePolls = {
          sampleDurationSec: 30,
          idleVisibleRequestsPer30s: idleReqs,
          idleVisibleTransferredKBPer30s: (idleBytes / 1024).toFixed(2),
          extrapolated1MinRequests: idleReqs * 2,
          extrapolated5MinRequests: idleReqs * 10,
          extrapolated5MinKB: ((idleBytes * 10) / 1024).toFixed(2),
          observedEndpoints: [...new Set(idleReqUrls.map((u) => u.replace(BASE_URL, "")))],
        };
        console.log(
          `  ✓ Idle Polling (30s): ${idleReqs} reqs (${(idleBytes / 1024).toFixed(2)} KB). 5-min extrapolation: ${idleReqs * 10} reqs, ${((idleBytes * 10) / 1024).toFixed(2)} KB`
        );
      }

      await page.close();
    }

    // 3. Inspect Heaviest API Payloads
    console.log("\n[3] Measuring 10 Heaviest Dashboard APIs...");
    const sampleApis = [
      { role: "ADMIN", url: "/api/v1/admin/employees?page=1&limit=20" },
      { role: "ADMIN", url: "/api/v1/admin/calendar/holidays" },
      { role: "ADMIN", url: "/api/v1/notifications" },
      { role: "FOUNDER", url: "/api/v1/executive/approvals" },
      { role: "FOUNDER", url: "/api/v1/executive/analytics" },
      { role: "EMPLOYEE", url: "/api/v1/employee/attendance" },
      { role: "EMPLOYEE", url: "/api/v1/employee/tasks" },
      { role: "EMPLOYEE", url: "/api/v1/announcements" },
      { role: "BROKER", url: "/api/v1/broker/profile" },
      { role: "CLIENT", url: "/api/v1/client/projects" },
    ];

    for (const a of sampleApis) {
      try {
        const token = roleTokens[a.role];
        const res = await fetch(`${BASE_URL}${a.url}`, {
          headers: { Cookie: `axivon_session=${token}`, "x-test-mode": "true" },
        });
        const text = await res.text();
        const uncompressedBytes = Buffer.byteLength(text, "utf8");
        results.heaviestApis.push({
          role: a.role,
          url: a.url,
          status: res.status,
          bytes: uncompressedBytes,
          kb: (uncompressedBytes / 1024).toFixed(2),
        });
        console.log(`  ✓ API ${a.url} (${a.role}): ${(uncompressedBytes / 1024).toFixed(2)} KB (${uncompressedBytes} B)`);
      } catch (err) {
        console.log(`  ✗ API ${a.url} error: ${err.message}`);
      }
    }

    // Sort heaviest APIs descending
    results.heaviestApis.sort((a, b) => b.bytes - a.bytes);

    await browser.close();

    fs.writeFileSync(
      path.join(process.cwd(), "docs", "mobile", "baseline", "mobile-budget-data.json"),
      JSON.stringify(results, null, 2)
    );
    console.log("\n✅ Mobile budget raw data saved to docs/mobile/baseline/mobile-budget-data.json");
    return results;
  } finally {
    console.log("Shutting down measurement server...");
    spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
  }
}

main().catch((err) => {
  console.error("Fatal measurement error:", err);
  process.exit(1);
});
