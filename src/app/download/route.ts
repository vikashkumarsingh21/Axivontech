import { NextResponse } from "next/server";
import { isAppModeEnabled } from "@/features/app-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  // Kill switch check: if App Mode is disabled, strictly return 404
  if (!isAppModeEnabled()) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // When flag is enabled, provide the download gateway
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Axivon Mobile App Download</title>
</head>
<body style="font-family: sans-serif; background: #0B0D10; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
  <div style="text-align: center; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; max-width: 400px;">
    <h1>Axivon Mobile App</h1>
    <p style="color: #999;">Download portal is active.</p>
    <a href="https://github.com/axivon/axivon-mobile/releases" style="display: inline-block; padding: 10px 20px; background: #e8a064; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 1rem;">View Releases</a>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
}
