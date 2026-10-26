import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { verifyPassword } from "@/lib/auth/password";
import { normalizeRole } from "@/lib/auth/roles";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited } from "@/lib/rate-limit";
import { generatePartnersExportFile } from "@/lib/export/partners-export-service";

const exportSchema = z.object({
  type: z.enum(["APPLICATIONS", "CONFIRMED_PARTNERS", "SINGLE_PARTNER"]),
  partnerIdOrUserId: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional().default({}),
  columns: z.array(z.string()).optional(),
  format: z.enum(["xlsx", "csv"]).optional().default("xlsx"),
  exportScope: z.enum(["ALL_MATCHING", "SELECTED_IDS", "LATEST_N"]).optional().default("ALL_MATCHING"),
  selectedIds: z.array(z.string()).optional().default([]),
  latestNCount: z.number().int().positive().max(20000).optional().default(100),
  includeRelatedData: z.boolean().optional().default(false),
  sensitiveUnmasked: z.boolean().optional().default(false),
  adminPassword: z.string().optional(),
});

const EXPORT_RATE_LIMIT = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 10,
};

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = normalizeRole(req.headers.get("x-user-role") || "");

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(userRole)) {
      throw new ApiError(403, "Forbidden: Administrative access required for partner export.");
    }

    // Permission check
    const adminUser = await requirePermission(userId, "export:partners");

    // Rate limiting check
    const isTestBypass =
      process.env.NODE_ENV !== "production" &&
      (process.env.TEST_MODE === "true" || req.headers.get("x-test-mode") === "true");

    const rateKey = `export_partners:${userId}`;
    const rateCheck = !isTestBypass
      ? isRateLimited(rateKey, EXPORT_RATE_LIMIT)
      : { limited: false, resetMs: 0 };

    if (rateCheck.limited) {
      const retryAfterSec = Math.ceil(rateCheck.resetMs / 1000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Export rate limit exceeded. Please wait ${retryAfterSec} seconds before exporting again.`,
          },
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSec) },
        }
      );
    }

    const body = await req.json();
    const validated = exportSchema.parse(body);

    // Sensitive data authorization & password verification
    if (validated.sensitiveUnmasked) {
      await requirePermission(userId, "export:sensitive");

      if (!validated.adminPassword) {
        throw new ApiError(401, "Admin password is required to export unmasked sensitive financial and tax records.");
      }

      const fullAdmin = await db.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!fullAdmin || !(await verifyPassword(validated.adminPassword, fullAdmin.passwordHash))) {
        throw new ApiError(401, "Invalid administrator password. Access to unmasked financial records denied.");
      }
    }

    // Execute Export Generation
    const result = await generatePartnersExportFile({
      type: validated.type,
      partnerIdOrUserId: validated.partnerIdOrUserId,
      filters: validated.filters,
      columns: validated.columns,
      format: validated.format,
      exportScope: validated.exportScope,
      selectedIds: validated.selectedIds,
      latestNCount: validated.latestNCount,
      includeRelatedData: validated.includeRelatedData,
      sensitiveUnmasked: validated.sensitiveUnmasked,
      requestedBy: {
        userId: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });

    if (result.rowCount === 0) {
      throw new ApiError(400, "No records match the specified export criteria. File download cancelled.");
    }

    // Audit Log Entry
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await db.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "EXPORT_PARTNERS",
        resource: validated.type,
        ipAddress: ip,
        userAgent: userAgent,
        details: {
          exportType: validated.type,
          format: validated.format,
          fileName: result.fileName,
          rowCount: result.rowCount,
          sensitiveUnmasked: validated.sensitiveUnmasked,
          exportScope: validated.exportScope,
          includeRelatedData: validated.includeRelatedData,
          filters: validated.filters as any,
        },
      },
    });

    const isBuffer = Buffer.isBuffer(result.buffer);
    const bodyPayload = isBuffer ? (result.buffer as Buffer) : String(result.buffer);

    return new NextResponse(bodyPayload as any, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        ...(isBuffer ? { "Content-Length": String((result.buffer as Buffer).length) } : {}),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
