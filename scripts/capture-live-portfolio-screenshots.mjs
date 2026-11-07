import puppeteer from "puppeteer-core";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.resolve(process.cwd(), "public/assets/images/portfolio");
const TEMP_PROFILE = path.resolve(process.cwd(), `.temp_puppeteer_live_${Date.now()}`);

const SITES = [
  {
    name: "purvarang-family-restaurant",
    url: "https://purvarang-family-restaurant.onrender.com/",
    outputJpg: path.join(OUTPUT_DIR, "purvarang-family-restaurant.jpg"),
    outputWebp: path.join(OUTPUT_DIR, "purvarang-family-restaurant.webp"),
  },
  {
    name: "udaan-furniture",
    url: "https://udaan-furniture.onrender.com/",
    outputJpg: path.join(OUTPUT_DIR, "udaan-furniture.jpg"),
    outputWebp: path.join(OUTPUT_DIR, "udaan-furniture.webp"),
  },
];

async function capture() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Connecting to Chrome at ${CHROME_PATH} ...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    userDataDir: TEMP_PROFILE,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });

    for (const site of SITES) {
      console.log(`Navigating to ${site.name}: ${site.url} ...`);
      await page.goto(site.url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // Allow animations, fonts and hero image loading to settle
      await new Promise((r) => setTimeout(r, 3000));

      const tempCapturePath = path.resolve(process.cwd(), `temp_${site.name}.png`);
      // Capture viewport (above the fold)
      await page.screenshot({ path: tempCapturePath, fullPage: false });
      console.log(`Captured raw screenshot: ${tempCapturePath}`);

      // Resize and crop to 1000x667 using sharp
      await sharp(tempCapturePath)
        .resize(1000, 667, { fit: "cover", position: "top" })
        .jpeg({ quality: 86, progressive: true })
        .toFile(site.outputJpg);

      console.log(`Saved optimized JPEG: ${site.outputJpg}`);

      // Also generate WebP
      await sharp(tempCapturePath)
        .resize(1000, 667, { fit: "cover", position: "top" })
        .webp({ quality: 86 })
        .toFile(site.outputWebp);

      console.log(`Saved optimized WebP: ${site.outputWebp}`);

      // Clean temp capture
      fs.unlinkSync(tempCapturePath);
    }

    console.log("Both live site screenshots captured and optimized successfully!");
  } finally {
    await browser.close();
    try {
      fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
    } catch (e) {}
  }
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
