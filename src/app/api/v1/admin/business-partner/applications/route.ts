import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.view");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { applicationId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [applications, total] = await Promise.all([
      db.businessPartnerApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          applicationId: true,
          fullName: true,
          email: true,
          phone: true,
          country: true,
          city: true,
          occupation: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          reviewedAt: true,
        },
      }),
      db.businessPartnerApplication.count({ where }),
    ]);

    // Check account status across applications to identify accounts missing usable logins
    const emails = applications.map((a) => a.email.toLowerCase().trim());
    const users = await db.user.findMany({
      where: {
        email: { in: emails, mode: "insensitive" },
      },
      select: {
        id: true,
        email: true,
        status: true,
        mustChangePassword: true,
        brokerProfile: {
          select: {
            id: true,
            partnerId: true,
            referralCode: true,
          },
        },
      },
    });

    const userMap = new Map(users.map((u) => [u.email.toLowerCase().trim(), u]));

    const enrichedApplications = applications.map((app) => {
      const u = userMap.get(app.email.toLowerCase().trim());
      const hasUsableLogin = !!u && u.status === "ACTIVE" && !!u.brokerProfile;
      return {
        ...app,
        hasUsableLogin,
        linkedUser: u
          ? {
              status: u.status,
              mustChangePassword: u.mustChangePassword,
              partnerId: u.brokerProfile?.partnerId || null,
              referralCode: u.brokerProfile?.referralCode || null,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        applications: enrichedApplications,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
