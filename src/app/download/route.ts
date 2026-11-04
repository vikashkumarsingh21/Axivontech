import { NextResponse } from "next/server";
import { getAppReleaseConfig } from "@/features/app-mode/release";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getAppReleaseConfig();

  // Kill switch check: if App Mode or release is disabled, return 404
  if (!config.enabled) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // Gateway page with direct 1-tap download
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Download Axivon Mobile App (Android APK)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0B0D10;
      color: #F3F5F7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #0E1116;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 2.25rem 2rem;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10B981;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #FFFFFF;
    }
    p {
      color: #9CA3AF;
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.875rem 1.5rem;
      background: #10B981;
      color: #04130E;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      border-radius: 0.75rem;
      transition: background 0.2s;
      box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
    }
    .btn:hover {
      background: #059669;
    }
    .info {
      margin-top: 1.25rem;
      font-size: 0.75rem;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Official Axivon Android App</div>
    <h1>Axivon Mobile App</h1>
    <p>Mark attendance, view tasks, submit reports, and manage everything directly from your Android phone.</p>
    <a href="/download/axivon-app" download="axivon-app.apk" class="btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Download APK (${config.sizeMb} MB)
    </a>
    <div class="info">Version ${config.latestVersion} &bull; Verified Package</div>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
