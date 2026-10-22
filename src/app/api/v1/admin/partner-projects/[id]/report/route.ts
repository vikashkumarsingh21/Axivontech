import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { generateAndPublishDeliveryReport } from "@/lib/reports/project-report-generator";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    if (!userId) throw new ApiError(401, "Unauthorized");

    const project = await db.partnerProject.findUnique({
      where: { id },
      select: { id: true, projectCode: true },
    });

    if (!project) throw new ApiError(404, "Project not found.");

    const { reportDoc, reportHtml } = await generateAndPublishDeliveryReport(id, userId);

    return NextResponse.json({
      success: true,
      message: `Verified delivery report generated and published for ${project.projectCode}.`,
      document: {
        id: reportDoc.id,
        title: reportDoc.title,
        category: reportDoc.category,
        fileUrl: reportDoc.fileUrl,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const reportDoc = await db.partnerDocument.findFirst({
      where: {
        partnerProjectId: id,
        category: "CLIENT_REPORT",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reportDoc) {
      return NextResponse.json({ success: false, message: "No delivery report generated yet for this project." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: reportDoc,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
