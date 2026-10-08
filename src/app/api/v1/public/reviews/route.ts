import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

// ─── Public GET: Only approved reviews ───────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";
    const service = searchParams.get("service");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (featured) {
      where.isFeatured = true;
    }

    if (service) {
      where.service = service;
    }

    const [reviews, total] = await Promise.all([
      db.clientReview.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" }
        ],
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          reviewText: true,
          reviewerName: true,
          companyName: true,
          designation: true,
          service: true,
          photoUrl: true,
          isFeatured: true,
          createdAt: true,
        },
      }),
      db.clientReview.count({ where }),
    ]);

    // Aggregate rating stats (only from approved reviews)
    const approvedWhere = { status: "APPROVED" as const };
    const agg = await db.clientReview.aggregate({
      where: approvedWhere,
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
        totalReviews: agg._count.rating,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── Public POST: Submit a review ────────────────────────────────────
const submitReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  reviewText: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(1000, "Review cannot exceed 1000 characters"),
  reviewerName: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  companyName: z.string().max(200).optional().or(z.literal("")),
  designation: z.string().max(100).optional().or(z.literal("")),
  service: z.string().max(100).optional().or(z.literal("")),
  publicConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to public display of your review",
  }),
  // Honeypot field — should always be empty
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot check
    if (body.website) {
      // Silently accept but don't store (looks like spam bot)
      return NextResponse.json({
        success: true,
        message: "Thank you for sharing your experience!",
      });
    }

    const data = submitReviewSchema.parse(body);

    // Rate limiting: check for recent submission from same email
    if (data.email) {
      const recentReview = await db.clientReview.findFirst({
        where: {
          email: data.email,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours
          },
        },
      });

      if (recentReview) {
        return NextResponse.json(
          { success: false, error: "You have already submitted a review recently. Please try again later." },
          { status: 429 }
        );
      }
    }

    const review = await db.clientReview.create({
      data: {
        rating: data.rating,
        reviewText: data.reviewText.trim(),
        reviewerName: data.reviewerName.trim(),
        email: data.email?.trim() || null,
        companyName: data.companyName?.trim() || null,
        designation: data.designation?.trim() || null,
        service: data.service?.trim() || null,
        publicConsent: data.publicConsent,
        status: "PENDING",
      },
    });

    // Create audit log for the submission
    await db.auditLog.create({
      data: {
        action: "REVIEW_SUBMITTED",
        resource: `ClientReview:${review.id}`,
        details: { rating: review.rating, service: review.service },
      },
    });

    // Notify admin users
    const adminUsers = await db.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: { in: ["FOUNDER", "ADMIN", "CO_FOUNDER"] },
            },
          },
        },
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (adminUsers.length > 0) {
      await db.notification.createMany({
        data: adminUsers.map((u) => ({
          userId: u.id,
          type: "SYSTEM_EVENT",
          title: "New Client Review",
          message: `New ${review.rating}-star review from ${review.reviewerName}`,
          link: "/admin/reviews",
          priority: "NORMAL",
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for sharing your experience!",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
