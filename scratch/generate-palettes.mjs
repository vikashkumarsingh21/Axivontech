import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.resolve("./docs/mobile/screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PALETTES = [
  {
    id: "option-a-emerald",
    name: "Option A: Muted Emerald-Sage (Default)",
    description: "Calm, organic, professional. Excellent for high-focus operational portals and verified WCAG AA contrast.",
    accent: "#4F9D83",
    accentHover: "#438770",
    accentBg: "#162721",
    accentBorder: "#27483C",
    accentText: "#A2D9C7",
    statusBadgeBg: "#162721",
    statusBadgeText: "#A2D9C7",
    statusBadgeBorder: "#27483C",
  },
  {
    id: "option-b-terracotta",
    name: "Option B: Warm Terracotta-Clay",
    description: "Earthy, warm, grounded. Creates a sophisticated human aesthetic while avoiding cool corporate blues.",
    accent: "#C87D55",
    accentHover: "#B26E49",
    accentBg: "#291A14",
    accentBorder: "#4F2F20",
    accentText: "#F0B89C",
    statusBadgeBg: "#291A14",
    statusBadgeText: "#F0B89C",
    statusBadgeBorder: "#4F2F20",
  },
  {
    id: "option-c-amber",
    name: "Option C: Muted Amber-Ochre",
    description: "Refined, warm-graphite harmony. Evokes an executive, premium notebook feel with great legibility.",
    accent: "#D4A359",
    accentHover: "#C09148",
    accentBg: "#2B2113",
    accentBorder: "#523E1F",
    accentText: "#F5D59E",
    statusBadgeBg: "#2B2113",
    statusBadgeText: "#F5D59E",
    statusBadgeBorder: "#523E1F",
  },
];

function generatePhoneHtml(p) {
  return `<!DOCTYPE html>
<html lang="en" data-app="true">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${p.name} - Axivon Mobile Preview</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
    }
    :root {
      --bg-page: #121212;
      --bg-card: #1A1A1B;
      --bg-raised: #232324;
      --border-subtle: #2E2E30;
      --border-accent: ${p.accentBorder};
      --text-primary: #EDEBE6;
      --text-secondary: #B3AFA6;
      --accent: ${p.accent};
      --accent-hover: ${p.accentHover};
      --accent-bg: ${p.accentBg};
      --accent-text: ${p.accentText};
    }
    body {
      background-color: var(--bg-page);
      color: var(--text-primary);
      width: 390px;
      height: 844px;
      margin: 0 auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    /* Safe Area Notch Simulator */
    .status-bar {
      height: 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      background-color: var(--bg-page);
      z-index: 50;
    }
    .status-bar .icons {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    /* Top App Bar */
    .top-app-bar {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--bg-page);
      z-index: 40;
    }
    .app-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .app-logo {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      color: #121212;
    }
    .app-title {
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--text-primary);
    }
    .app-role-chip {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 7px;
      border-radius: 9999px;
      background-color: var(--accent-bg);
      color: var(--accent-text);
      border: 1px solid var(--border-accent);
    }
    .app-bar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-btn {
      position: relative;
      background: none;
      border: none;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .notification-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 7px;
      height: 7px;
      background-color: var(--accent);
      border-radius: 50%;
      border: 1.5px solid var(--bg-page);
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--bg-raised);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Content Area */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* Check-In Card */
    .checkin-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: 9999px;
      background-color: var(--accent-bg);
      border: 1px solid var(--border-accent);
      font-size: 12px;
      font-weight: 500;
      color: var(--accent-text);
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--accent);
    }
    .timer-display {
      font-size: 32px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      text-align: center;
      padding: 4px 0;
    }
    .action-button-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .btn {
      height: 44px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background-color: var(--accent);
      color: #121212;
    }
    .btn-secondary {
      background-color: var(--bg-raised);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
    .metric-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .metric-label {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .metric-value {
      font-size: 19px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
    }

    /* Task Section */
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      margin-top: 4px;
    }
    .task-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .task-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .task-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .task-meta {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .task-badge {
      font-size: 11px;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 6px;
      background-color: var(--accent-bg);
      color: var(--accent-text);
      border: 1px solid var(--border-accent);
    }

    /* Bottom Tab Bar */
    .tab-bar {
      height: 60px;
      background-color: var(--bg-page);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-bottom: 4px;
      z-index: 40;
    }
    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      width: 64px;
      color: var(--text-secondary);
      font-size: 10px;
      font-weight: 500;
      cursor: pointer;
      position: relative;
    }
    .tab-item.active {
      color: var(--accent);
      font-weight: 600;
    }
    .tab-icon {
      width: 22px;
      height: 22px;
    }
    .tab-badge {
      position: absolute;
      top: 0px;
      right: 14px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--accent);
    }
    /* Home Indicator bar */
    .home-indicator-bar {
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bg-page);
    }
    .home-indicator {
      width: 134px;
      height: 4px;
      border-radius: 2px;
      background-color: #38383A;
    }

    /* Palette Banner at Top */
    .palette-banner {
      background-color: var(--bg-raised);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .palette-banner-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--accent);
    }
    .palette-banner-desc {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <!-- Status Bar -->
  <div class="status-bar">
    <span>09:41</span>
    <div class="icons">
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 8.5C1 8.5 3 6 8 6C13 6 15 8.5 15 8.5" stroke="#EDEBE6" stroke-width="1.5" stroke-linecap="round"/><path d="M4 11C4 11 5.5 9.5 8 9.5C10.5 9.5 12 11 12 11" stroke="#EDEBE6" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.75" fill="#EDEBE6"/></svg>
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><rect x="0.5" y="0.5" width="14" height="9" rx="2" stroke="#EDEBE6"/><rect x="2" y="2" width="10" height="6" rx="1" fill="#EDEBE6"/><path d="M16 3.5V6.5" stroke="#EDEBE6" stroke-width="1.5" stroke-linecap="round"/></svg>
    </div>
  </div>

  <!-- Top App Bar -->
  <header class="top-app-bar">
    <div class="app-title-group">
      <div class="app-logo">A</div>
      <div>
        <div class="app-title">Axivon Portal</div>
      </div>
      <span class="app-role-chip">Employee</span>
    </div>
    <div class="app-bar-actions">
      <button class="icon-btn" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div class="notification-dot"></div>
      </button>
      <div class="avatar">VK</div>
    </div>
  </header>

  <!-- Main Scrollable Screen -->
  <main class="content">
    <!-- Palette Info Banner -->
    <div class="palette-banner">
      <div class="palette-banner-title">${p.name}</div>
      <div class="palette-banner-desc">${p.description}</div>
    </div>

    <!-- Check-in Attendance Card -->
    <section class="checkin-card">
      <div class="card-header-row">
        <span class="card-subtitle">TODAY'S ATTENDANCE</span>
        <div class="status-pill">
          <span class="pulse-dot"></span>
          <span>Checked In &bull; 09:28 AM</span>
        </div>
      </div>

      <div class="timer-display">04:18:22</div>

      <div class="action-button-row">
        <button class="btn btn-secondary">Take Break</button>
        <button class="btn btn-primary">Check Out</button>
      </div>
    </section>

    <!-- Key Metrics Strip -->
    <section class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Attendance</span>
        <span class="metric-value">96.4%</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Tasks Due</span>
        <span class="metric-value">3</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">Leaves Left</span>
        <span class="metric-value">14 d</span>
      </div>
    </section>

    <!-- Today's Tasks -->
    <div class="section-title">Priority Tasks</div>

    <div class="task-card">
      <div class="task-info">
        <div class="task-title">Q3 Attendance Verification</div>
        <div class="task-meta">Due today &bull; Employee Portal</div>
      </div>
      <span class="task-badge">In Progress</span>
    </div>

    <div class="task-card">
      <div class="task-info">
        <div class="task-title">Submit EOD Activity Report</div>
        <div class="task-meta">Due 06:30 PM &bull; Daily Review</div>
      </div>
      <span class="task-badge" style="background-color: var(--bg-raised); color: var(--text-secondary); border-color: var(--border-subtle);">Pending</span>
    </div>
  </main>

  <!-- Bottom Tab Bar -->
  <nav class="tab-bar">
    <div class="tab-item active">
      <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </div>
    <div class="tab-item">
      <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Attendance</span>
    </div>
    <div class="tab-item">
      <div class="tab-badge"></div>
      <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span>Tasks</span>
    </div>
    <div class="tab-item">
      <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      <span>Leave</span>
    </div>
    <div class="tab-item">
      <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      <span>More</span>
    </div>
  </nav>

  <!-- Home Indicator -->
  <div class="home-indicator-bar">
    <div class="home-indicator"></div>
  </div>
</body>
</html>`;
}

function generateComparisonHtml(palettes) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Axivon Mobile App - 3 Non-Blue Palette Comparison</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; }
    body {
      background: #0B0D10;
      color: #EDEBE6;
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }
    .header {
      text-align: center;
      max-width: 800px;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #EDEBE6;
      margin-bottom: 8px;
    }
    p {
      font-size: 14px;
      color: #B3AFA6;
      line-height: 1.5;
    }
    .comparison-grid {
      display: flex;
      gap: 28px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .phone-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .phone-frame {
      width: 390px;
      height: 844px;
      border: 6px solid #232324;
      border-radius: 44px;
      overflow: hidden;
      box-shadow: 0 20px 48px rgba(0,0,0,0.6);
      position: relative;
    }
    .phone-frame iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .palette-label {
      font-size: 15px;
      font-weight: 600;
      color: #EDEBE6;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .color-swatch {
      width: 14px;
      height: 14px;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Axivon Mobile UI Palette Options (App Mode)</h1>
    <p>Dark layered warm-graphite theme (#121212 / #1A1A1B / #232324) with 3 calibrated non-blue accents. All comply with WCAG 2.1 AA text contrast.</p>
  </div>
  <div class="comparison-grid">
    ${palettes
      .map(
        (p) => `
      <div class="phone-container">
        <div class="palette-label">
          <span class="color-swatch" style="background-color: ${p.accent};"></span>
          ${p.name}
        </div>
        <div class="phone-frame">
          <iframe src="./palette-${p.id}.html"></iframe>
        </div>
      </div>
    `
      )
      .join("")}
  </div>
</body>
</html>`;
}

async function main() {
  console.log("Generating phone HTML files for 3 non-blue palette options...");
  for (const p of PALETTES) {
    const html = generatePhoneHtml(p);
    const htmlPath = path.join(OUTPUT_DIR, `palette-${p.id}.html`);
    fs.writeFileSync(htmlPath, html, "utf-8");
    console.log(`Saved ${htmlPath}`);
  }

  const compHtml = generateComparisonHtml(PALETTES);
  const compPath = path.join(OUTPUT_DIR, "palette-comparison.html");
  fs.writeFileSync(compPath, compHtml, "utf-8");
  console.log(`Saved ${compPath}`);

  console.log("Launching headless Chrome to capture screenshots...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    for (const p of PALETTES) {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      const htmlPath = path.join(OUTPUT_DIR, `palette-${p.id}.html`);
      await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
      const imgPath = path.join(OUTPUT_DIR, `palette-${p.id}.png`);
      await page.screenshot({ path: imgPath });
      console.log(`Captured screenshot: ${imgPath}`);
      await page.close();
    }

    // Capture comparison
    const compPage = await browser.newPage();
    await compPage.setViewport({ width: 1300, height: 1040, deviceScaleFactor: 1.5 });
    await compPage.goto(`file://${compPath}`, { waitUntil: "networkidle0" });
    const compImgPath = path.join(OUTPUT_DIR, "palette-options-comparison.png");
    await compPage.screenshot({ path: compImgPath, fullPage: true });
    console.log(`Captured comparison screenshot: ${compImgPath}`);
    await compPage.close();
  } finally {
    await browser.close();
  }

  console.log("All palette previews generated successfully!");
}

main().catch((err) => {
  console.error("Error generating palettes:", err);
  process.exit(1);
});
