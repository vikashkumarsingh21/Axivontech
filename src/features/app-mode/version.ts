import { NextResponse } from "next/server";
import { isAppModeEnabled } from "./flags";
import { getAppReleaseConfig } from "./release";

/**
 * Handles GET /api/v1/app/version
 */
export async function handleAppVersion(): Promise<NextResponse> {
  // 1. Kill switch check
  if (!isAppModeEnabled()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // 2. Fetch public release info
  const config = await getAppReleaseConfig();

  return NextResponse.json(
    {
      latestVersion: config.latestVersion,
      minVersion: config.minVersion,
      apkUrl: config.apkUrl,
      sha256: config.sha256,
      sizeMb: config.sizeMb,
      notes: config.notes,
      updatedAt: config.updatedAt,
      popupEnabled: config.popupEnabled,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
