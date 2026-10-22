import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const params = await props.params;
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") throw new ApiError(403, "Access denied.");
    await validateActiveUser(userId);

    const { id: projectId, docId } = params;

    const document = await db.partnerDocument.findFirst({
      where: {
        id: docId,
        partnerProjectId: projectId,
        isClientVisible: true,
        partnerProject: {
          clientUserId: userId,
        }
      }
    });

    if (!document) throw new ApiError(404, "Document not found or access denied.");

    const url = new URL(req.url);
    const format = url.searchParams.get("format");
    const acceptHeader = req.headers.get("accept") || "";

    // If programmatic consumer explicitly requests JSON format, return fileUrl payload
    if (format === "json" || (acceptHeader.includes("application/json") && !acceptHeader.includes("text/html"))) {
      return NextResponse.json({ success: true, fileUrl: document.fileUrl });
    }

    // Direct browser navigation: serve data URI content directly as rendered document
    if (document.fileUrl.startsWith("data:")) {
      const commaIdx = document.fileUrl.indexOf(",");
      const meta = document.fileUrl.substring(5, commaIdx);
      const data = decodeURIComponent(document.fileUrl.substring(commaIdx + 1));
      const mimeType = meta.split(";")[0] || document.mimeType || "text/html";
      const filename = `${document.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;

      return new NextResponse(data, {
        status: 200,
        headers: {
          "Content-Type": `${mimeType}; charset=utf-8`,
          "Content-Disposition": `inline; filename="${filename}"`,
        },
      });
    }

    // If external URL (S3, CDN, or static asset), redirect browser
    if (document.fileUrl.startsWith("http://") || document.fileUrl.startsWith("https://")) {
      return NextResponse.redirect(new URL(document.fileUrl));
    }

    return NextResponse.json({ success: true, fileUrl: document.fileUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
