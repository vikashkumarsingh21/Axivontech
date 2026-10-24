import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { normalizeRole, canAccessPartnerPortal } from "@/lib/auth/roles";

export async function GET(req: Request) {
  try {
    const session = await getAuthenticatedSession(req);
    const role = normalizeRole(session.role);

    if (!canAccessPartnerPortal(role)) {
      throw new ApiError(403, "Access denied. Partners only.");
    }

    const brokerId = session.userId;

    // Get BrokerProfile for this user
    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;
    const skip = (page - 1) * limit;

    const where: any = {
      ownerId: brokerId,          // IDOR protection — always filter by authenticated user
      source: "PARTNER",          // Only broker-sourced General Leads
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { leadCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        select: {
          id: true,
          leadCode: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          serviceInterest: true,
          message: true,
          status: true,
          source: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return NextResponse.json({
      data: leads,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
