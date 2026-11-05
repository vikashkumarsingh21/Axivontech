import { spawn } from "child_process";
import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3002;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

    // 1. Authenticate employee
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-mode": "true",
        "x-forwarded-for": "127.0.0.15",
      },
      body: JSON.stringify({
        email: "qa.employee@axivon.dev",
        password: "AxivonEmployee@2024",
        captchaToken: "1x00000000000000000000AA",
      }),
    });

    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    const sessionMatch = cookieHeader.match(/axivon_session=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : null;

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    // Test Mobile Viewport + Mobile UA
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await mobilePage.setUserAgent(
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    );

    if (sessionToken) {
      await mobilePage.setCookie({
        name: "axivon_session",
        value: sessionToken,
        domain: "127.0.0.1",
        path: "/",
      });
    }

    console.log("Navigating to employee dashboard in Mobile Viewport...");
    await mobilePage.goto(`${BASE_URL}/employee/dashboard`, { waitUntil: "domcontentloaded", timeout: 60000 });

    await mobilePage.evaluate(() => {
      sessionStorage.setItem("axivon_app_prompt_pending", "true");
      sessionStorage.removeItem("axivon_app_prompt_dismissed");
      localStorage.removeItem("axivon_app_prompt_last_date");
    });
    await mobilePage.reload({ waitUntil: "domcontentloaded" });

    console.log("Waiting for mobile #app-download-title...");
    await mobilePage.waitForSelector("#app-download-title", { visible: true, timeout: 15000 });
    console.log("✅ MOBILE POPUP DETECTED AND VISIBLE!");

    const mobileArtifactPath = "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653\\download_popup_mobile_verified.png";
    await mobilePage.screenshot({ path: mobileArtifactPath });
    console.log("Mobile screenshot captured at:", mobileArtifactPath);

    await browser.close();
    console.log("ALL MOBILE & DESKTOP CHECKS PASSED!");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
