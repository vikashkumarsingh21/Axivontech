import { spawn } from "child_process";
import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3003;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const APP_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 AxivonApp/1.0.0";

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

async function main() {
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

  console.log("Starting Next.js server on port", PORT);
  const server = spawn("npx.cmd", ["next", "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    env: serverEnv,
    stdio: "inherit",
    shell: true,
  });

  try {
    await waitForServer(BASE_URL);
    console.log("Server ready at", BASE_URL);

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.setUserAgent(APP_UA);

    const errors = [];
    page.on("pageerror", (err) => {
      console.error("PAGE_ERROR:", err.message);
      errors.push({ type: "pageerror", message: err.message });
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("CONSOLE_ERROR:", msg.text());
        errors.push({ type: "console", text: msg.text() });
      }
    });

    // TEST 1: Open /app (Initial APK entry point)
    console.log("\n--- Testing Route 1: /app ---");
    await page.goto(`${BASE_URL}/app`, { waitUntil: "networkidle2", timeout: 30000 });
    console.log("Current URL after /app:", page.url());
    const appBody = await page.evaluate(() => document.body.innerText);
    console.log("Body preview (first 100 chars):", appBody.slice(0, 100).replace(/\n/g, " "));
    await page.screenshot({ path: "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653\\test_app_entry.png" });

    // TEST 2: Open /app/login directly
    console.log("\n--- Testing Route 2: /app/login ---");
    await page.goto(`${BASE_URL}/app/login`, { waitUntil: "networkidle2", timeout: 30000 });
    console.log("Current URL after /app/login:", page.url());
    const loginBody = await page.evaluate(() => document.body.innerText);
    console.log("Login Body preview:", loginBody.slice(0, 100).replace(/\n/g, " "));
    await page.screenshot({ path: "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653\\test_app_login.png" });

    // TEST 3: Open /app/forgot-password
    console.log("\n--- Testing Route 3: /app/forgot-password ---");
    await page.goto(`${BASE_URL}/app/forgot-password`, { waitUntil: "networkidle2", timeout: 30000 });
    console.log("Current URL after /app/forgot-password:", page.url());
    await page.screenshot({ path: "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653\\test_app_forgot_password.png" });

    // TEST 4: Login via /app/login with employee credentials
    console.log("\n--- Testing Login Flow on /app/login ---");
    await page.goto(`${BASE_URL}/app/login`, { waitUntil: "networkidle2", timeout: 30000 });
    await page.type("#app-email", "qa.employee@axivon.dev");
    await page.type("#app-password", "AxivonEmployee@2024");
    // Submit form
    await page.click('button[type="submit"]');
    await sleep(3000);
    console.log("Current URL after login:", page.url());
    await page.screenshot({ path: "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653\\test_app_dashboard.png" });

    await browser.close();
    console.log("\nErrors recorded:", errors);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
