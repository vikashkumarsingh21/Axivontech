import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const { id } = await props.params;

    const report = await db.workReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!report) {
      throw new ApiError(404, "Work report not found");
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    const admin = await requirePermission(adminId, "admin:access");

    const { id } = await props.params;
    const body = await req.json();
    const { status, feedback } = body;

    const existing = await db.workReport.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Work report not found");
    }

    const newStatus = status || "REVIEWED";

    const updated = await db.workReport.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });

    // Notify employee when their report is reviewed
    if (newStatus === "REVIEWED") {
      const formattedDate = new Date(existing.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      await db.notification.create({
        data: {
          userId: existing.userId,
          type: "WORK_REPORT_REVIEWED",
          title: "Daily Work Report Reviewed",
          message: feedback
            ? `Your work report for ${formattedDate} was reviewed by ${admin.name}: "${feedback.trim()}"`
            : `Your work report for ${formattedDate} was reviewed by management.`,
          link: "/employee/work-reports",
        },
      });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "admin:access");

    const { id } = await props.params;

    const existing = await db.workReport.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Work report not found");
    }

    await db.workReport.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Work report deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
