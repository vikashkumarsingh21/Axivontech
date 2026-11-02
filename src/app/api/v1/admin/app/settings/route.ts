import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAppReleaseConfig, updateAppReleaseConfig } from "@/features/app-mode/release";
import { isAppModeEnvEnabled } from "@/features/app-mode/flags";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  popupEnabled: z.boolean().optional(),
  latestVersion: z.string().min(1).optional(),
  minVersion: z.string().min(1).optional(),
  apkUrl: z.string().url().optional(),
  sha256: z.string().optional(),
  sizeMb: z.number().positive().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/v1/admin/app/settings
 * Admin-only: Retrieves current app mode release configuration and download metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [config, totalDownloads, recentDownloads] = await Promise.all([
      getAppReleaseConfig(),
      db.auditLog.count({
        where: { action: "APP_DOWNLOAD" },
      }),
      db.auditLog.findMany({
        where: { action: "APP_DOWNLOAD" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        config: {
          ...config,
          envEnabled: isAppModeEnvEnabled(),
        },
        totalDownloads,
        recentDownloads: recentDownloads.map((log) => ({
          id: log.id,
          ip: log.ipAddress || "—",
          userAgent: log.userAgent || "—",
          timestamp: log.createdAt.toISOString(),
          userName: log.user?.name || "Anonymous / Unauthenticated",
          userEmail: log.user?.email || "—",
          version: (log.details as any)?.version || "1.0.0",
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load app settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/app/settings
 * Admin-only: Updates release information and feature toggles.
 */
export async function PATCH(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    const userId = req.headers.get("x-user-id") || undefined;

    if (role !== "ADMIN" && role !== "FOUNDER" && role !== "CO_FOUNDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await updateAppReleaseConfig(parsed.data, userId);

    // Audit the settings change
    await db.auditLog.create({
      data: {
        userId: userId || null,
        action: "APP_SETTINGS_UPDATE",
        resource: "app.release",
        details: parsed.data as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mobile app settings updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update app settings" },
      { status: 500 }
    );
  }
}
