import { NextResponse } from "next/server";
import { isAppModeEnabled } from "@/features/app-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  // Kill switch check: if App Mode is disabled, strictly return 404
  if (!isAppModeEnabled()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({
    latestVersion: "1.0.0",
    minVersion: "1.0.0",
    downloadUrl: "https://github.com/axivon/axivon-mobile/releases",
    forceUpdate: false,
  });
}
