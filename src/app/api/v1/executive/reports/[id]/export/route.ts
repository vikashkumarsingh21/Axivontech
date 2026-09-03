import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "reports.executive.export");

    await db.auditLog.create({
      data: {
        userId,
        action: "SENSITIVE_REPORT_EXPORTED",
        resource: "Report",
        details: { reportType: id, timestamp: new Date() },
      },
    });

    await db.securityEvent.create({
      data: {
        userId,
        eventType: "SENSITIVE_EXPORT",
        details: { reportType: id },
      },
    });

    return NextResponse.json({ success: true, downloadUrl: "/api/v1/executive/reports" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
