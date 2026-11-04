import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAppReleaseConfig } from "./release";
import { isRateLimited } from "@/lib/rate-limit";

/**
 * Handles APK download requests at /download/axivon-app
 */
export async function handleApkDownload(req: NextRequest): Promise<NextResponse> {
  // 1. Retrieve release config (checks kill switch and database organization settings)
  const config = await getAppReleaseConfig();

  if (!config.enabled || !config.apkUrl) {
    return new NextResponse("APK download is not yet configured.", {
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

  // 3. Log download event in background (AuditLog / Activity)
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

  // 4. Resolve download URL (fallback to local APK if placeholder GitHub URL)
  let rawUrl = config.apkUrl || "/downloads/axivon-app.apk";
  if (rawUrl.includes("axivon/axivon-mobile")) {
    rawUrl = "/downloads/axivon-app.apk";
  }

  const targetUrl = rawUrl.startsWith("http")
    ? new URL(rawUrl)
    : new URL(rawUrl, req.url);

  return NextResponse.redirect(targetUrl, {
    status: 307,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="axivon-app.apk"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
