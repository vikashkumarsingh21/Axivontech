import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const ARTIFACT_DIR = "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653";
const TEMP_PROFILE = path.resolve(process.cwd(), `.temp_puppeteer_mob_${Date.now()}`);

async function captureMobile() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    userDataDir: TEMP_PROFILE,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

    // 1. Mobile Home Selected Projects
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    const portfolioSec = await page.$("#portfolio");
    if (portfolioSec) {
      await portfolioSec.screenshot({ path: path.join(ARTIFACT_DIR, "portfolio_home_mobile.png") });
    }

    // 2. Mobile Purvarang Detail
    await page.goto(`${BASE_URL}/portfolio/purvarang-family-restaurant`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "portfolio_purvarang_mobile.png"), fullPage: false });

    // 3. Mobile Udaan Detail
    await page.goto(`${BASE_URL}/portfolio/udaan-furniture`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "portfolio_udaan_mobile.png"), fullPage: false });

    console.log("Mobile responsive screenshots captured successfully!");
  } finally {
    await browser.close();
    try {
      fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
    } catch (e) {}
  }
}

captureMobile().catch(console.error);
