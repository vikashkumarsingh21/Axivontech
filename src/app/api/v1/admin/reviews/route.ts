import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await validateActiveUser(userId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const rating = searchParams.get("rating");
    const service = searchParams.get("service");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (rating) where.rating = parseInt(rating, 10);
    if (service) where.service = service;
    if (featured === "true") where.isFeatured = true;
    if (featured === "false") where.isFeatured = false;

    if (search) {
      where.OR = [
        { reviewerName: { contains: search, mode: "insensitive" } },
        { reviewText: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string>;
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [reviews, total] = await Promise.all([
      db.clientReview.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      db.clientReview.count({ where }),
    ]);

    // Dashboard stats
    const [totalAll, pending, approved, rejected, archived, featuredCount, avgRating] =
      await Promise.all([
        db.clientReview.count(),
        db.clientReview.count({ where: { status: "PENDING" } }),
        db.clientReview.count({ where: { status: "APPROVED" } }),
        db.clientReview.count({ where: { status: "REJECTED" } }),
        db.clientReview.count({ where: { status: "ARCHIVED" } }),
        db.clientReview.count({ where: { isFeatured: true, status: "APPROVED" } }),
        db.clientReview.aggregate({
          where: { status: "APPROVED" },
          _avg: { rating: true },
        }),
      ]);

    return NextResponse.json({
      success: true,
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        total: totalAll,
        pending,
        approved,
        rejected,
        archived,
        featured: featuredCount,
        averageRating: avgRating._avg.rating
          ? Math.round(avgRating._avg.rating * 10) / 10
          : 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
