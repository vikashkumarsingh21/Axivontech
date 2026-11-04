import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { db } from "../src/lib/db";
import { signSession } from "../src/lib/auth/session";
import { GET as getSession } from "../src/app/api/v1/auth/session/route";
import { resolveRoleDashboardUrl, normalizeRole } from "../src/lib/auth/roles";
import { middleware } from "../src/middleware";

async function runAudit() {
  console.log("===============================================================");
  console.log("  AXIVONTECH MOBILE APP: LOGO & SESSION PERSISTENCE AUDIT");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✔ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`✖ [FAIL] ${msg}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. LOGO & BRANDING ASSET AUDIT
  // -----------------------------------------------------------------
  console.log("--- PART 1: Brand Assets & Android Icon/Splash Verification ---");

  const resDir = path.join(process.cwd(), "mobile", "android", "app", "src", "main", "res");

  // Check mipmaps
  const mipmaps = ["mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"];
  for (const mm of mipmaps) {
    const fg = path.join(resDir, mm, "ic_launcher_foreground.png");
    const ic = path.join(resDir, mm, "ic_launcher.png");
    const rd = path.join(resDir, mm, "ic_launcher_round.png");

    assert(fs.existsSync(fg), `${mm}/ic_launcher_foreground.png exists`);
    assert(fs.existsSync(ic), `${mm}/ic_launcher.png exists`);
    assert(fs.existsSync(rd), `${mm}/ic_launcher_round.png exists`);

    const metaFg = await sharp(fg).metadata();
    assert(metaFg.hasAlpha === true, `${mm}/ic_launcher_foreground.png has alpha channel`);
  }

  // Check splash drawables
  const splashDirs = [
    "drawable",
    "drawable-port-mdpi",
    "drawable-port-hdpi",
    "drawable-port-xhdpi",
    "drawable-port-xxhdpi",
    "drawable-port-xxxhdpi",
    "drawable-land-mdpi",
    "drawable-land-hdpi",
    "drawable-land-xhdpi",
    "drawable-land-xxhdpi",
    "drawable-land-xxxhdpi",
  ];

  for (const sd of splashDirs) {
    const sp = path.join(resDir, sd, "splash.png");
    assert(fs.existsSync(sp), `${sd}/splash.png exists`);
    const meta = await sharp(sp).metadata();
    assert((meta.width || 0) > 0 && (meta.height || 0) > 0, `${sd}/splash.png has valid dimensions (${meta.width}x${meta.height})`);
  }

  // Check that old template vector icon was deleted
  const oldVector = path.join(resDir, "drawable-v24", "ic_launcher_foreground.xml");
  assert(!fs.existsSync(oldVector), "Old generic vector icon in drawable-v24 was cleanly removed");

  // Check MobileTopBar references official logo
  const topBarContent = fs.readFileSync(path.join(process.cwd(), "src", "components", "mobile", "MobileTopBar.tsx"), "utf8");
  assert(topBarContent.includes("/assets/logo/logo-icon.png"), "MobileTopBar renders official logo-icon.png");
  assert(!topBarContent.includes('>A<'), "MobileTopBar letter 'A' placeholder was removed");

  // Check MainActivity has CookieManager persistence
  const mainActivityContent = fs.readFileSync(path.join(process.cwd(), "mobile", "android", "app", "src", "main", "java", "com", "axivon", "app", "MainActivity.java"), "utf8");
  assert(mainActivityContent.includes("CookieManager.getInstance().flush()"), "MainActivity flushes CookieManager on lifecycle pauses/stops");
  assert(mainActivityContent.includes("setAcceptCookie(true)"), "MainActivity enables persistent cookies");

  // Check capacitor.config.json server.url
  const capConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "mobile", "capacitor.config.json"), "utf8"));
  assert(capConfig.server.url === "https://axivontech.in", "Capacitor server.url points to root domain https://axivontech.in");

  // -----------------------------------------------------------------
  // 2. SESSION RESTORATION API AUDIT
  // -----------------------------------------------------------------
  console.log("\n--- PART 2: Persistent Session API & Role Routing ---");

  // Setup test user
  const testEmail = `audit-session-${Date.now()}@axivontech.test`;
  let testUser: any;

  try {
    testUser = await db.user.create({
      data: {
        email: testEmail,
        name: "Test Audit Employee",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr",
        status: "ACTIVE",
        userRoles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: "EMPLOYEE" },
                create: { name: "EMPLOYEE", description: "Standard Employee" },
              },
            },
          },
        },
      },
    });

    // Test A: Valid Session -> Restores employee dashboard
    const validToken = await signSession({
      userId: testUser.id,
      role: "EMPLOYEE",
      sessionId: "session-test-valid",
      mustChangePassword: false,
    });

    const reqValid = new NextRequest("http://localhost:3000/api/v1/auth/session", {
      headers: {
        cookie: `axivon_session=${validToken}`,
      },
    });

    const resValid = await getSession(reqValid);
    assert(resValid.status === 200, "Valid session returns HTTP 200");
    const dataValid = await resValid.json();
    assert(dataValid.authenticated === true, "Session reports authenticated: true");
    assert(dataValid.user.id === testUser.id, "Session returns matching user ID");
    assert(dataValid.user.role === "EMPLOYEE", "Session returns canonical role EMPLOYEE");
    assert(dataValid.dashboardUrl === "/employee/dashboard", "Session returns /employee/dashboard");

    // Test B: Role Mapping Verification for Every Supported Role
    const rolesToTest = [
      { role: "ADMIN", expectedUrl: "/admin/dashboard" },
      { role: "FOUNDER", expectedUrl: "/executive/dashboard" },
      { role: "CO_FOUNDER", expectedUrl: "/executive/dashboard" },
      { role: "EMPLOYEE", expectedUrl: "/employee/dashboard" },
      { role: "BUSINESS_PARTNER", expectedUrl: "/broker/dashboard" },
      { role: "BROKER", expectedUrl: "/broker/dashboard" },
      { role: "DEPARTMENT_MANAGER", expectedUrl: "/manager/dashboard" },
      { role: "MANAGER", expectedUrl: "/manager/dashboard" },
      { role: "CLIENT", expectedUrl: "/client/dashboard" },
    ];

    for (const { role, expectedUrl } of rolesToTest) {
      const canonical = normalizeRole(role);
      const url = resolveRoleDashboardUrl(canonical);
      assert(url === expectedUrl, `Role ${role} canonically routes to ${expectedUrl}`);
    }

    // Test C: Account Inactive / Disabled
    await db.user.update({
      where: { id: testUser.id },
      data: { status: "SUSPENDED" },
    });

    const resSuspended = await getSession(reqValid);
    assert(resSuspended.status === 403, "Suspended account is rejected with HTTP 403");
    const dataSuspended = await resSuspended.json();
    assert(dataSuspended.authenticated === false, "Suspended account reports authenticated: false");

    // Restore user status for subsequent tests
    await db.user.update({
      where: { id: testUser.id },
      data: { status: "ACTIVE" },
    });

    // Test D: Missing cookie
    const reqEmpty = new NextRequest("http://localhost:3000/api/v1/auth/session");
    const resEmpty = await getSession(reqEmpty);
    assert(resEmpty.status === 401, "Missing cookie returns HTTP 401");

    // -----------------------------------------------------------------
    // 3. MIDDLEWARE STARTUP & SESSION RESTORATION AUDIT
    // -----------------------------------------------------------------
    console.log("\n--- PART 3: Middleware App Launch & Auto-Redirect ---");

    // Test E: App launches at root `/` with valid session -> Redirects to /employee/dashboard
    const reqAppRoot = new NextRequest("http://localhost:3000/", {
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 14) Mobile AxivonApp/1.0.0",
        cookie: `axivon_session=${validToken}`,
      },
    });

    const resAppRoot = await middleware(reqAppRoot);
    assert(resAppRoot.status === 307 || resAppRoot.status === 308, "App launch at root redirects authenticated user (HTTP 307/308)");
    const locationRoot = resAppRoot.headers.get("location");
    assert(locationRoot?.includes("/employee/dashboard") === true, `App launch at root resolves to /employee/dashboard (Actual: ${locationRoot})`);

    // Test F: App launches at `/login` with valid session (no logout param) -> Auto-redirects to /employee/dashboard
    const reqAppLogin = new NextRequest("http://localhost:3000/login", {
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 14) Mobile AxivonApp/1.0.0",
        cookie: `axivon_session=${validToken}`,
      },
    });

    const resAppLogin = await middleware(reqAppLogin);
    assert(resAppLogin.status === 307 || resAppLogin.status === 308, "Visiting /login with valid session auto-redirects (HTTP 307/308)");
    const locationLogin = resAppLogin.headers.get("location");
    assert(locationLogin?.includes("/employee/dashboard") === true, `Visiting /login auto-redirects to /employee/dashboard (Actual: ${locationLogin})`);

    // Test G: App opens `/login?logged_out=1` -> Does NOT auto-redirect, displays login screen
    const reqLoggedOut = new NextRequest("http://localhost:3000/login?logged_out=1", {
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 14) Mobile AxivonApp/1.0.0",
        cookie: `axivon_session=${validToken}`,
      },
    });

    const resLoggedOut = await middleware(reqLoggedOut);
    assert(resLoggedOut.status === 200, "Visiting /login?logged_out=1 stays on login page (HTTP 200)");

    // Test H: App launch without session cookie -> Redirects to /login
    const reqUnauth = new NextRequest("http://localhost:3000/", {
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 14) Mobile AxivonApp/1.0.0",
      },
    });

    const resUnauth = await middleware(reqUnauth);
    assert(resUnauth.status === 307 || resUnauth.status === 308, "Unauthenticated app launch redirects out of marketing route");
    const locationUnauth = resUnauth.headers.get("location");
    assert(locationUnauth?.includes("/login") === true, "Unauthenticated app launch redirects to /login");
  } finally {
    if (testUser) {
      await db.userRole.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await db.session.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await db.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  }

  console.log("\n===============================================================");
  console.log(`  AUDIT SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
