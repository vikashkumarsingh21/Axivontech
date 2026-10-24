import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, getBrokerPagination, apiSuccess, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { page, limit, skip } = getBrokerPagination(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: any = {
      partnerProject: {
        brokerProfileId: brokerProfile.id,
      },
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        {
          partnerProject: {
            OR: [
              { projectCode: { contains: search, mode: "insensitive" } },
              { projectName: { contains: search, mode: "insensitive" } },
              { clientName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [payments, totalCount] = await Promise.all([
      db.partnerPayment.findMany({
        where,
        include: {
          partnerProject: {
            select: {
              id: true,
              projectCode: true,
              projectName: true,
              clientName: true,
              companyName: true,
              status: true,
              contract: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.partnerPayment.count({ where }),
    ]);

    const projectedPayments = payments.map((p) => ({
      id: p.id,
      projectId: p.partnerProjectId,
      projectCode: p.partnerProject?.projectCode,
      projectName: p.partnerProject?.projectName,
      clientName: p.partnerProject?.clientName,
      companyName: p.partnerProject?.companyName,
      projectStatus: p.partnerProject?.status,
      contractStatus: p.partnerProject?.contract?.status || null,
      projectPrice: p.projectPrice,
      advancePercentage: p.advancePercentage,
      advanceAmount: p.advanceAmount,
      amountPaid: p.amountPaid,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      proofFileUrl: p.proofFileUrl,
      status: p.status,
      submittedAt: p.submittedAt,
      verifiedAt: p.verifiedAt,
      rejectionReason: p.rejectionReason,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return apiSuccess({
      payments: projectedPayments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
