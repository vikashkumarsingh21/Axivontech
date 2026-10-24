import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, apiSuccess, handleApiError, ApiError } from "@/lib/api/broker";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { brokerProfile } = await requireBroker(req);

    const commission = await db.commission.findUnique({
      where: { id },
      include: {
        partnerProject: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
            clientName: true,
            companyName: true,
            status: true,
          },
        },
        commissionRule: {
          select: {
            id: true,
            name: true,
            type: true,
            value: true,
            description: true,
          },
        },
      },
    });

    if (!commission) {
      throw new ApiError(404, "Commission record not found.");
    }

    // IDOR Protection: broker must own the commission
    if (commission.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied. You do not own this commission record.");
    }

    // Standard Section 194H TDS rate: 5% on broker commission in India
    const grossAmount = commission.commissionAmount;
    const tdsRatePercentage = 5;
    const tdsDeducted = Math.round(((grossAmount * tdsRatePercentage) / 100) * 100) / 100;
    const netPayable = Math.round((grossAmount - tdsDeducted) * 100) / 100;

    return apiSuccess({
      id: commission.id,
      projectId: commission.partnerProjectId,
      projectCode: commission.partnerProject?.projectCode,
      projectName: commission.partnerProject?.projectName,
      clientName: commission.partnerProject?.clientName,
      companyName: commission.partnerProject?.companyName,
      projectStatus: commission.partnerProject?.status,
      projectValue: commission.projectValue,
      commissionRule: commission.commissionRule,
      commissionType: commission.commissionType,
      commissionRate: commission.commissionRate,
      grossAmount,
      tds: {
        ratePercentage: tdsRatePercentage,
        estimatedDeduction: tdsDeducted,
        netPayable,
      },
      currency: commission.currency,
      status: commission.status,
      eligibleAt: commission.eligibleAt,
      payoutRequestedAt: commission.payoutRequestedAt,
      payoutDueAt: commission.payoutDueAt,
      approvedAt: commission.approvedAt,
      paidAt: commission.paidAt,
      payoutMethod: commission.payoutMethod,
      payoutDetails: commission.payoutDetails,
      payoutReference: commission.payoutReference,
      payoutNotes: commission.payoutNotes,
      rejectionReason: commission.rejectionReason,
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
