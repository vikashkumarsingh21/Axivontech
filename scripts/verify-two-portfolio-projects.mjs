import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ARTIFACT_DIR = "C:\\Users\\vk010\\.gemini\\antigravity\\brain\\4ca92451-c35c-4763-9de5-b3cc3ff1e653";
const TEMP_PROFILE = path.resolve(process.cwd(), `.temp_puppeteer_portcheck_${Date.now()}`);

async function testPortfolio() {
  console.log("================================================================================");
  console.log("TEST SUITE: Verify Two New Portfolio Projects in AxivonTech");
  console.log("Base URL:", BASE_URL);
  console.log("================================================================================\n");

  const results = {
    homeSelectedProjects: [],
    portfolioPageListing: [],
    filterTest: {},
    detailPages: [],
    buttonVerification: [],
    duplicateCheck: {},
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    userDataDir: TEMP_PROFILE,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. Audit Home Page Selected Projects section
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("[Test 1/6] Auditing Home Page (/): Selected Projects section...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    const homeProjects = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("#portfolio .group"));
      return cards.map((c) => {
        const titleEl = c.querySelector("h3");
        const categoryEl = c.querySelector(".font-mono, [class*='font-mono']");
        const descEl = c.querySelector("p");
        const liveLinkEl = c.querySelector("a[href^='http']");
        const imgEl = c.querySelector("img");
        return {
          title: titleEl ? titleEl.textContent.trim() : "",
          category: categoryEl ? categoryEl.textContent.trim() : "",
          description: descEl ? descEl.textContent.trim() : "",
          liveUrl: liveLinkEl ? liveLinkEl.getAttribute("href") : "",
          buttonText: liveLinkEl ? liveLinkEl.textContent.trim() : "",
          hasTargetBlank: liveLinkEl ? liveLinkEl.getAttribute("target") === "_blank" : false,
          hasRelNoopener: liveLinkEl ? (liveLinkEl.getAttribute("rel") || "").includes("noopener") : false,
          imageSrc: imgEl ? imgEl.getAttribute("src") : "",
        };
      });
    });

    console.log(`  - Discovered ${homeProjects.length} projects in Home Selected Projects.`);
    results.homeSelectedProjects = homeProjects;

    const purvarangOnHome = homeProjects.filter((p) => p.title.includes("Purvarang"));
    const udaanOnHome = homeProjects.filter((p) => p.title.includes("Udaan"));

    console.log(`  - Purvarang on Home: ${purvarangOnHome.length} card(s) found (Expected: 1)`);
    console.log(`  - Udaan on Home: ${udaanOnHome.length} card(s) found (Expected: 1)`);

    // Capture screenshot of Home Selected Projects
    const portfolioSection = await page.$("#portfolio");
    if (portfolioSection) {
      const shotPath = path.join(ARTIFACT_DIR, "portfolio_home_selected_projects.png");
      await portfolioSection.screenshot({ path: shotPath });
      console.log(`  - Saved Selected Projects screenshot: ${shotPath}`);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. Audit /portfolio page listing and filters
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("\n[Test 2/6] Auditing /portfolio page listing and Category Filters...");
    await page.goto(`${BASE_URL}/portfolio`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    const allPortfolioProjects = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll("#all-projects article"));
      return articles.map((a) => {
        const titleEl = a.querySelector("h3");
        const categoryEl = a.querySelector("span.uppercase");
        const liveLinkEl = a.querySelector("a[target='_blank']");
        const caseStudyLink = a.querySelector("a[href*='/portfolio/']");
        return {
          title: titleEl ? titleEl.textContent.trim() : "",
          category: categoryEl ? categoryEl.textContent.trim() : "",
          liveUrl: liveLinkEl ? liveLinkEl.getAttribute("href") : "",
          caseStudyHref: caseStudyLink ? caseStudyLink.getAttribute("href") : "",
        };
      });
    });

    console.log(`  - Discovered ${allPortfolioProjects.length} projects on /portfolio #all-projects.`);
    results.portfolioPageListing = allPortfolioProjects;

    // Test Category filter "Website Development"
    console.log("\n[Test 3/6] Testing Category Filter: 'Website Development' ...");
    const filterButtons = await page.$$("nav[aria-label*='Filter'] button");
    let clickedFilter = false;
    for (const btn of filterButtons) {
      const text = await (await btn.getProperty("textContent")).jsonValue();
      if (text.trim() === "Website Development") {
        await btn.click();
        clickedFilter = true;
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1000));

    const filteredProjects = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll("#all-projects article"));
      return articles.map((a) => (a.querySelector("h3") ? a.querySelector("h3").textContent.trim() : ""));
    });

    console.log(`  - Filter 'Website Development' clicked: ${clickedFilter}`);
    console.log(`  - Filtered projects:`, filteredProjects);
    results.filterTest = {
      clickedFilter,
      filteredProjects,
      hasPurvarang: filteredProjects.some((t) => t.includes("Purvarang")),
      hasUdaan: filteredProjects.some((t) => t.includes("Udaan")),
    };

    // Capture screenshot of filtered portfolio
    const gridSection = await page.$("#all-projects");
    if (gridSection) {
      const shotPath = path.join(ARTIFACT_DIR, "portfolio_grid_filtered_view.png");
      await gridSection.screenshot({ path: shotPath });
      console.log(`  - Saved Filtered Grid screenshot: ${shotPath}`);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. Audit Project Detail Pages
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("\n[Test 4/6] Auditing individual Project Detail Pages...");
    const detailSlugs = [
      { slug: "purvarang-family-restaurant", expectedTitle: "Purvarang Family Restaurant", expectedUrl: "https://purvarang-family-restaurant.onrender.com/" },
      { slug: "udaan-furniture", expectedTitle: "Udaan Furniture", expectedUrl: "https://udaan-furniture.onrender.com/" },
    ];

    for (const d of detailSlugs) {
      const pageUrl = `${BASE_URL}/portfolio/${d.slug}`;
      const res = await page.goto(pageUrl, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 1500));

      const pageDetails = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        const liveBtn = document.querySelector("a[href^='http'][target='_blank']");
        const img = document.querySelector("img");
        const badges = Array.from(document.querySelectorAll("span")).map((s) => s.textContent.trim());
        return {
          h1: h1 ? h1.textContent.trim() : "",
          liveHref: liveBtn ? liveBtn.getAttribute("href") : "",
          buttonText: liveBtn ? liveBtn.textContent.trim() : "",
          imageSrc: img ? img.getAttribute("src") : "",
          badges: badges.slice(0, 15),
        };
      });

      const shotPath = path.join(ARTIFACT_DIR, `portfolio_detail_${d.slug}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      const passed = res.status() === 200 && pageDetails.h1.includes(d.expectedTitle) && pageDetails.liveHref === d.expectedUrl;
      results.detailPages.push({
        slug: d.slug,
        status: res.status(),
        title: pageDetails.h1,
        liveUrl: pageDetails.liveHref,
        buttonText: pageDetails.buttonText,
        passed,
      });

      console.log(`  - /portfolio/${d.slug}: HTTP ${res.status()} | Title: ${pageDetails.h1} | Live Link: ${pageDetails.liveHref} -> ${passed ? "PASS" : "FAIL"}`);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. External Live Links HTTP Reachability
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("\n[Test 5/6] Verifying external live websites HTTP reachability...");
    const urlsToTest = [
      { name: "Purvarang Live", url: "https://purvarang-family-restaurant.onrender.com/" },
      { name: "Udaan Live", url: "https://udaan-furniture.onrender.com/" },
    ];

    for (const u of urlsToTest) {
      try {
        const fetchRes = await fetch(u.url, { method: "HEAD" });
        console.log(`  - ${u.name} (${u.url}): HTTP ${fetchRes.status}`);
        results.buttonVerification.push({
          name: u.name,
          url: u.url,
          status: fetchRes.status,
          pass: fetchRes.status === 200,
        });
      } catch (err) {
        console.log(`  - ${u.name} fetch warning:`, err.message);
        results.buttonVerification.push({
          name: u.name,
          url: u.url,
          status: "FETCH_ERR",
          pass: false,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. Duplicate Check
    // ─────────────────────────────────────────────────────────────────────────────
    console.log("\n[Test 6/6] Checking for duplicate records...");
    const purvarangTotal = allPortfolioProjects.filter((p) => p.title.includes("Purvarang")).length;
    const udaanTotal = allPortfolioProjects.filter((p) => p.title.includes("Udaan")).length;
    results.duplicateCheck = {
      purvarangTotal,
      udaanTotal,
      pass: purvarangTotal === 1 && udaanTotal === 1,
    };
    console.log(`  - Purvarang occurrences on /portfolio: ${purvarangTotal} (Expected: 1) -> ${purvarangTotal === 1 ? "PASS" : "FAIL"}`);
    console.log(`  - Udaan occurrences on /portfolio: ${udaanTotal} (Expected: 1) -> ${udaanTotal === 1 ? "PASS" : "FAIL"}`);

    console.log("\n================================================================================");
    console.log("FINAL AUDIT SUMMARY:");
    console.log(`- Purvarang on Home & Portfolio: ${purvarangOnHome.length === 1 && purvarangTotal === 1 ? "PASSED" : "FAILED"}`);
    console.log(`- Udaan on Home & Portfolio: ${udaanOnHome.length === 1 && udaanTotal === 1 ? "PASSED" : "FAILED"}`);
    console.log(`- Category Filter Works: ${results.filterTest.hasPurvarang && results.filterTest.hasUdaan ? "PASSED" : "FAILED"}`);
    console.log(`- Detail Pages Accessible: ${results.detailPages.every((d) => d.passed) ? "PASSED" : "FAILED"}`);
    console.log(`- Zero Duplicates: ${results.duplicateCheck.pass ? "PASSED" : "FAILED"}`);
    console.log("================================================================================");

    fs.writeFileSync(
      path.resolve(process.cwd(), "docs/portfolio-two-projects-test-results.json"),
      JSON.stringify(results, null, 2)
    );

    const allPassed =
      purvarangOnHome.length === 1 &&
      udaanOnHome.length === 1 &&
      results.filterTest.hasPurvarang &&
      results.filterTest.hasUdaan &&
      results.detailPages.every((d) => d.passed) &&
      results.duplicateCheck.pass;

    if (!allPassed) {
      process.exit(1);
    }
  } finally {
    await browser.close();
    try {
      fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
    } catch (e) {}
  }
}

testPortfolio().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
