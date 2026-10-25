import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  getBrokerPagination,
} from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerId } = await requireBroker(req);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const from = searchParams.get("from")?.trim() || "";
    const to = searchParams.get("to")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const { page, limit, skip } = getBrokerPagination(req, 15);

    const where: any = {
      ownerId: brokerId, // Strict IDOR boundary: Only this partner's leads
      source: "PARTNER",
    };

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { leadCode: { contains: search, mode: "insensitive" } },
        { serviceInterest: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (["createdAt", "name", "status", "companyName"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
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
          whatsapp: true,
          companyName: true,
          designation: true,
          industry: true,
          city: true,
          serviceInterest: true,
          message: true,
          budget: true,
          timeline: true,
          status: true,
          qualificationStatus: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          // Safe activity timeline (strips internal admin notes & raw metadata)
          activities: {
            select: {
              id: true,
              type: true,
              title: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return apiSuccess(leads, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export { POST } from "./create/route";
