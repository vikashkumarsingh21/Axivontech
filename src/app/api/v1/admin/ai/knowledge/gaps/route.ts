import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { getKnowledgeGaps } from "@/lib/chatbot/knowledge-gap-logger";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getKnowledgeGaps({ status, search, page, limit });

    return NextResponse.json({
      success: true,
      data: result.gaps,
      meta: {
        total: result.total,
        page,
        limit,
        pages: result.pages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
