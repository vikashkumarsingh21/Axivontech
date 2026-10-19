import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const rating = searchParams.get("rating") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (rating) where.rating = rating;

    const [feedbacks, total, helpfulCount, notHelpfulCount] = await Promise.all([
      db.chatFeedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.chatFeedback.count({ where }),
      db.chatFeedback.count({ where: { rating: "HELPFUL" } }),
      db.chatFeedback.count({ where: { rating: "NOT_HELPFUL" } }),
    ]);

    const totalRatings = helpfulCount + notHelpfulCount;
    const satisfactionRate =
      totalRatings > 0 ? Math.round((helpfulCount / totalRatings) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: feedbacks,
      analytics: {
        totalRatings,
        helpfulCount,
        notHelpfulCount,
        satisfactionRate,
      },
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
