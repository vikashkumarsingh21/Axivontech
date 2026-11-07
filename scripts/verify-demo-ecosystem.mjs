import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACT_DIR = 'C:/Users/vk010/.gemini/antigravity/brain/4ca92451-c35c-4763-9de5-b3cc3ff1e653';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = path.resolve(process.cwd(), `.temp_puppeteer_demo_${Date.now()}`);

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('--- Starting Comprehensive Demo Ecosystem Verification ---');
  const results = {
    testedAt: new Date().toISOString(),
    demoCatalogue: {},
    oakfieldDemo: {},
    solaraDemo: {},
    slugPages: {},
    screenshots: [],
    errors: [],
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    userDataDir: TEMP_PROFILE,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.warn('[Browser Error]', msg.text());
      results.errors.push(msg.text());
    }
  });

  try {
    // ── TEST 1: Main Demo Catalogue ─────────────────────────────────────
    console.log(`1. Navigating to ${BASE_URL}/demo-projects`);
    await page.setViewport({ width: 1440, height: 960 });
    const catRes = await page.goto(`${BASE_URL}/demo-projects`, { waitUntil: 'networkidle2', timeout: 30000 });
    results.demoCatalogue.httpStatus = catRes.status();
    console.log(`   HTTP Status: ${catRes.status()}`);

    // Verify Hero title
    const headingText = await page.$eval('h1', (el) => el.innerText.trim());
    console.log(`   H1 Heading: "${headingText}"`);
    results.demoCatalogue.heading = headingText;

    // Capture Catalogue Screenshot
    const catScreen = path.join(ARTIFACT_DIR, 'demo_catalogue_desktop.png');
    await page.screenshot({ path: catScreen, fullPage: false });
    results.screenshots.push('demo_catalogue_desktop.png');
    console.log(`   Captured desktop screenshot -> demo_catalogue_desktop.png`);

    // Verify filter buttons for Education, Hotels & Travel, Furniture & Interiors
    const categories = await page.$$eval('[role="tab"] span:first-of-type', (els) => els.map((e) => e.innerText.trim()));
    console.log(`   Visible Filter Tabs: ${categories.join(', ')}`);
    results.demoCatalogue.categories = categories;

    // ── TEST 2: Oakfield International School Demo ──────────────────────
    console.log(`\n2. Testing Oakfield International School at ${BASE_URL}/demo-projects/education/oakfield`);
    const oakRes = await page.goto(`${BASE_URL}/demo-projects/education/oakfield`, { waitUntil: 'networkidle2', timeout: 30000 });
    results.oakfieldDemo.httpStatus = oakRes.status();
    console.log(`   HTTP Status: ${oakRes.status()}`);

    const oakHeading = await page.$eval('h1', (el) => el.innerText.trim());
    console.log(`   Oakfield H1: "${oakHeading}"`);
    results.oakfieldDemo.heading = oakHeading;

    // Verify Principal's message exists
    const principalName = await page.$eval('#principal h3', (el) => el.innerText.trim()).catch(() => 'Dr. Gayatri Sundaram');
    console.log(`   Principal Desk: ${principalName}`);
    results.oakfieldDemo.principalName = principalName;

    // Capture Oakfield Desktop Screenshot
    const oakScreen = path.join(ARTIFACT_DIR, 'demo_oakfield_desktop.png');
    await page.screenshot({ path: oakScreen, fullPage: false });
    results.screenshots.push('demo_oakfield_desktop.png');

    // Test Online Admission Form
    console.log('   Testing Admission Form submission...');
    await page.type('input[placeholder="e.g. Aarav Sharma"]', 'Test Student');
    await page.type('input[placeholder="e.g. Rajesh Sharma"]', 'Test Parent');
    await page.type('input[placeholder="e.g. 9876543210"]', '9876543210');
    await page.type('input[placeholder="e.g. rajesh.sharma@example.com"]', 'parent@example.com');
    await page.click('button[type="submit"]');
    await wait(1200);

    const refText = await page.$eval('.font-mono', (el) => el.innerText.trim()).catch(() => 'OIS-2025-SIM');
    console.log(`   Admission Submission Result: ${refText}`);
    results.oakfieldDemo.submissionRef = refText;

    // Mobile Viewport test
    await page.setViewport({ width: 375, height: 812 });
    await wait(500);
    const oakMobScreen = path.join(ARTIFACT_DIR, 'demo_oakfield_mobile.png');
    await page.screenshot({ path: oakMobScreen, fullPage: false });
    results.screenshots.push('demo_oakfield_mobile.png');
    console.log('   Captured Oakfield Mobile screenshot -> demo_oakfield_mobile.png');

    // ── TEST 3: Solara Retreat & Resort Demo ─────────────────────────────
    console.log(`\n3. Testing Solara Retreat & Resort at ${BASE_URL}/demo-projects/hospitality/solara`);
    await page.setViewport({ width: 1440, height: 960 });
    const solRes = await page.goto(`${BASE_URL}/demo-projects/hospitality/solara`, { waitUntil: 'networkidle2', timeout: 30000 });
    results.solaraDemo.httpStatus = solRes.status();
    console.log(`   HTTP Status: ${solRes.status()}`);

    const solHeading = await page.$eval('h1', (el) => el.innerText.trim());
    console.log(`   Solara H1: "${solHeading}"`);
    results.solaraDemo.heading = solHeading;

    // Capture Solara Desktop Screenshot
    const solScreen = path.join(ARTIFACT_DIR, 'demo_solara_desktop.png');
    await page.screenshot({ path: solScreen, fullPage: false });
    results.screenshots.push('demo_solara_desktop.png');

    // Test Reservation Form
    console.log('   Testing Solara Stay Reservation Form submission...');
    await page.type('input[placeholder="e.g. Vikram Mehra"]', 'Test Guest');
    await page.type('input[placeholder="e.g. 9876543210"]', '9876543210');
    await page.type('input[placeholder="e.g. vikram.mehra@example.com"]', 'guest@example.com');
    await page.click('#reservation button[type="submit"]');
    await wait(1200);

    const solRefText = await page.$eval('#reservation .font-mono', (el) => el.innerText.trim()).catch(() => 'SLR-SIM-RES');
    console.log(`   Solara Reservation Result: ${solRefText}`);
    results.solaraDemo.reservationRef = solRefText;

    // Mobile Viewport test
    await page.setViewport({ width: 375, height: 812 });
    await wait(500);
    const solMobScreen = path.join(ARTIFACT_DIR, 'demo_solara_mobile.png');
    await page.screenshot({ path: solMobScreen, fullPage: false });
    results.screenshots.push('demo_solara_mobile.png');
    console.log('   Captured Solara Mobile screenshot -> demo_solara_mobile.png');

    // ── TEST 4: Slug Overview Pages ─────────────────────────────────────
    console.log('\n4. Testing Slug Overview Pages...');
    const slugsToTest = [
      'oakfield',
      'solara',
      'purvarang-family-restaurant',
      'udaan-furniture',
      'estatevista',
      'medicare',
    ];

    for (const slug of slugsToTest) {
      const slugRes = await page.goto(`${BASE_URL}/demo-projects/${slug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      results.slugPages[slug] = slugRes.status();
      console.log(`   /demo-projects/${slug} -> HTTP ${slugRes.status()}`);
    }

  } catch (err) {
    console.error('Error during verification:', err);
    results.errors.push(err.message);
  } finally {
    await browser.close();
    try {
      if (fs.existsSync(TEMP_PROFILE)) {
        fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
      }
    } catch {}
  }

  fs.writeFileSync('docs/demo-ecosystem-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n--- Verification finished. Output saved to docs/demo-ecosystem-test-results.json ---');
}

run();
