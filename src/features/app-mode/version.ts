import { NextResponse } from "next/server";
import { getAppReleaseConfig } from "./release";

/**
 * Handles GET /api/v1/app/version
 */
export async function handleAppVersion(): Promise<NextResponse> {
  const config = await getAppReleaseConfig();

  // If App Mode is not enabled in database settings or kill-switched, return 404
  if (!config.enabled) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

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
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
