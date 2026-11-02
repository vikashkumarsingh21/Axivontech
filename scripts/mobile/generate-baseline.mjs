import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import zlib from "zlib";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.resolve("./docs/mobile/baseline/screenshots");
const BASELINE_DATA_FILE = path.resolve("./docs/mobile/baseline/baseline-data.json");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

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
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return true;
    } catch (e) {
      // Wait and retry
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} failed to start within ${timeoutMs}ms`);
}

async function run() {
  console.log("=== STEP 1: GENERATING BASELINE SNAPSHOT ===");
  console.log("Starting Next.js production server on port", PORT, "with TEST_MODE=true...");

  const serverEnv = {
    ...process.env,
    NODE_ENV: "development",
    TEST_MODE: "true",
    PORT: String(PORT),
  };

  const serverProcess = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    env: serverEnv,
    stdio: "inherit",
    shell: true,
  });

  serverProcess.on("error", (err) => {
    console.error("Failed to start Next.js server:", err);
  });

  try {
    await waitForServer(BASE_URL);
    console.log("✅ Next.js server is ready at", BASE_URL);

    // 1. Launch Puppeteer
    console.log("Launching Puppeteer from:", CHROME_PATH);
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

    const baselineData = {
      timestamp: new Date().toISOString(),
      routesFirstLoadJS: {},
      authSmokeTests: [],
      apiSmokeTests: [],
      responseHeaders: {},
      screenshots: [],
    };

    // 2. Measure Route First Load JS Sizes
    console.log("\n--- MEASURING FIRST LOAD JS PER ROUTE ---");
    const routesToMeasure = [
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

    // Helper to get session cookie for a role
    async function loginRole(email, password) {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-test-mode": "true",
        },
        body: JSON.stringify({
          email,
          password,
          captchaToken: "1x00000000000000000000AA",
        }),
      });
      const cookieHeader = res.headers.get("set-cookie");
      let sessionCookie = null;
      if (cookieHeader) {
        const match = cookieHeader.match(/axivon_session=([^;]+)/);
        if (match) sessionCookie = match[1];
      }
      return { status: res.status, ok: res.ok, sessionCookie };
    }

    // Role credentials
    const credentials = {
      ADMIN: { email: "admin@axivon.dev", pass: "AxivonAdmin@2024" },
      FOUNDER: { email: "founder@axivon.dev", pass: "AxivonFounder@2024" },
      EMPLOYEE: { email: "qa.employee@axivon.dev", pass: "AxivonEmployee@2024" },
      BROKER: { email: "qa.broker@axivon.dev", pass: "AxivonBroker@2024" },
      CLIENT: { email: "qa.client@axivon.dev", pass: "AxivonClient@2024" },
    };

    const roleTokens = {};
    for (const [role, cred] of Object.entries(credentials)) {
      console.log(`Authenticating ${role}...`);
      const auth = await loginRole(cred.email, cred.pass);
      roleTokens[role] = auth.sessionCookie;
      baselineData.authSmokeTests.push({
        role,
        email: cred.email,
        status: auth.status,
        passed: auth.ok && !!auth.sessionCookie,
      });
      console.log(`  ✓ Auth status: ${auth.status}, session: ${!!auth.sessionCookie}`);
    }

    // 3. Smoke API List (login already done, now read API per role)
    console.log("\n--- RUNNING READ API SMOKE TESTS ---");
    const smokeApis = [
      { role: "ADMIN", url: `${BASE_URL}/api/v1/admin/employees`, token: roleTokens["ADMIN"] },
      { role: "FOUNDER", url: `${BASE_URL}/api/v1/executive/dashboard`, token: roleTokens["FOUNDER"] },
      { role: "EMPLOYEE", url: `${BASE_URL}/api/v1/employee/attendance`, token: roleTokens["EMPLOYEE"] },
      { role: "BROKER", url: `${BASE_URL}/api/v1/broker/profile`, token: roleTokens["BROKER"] },
      { role: "CLIENT", url: `${BASE_URL}/api/v1/client/projects`, token: roleTokens["CLIENT"] },
    ];

    for (const api of smokeApis) {
      console.log(`Checking API: ${api.role} -> ${api.url}`);
      try {
        const res = await fetch(api.url, {
          headers: {
            Cookie: `axivon_session=${api.token}`,
            "x-test-mode": "true",
          },
        });
        const json = await res.json().catch(() => ({}));
        const passed = res.status >= 200 && res.status < 400;
        baselineData.apiSmokeTests.push({
          role: api.role,
          url: api.url.replace(BASE_URL, ""),
          status: res.status,
          passed,
        });
        console.log(`  ✓ Status: ${res.status}, Passed: ${passed}`);
      } catch (e) {
        baselineData.apiSmokeTests.push({
          role: api.role,
          url: api.url.replace(BASE_URL, ""),
          status: 0,
          passed: false,
          error: e.message,
        });
        console.error(`  ❌ Failed: ${e.message}`);
      }
    }

    // 4. Measure First Load JS and Take Screenshots
    for (const r of routesToMeasure) {
      console.log(`Measuring route: ${r.path} ...`);
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

      const jsRequests = [];
      page.on("response", async (response) => {
        const req = response.request();
        const url = req.url();
        const resourceType = req.resourceType();
        if (resourceType === "script" || url.endsWith(".js") || url.includes("/_next/static/chunks/")) {
          try {
            const buf = await response.buffer();
            const uncompressed = buf.length;
            const gzip = gzipSize(buf);
            jsRequests.push({ url, uncompressed, gzip });
          } catch (e) {
            // Buffer might fail for cached or aborted requests
          }
        }
      });

      try {
        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "networkidle2", timeout: 30000 });
        await sleep(1000);

        const totalUncompressed = jsRequests.reduce((acc, j) => acc + j.uncompressed, 0);
        const totalGzip = jsRequests.reduce((acc, j) => acc + j.gzip, 0);

        baselineData.routesFirstLoadJS[r.path] = {
          scriptCount: jsRequests.length,
          totalUncompressedBytes: totalUncompressed,
          totalGzipBytes: totalGzip,
          totalGzipKB: (totalGzip / 1024).toFixed(2),
        };
        console.log(`  ✓ ${r.path} -> ${jsRequests.length} scripts, ${(totalGzip / 1024).toFixed(2)} KB gzip`);

        // Screenshot for role pages
        if (r.role) {
          const shotName = `${r.role.toLowerCase()}-dashboard-1440px.png`;
          const shotPath = path.join(SCREENSHOTS_DIR, shotName);
          await page.screenshot({ path: shotPath, fullPage: false });
          console.log(`  📷 Saved screenshot: ${shotName}`);
          baselineData.screenshots.push({ role: r.role, path: r.path, filename: shotName });
        }
      } catch (err) {
        console.error(`  ❌ Failed on ${r.path}:`, err.message);
        baselineData.routesFirstLoadJS[r.path] = { error: err.message };
      } finally {
        await page.close();
      }
    }

    // 5. Inspect Response Headers
    console.log("\n--- RECORDING CURRENT RESPONSE HEADERS ---");
    // Find static JS file URL
    const staticSample = Object.values(baselineData.routesFirstLoadJS)
      .find((r) => r.scriptCount > 0);

    // Let's test a known static chunk, font, image, html, and authenticated API
    // Static JS chunk
    let sampleChunkUrl = null;
    const staticDir = path.resolve(".next/static/chunks");
    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir).filter((f) => f.endsWith(".js"));
      if (files.length > 0) sampleChunkUrl = `${BASE_URL}/_next/static/chunks/${files[0]}`;
    }

    const headerTargets = [
      { name: "html_home", url: `${BASE_URL}/` },
      { name: "html_login", url: `${BASE_URL}/login` },
      { name: "static_chunk", url: sampleChunkUrl },
      { name: "api_auth", url: `${BASE_URL}/api/v1/admin/employees`, token: roleTokens["ADMIN"] },
      { name: "api_broker", url: `${BASE_URL}/api/v1/broker/profile`, token: roleTokens["BROKER"] },
    ];

    for (const target of headerTargets) {
      if (!target.url) continue;
      try {
        const headers = target.token ? { Cookie: `axivon_session=${target.token}` } : {};
        const res = await fetch(target.url, { headers });
        const cacheControl = res.headers.get("cache-control");
        const contentEncoding = res.headers.get("content-encoding");
        const contentType = res.headers.get("content-type");
        baselineData.responseHeaders[target.name] = {
          url: target.url.replace(BASE_URL, ""),
          status: res.status,
          cacheControl: cacheControl || "none",
          contentEncoding: contentEncoding || "none",
          contentType: contentType || "none",
        };
        console.log(`  ✓ ${target.name}: Cache-Control="${cacheControl}", Content-Encoding="${contentEncoding}"`);
      } catch (e) {
        console.error(`  ❌ Failed header check for ${target.name}:`, e.message);
      }
    }

    await browser.close();

    // 6. Save baseline-data.json
    fs.writeFileSync(BASELINE_DATA_FILE, JSON.stringify(baselineData, null, 2), "utf8");
    console.log("\n✅ Baseline data recorded successfully to:", BASELINE_DATA_FILE);
  } finally {
    console.log("Shutting down Next.js server...");
    // Kill child process on Windows
    if (serverProcess.pid) {
      spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
    }
  }
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
