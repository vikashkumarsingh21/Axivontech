import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { isAppModeEnabled } from "./flags";
import { getAppReleaseConfig } from "./release";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";

/**
 * Handles APK download requests at /download/axivon-app
 */
export async function handleApkDownload(req: NextRequest): Promise<NextResponse> {
  // 1. Kill switch check
  if (!isAppModeEnabled()) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // 2. Rate limiting check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimitKey = `apk_download:${ip}`;
  const rateCheck = isRateLimited(rateLimitKey, { windowMs: 60 * 1000, maxRequests: 30 });

  if (rateCheck.limited) {
    return NextResponse.json(
      { error: "Too many download requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() },
      }
    );
  }

  // 3. Retrieve release config
  const config = await getAppReleaseConfig();
  if (!config.apkUrl) {
    return new NextResponse("APK download is not yet configured.", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 4. Log download event in background (AuditLog / Activity)
  const userId = req.headers.get("x-user-id") || null;
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Fire-and-forget log to keep response instant
  db.auditLog
    .create({
      data: {
        userId,
        action: "APP_DOWNLOAD",
        resource: "apk",
        ipAddress: ip,
        userAgent,
        details: {
          version: config.latestVersion,
          apkUrl: config.apkUrl,
        },
      },
    })
    .catch((err) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[AppMode] Could not record APK download AuditLog:", err.message);
      }
    });

  // 5. Redirect (307) with proper attachment headers
  return NextResponse.redirect(new URL(config.apkUrl), {
    status: 307,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="axivon-app.apk"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
