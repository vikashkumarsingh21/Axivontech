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

    const payment = await db.partnerPayment.findUnique({
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
            brokerProfileId: true,
            contract: {
              select: {
                id: true,
                status: true,
                contractName: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    // IDOR Protection: broker must own the project
    if (payment.partnerProject.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied. You do not own this payment record.");
    }

    return apiSuccess({
      id: payment.id,
      projectId: payment.partnerProjectId,
      projectCode: payment.partnerProject.projectCode,
      projectName: payment.partnerProject.projectName,
      clientName: payment.partnerProject.clientName,
      companyName: payment.partnerProject.companyName,
      projectStatus: payment.partnerProject.status,
      contract: payment.partnerProject.contract,
      projectPrice: payment.projectPrice,
      advancePercentage: payment.advancePercentage,
      advanceAmount: payment.advanceAmount,
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      proofFileUrl: payment.proofFileUrl,
      status: payment.status,
      submittedAt: payment.submittedAt,
      verifiedAt: payment.verifiedAt,
      rejectionReason: payment.rejectionReason,
      rejectedAt: payment.rejectedAt,
      additionalNotes: payment.additionalNotes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
