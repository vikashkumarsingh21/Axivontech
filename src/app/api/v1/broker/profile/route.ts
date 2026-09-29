import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!brokerId || role !== "BROKER") {
      throw new ApiError(403, "Access denied. Brokers only.");
    }

    const user = await db.user.findUnique({
      where: { id: brokerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        brokerProfile: true,
      },
    });

    if (!user || !user.brokerProfile) {
      throw new ApiError(404, "Broker profile not found.");
    }

    const [leadsCount, qualifiedLeadsCount, projectsCount, pendingContracts, pendingPayments, activeProjects, unreadDocs] = await Promise.all([
      db.lead.count({ where: { ownerId: brokerId, source: "PARTNER" } }),
      db.lead.count({ where: { ownerId: brokerId, source: "PARTNER", status: "QUALIFIED" } }),
      db.partnerProject.count({ where: { brokerProfileId: user.brokerProfile.id } }),
      db.partnerContract.count({ where: { partnerProject: { brokerProfileId: user.brokerProfile.id }, status: "SENT" } }),
      db.partnerPayment.count({ where: { partnerProject: { brokerProfileId: user.brokerProfile.id }, status: "PENDING" } }),
      db.partnerProject.count({ where: { brokerProfileId: user.brokerProfile.id, status: "IN_PROGRESS" } }),
      db.partnerDocument.count({ where: { OR: [{ brokerProfileId: user.brokerProfile.id }, { brokerProfileId: null }], isRead: false } }),
    ]);

    const recentLeads = await db.lead.findMany({
      where: { ownerId: brokerId, source: "PARTNER" },
      select: {
        id: true, leadCode: true, name: true, companyName: true,
        serviceInterest: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentProjects = await db.partnerProject.findMany({
      where: { brokerProfileId: user.brokerProfile.id },
      select: {
        id: true, projectCode: true, projectName: true, companyName: true,
        requiredService: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      data: {
        profile: user,
        stats: {
          totalLeads: leadsCount,
          qualifiedLeads: qualifiedLeadsCount,
          totalProjects: projectsCount,
          pendingContracts,
          pendingPayments,
          activeProjects,
          unreadDocs,
        },
        recentLeads,
        recentProjects,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
