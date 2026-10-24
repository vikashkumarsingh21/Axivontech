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

    // IDOR protection: get the BrokerProfile linked to this user
    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;
    const skip = (page - 1) * limit;

    const where: any = {
      brokerProfileId: brokerProfile.id,  // strict ownership check
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { projectCode: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { projectName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [projects, total] = await Promise.all([
      db.partnerProject.findMany({
        where,
        select: {
          id: true,
          projectCode: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          companyName: true,
          industry: true,
          city: true,
          projectName: true,
          requiredService: true,
          status: true,
          projectBudget: true,
          expectedTimeline: true,
          createdAt: true,
          updatedAt: true,
          contract: {
            select: { 
              status: true, 
              versions: { select: { sentAt: true }, orderBy: { versionNumber: "desc" }, take: 1 }
            }
          },
          payment: {
            select: { status: true, advanceAmount: true, currency: true }
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.partnerProject.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
