import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const payment = await db.partnerPayment.findUnique({
      where: { id: params.id },
      include: {
        partnerProject: {
          include: {
            brokerProfile: { select: { id: true, user: { select: { name: true, email: true } } } },
          },
        },
      },
    });
    if (!payment) throw new ApiError(404, "Payment not found.");

    return NextResponse.json({ data: payment });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { action, rejectionReason } = body;

    const payment = await db.partnerPayment.findUnique({
      where: { id: params.id },
      include: { partnerProject: { select: { id: true, projectCode: true, brokerProfileId: true, brokerProfile: { select: { id: true, userId: true } } } } },
    });
    if (!payment) throw new ApiError(404, "Payment not found.");

    const brokerUserId = payment.partnerProject.brokerProfile.userId;
    const projectId = payment.partnerProject.id;
    const projectCode = payment.partnerProject.projectCode;
    const brokerProfileId = payment.partnerProject.brokerProfile.id;

    if (action === "verify") {
      if (payment.status !== "SUBMITTED" && payment.status !== "UNDER_REVIEW") {
        throw new ApiError(400, "Payment must be in SUBMITTED or UNDER_REVIEW status to verify.");
      }

      // COMMISSION CALCULATION
      const activeRule = await db.commissionRule.findFirst({ where: { isActive: true } });
      let commAmount = 0;
      if (activeRule) {
        if (activeRule.type === "PERCENTAGE") {
          commAmount = (payment.projectPrice * activeRule.value) / 100;
        } else {
          commAmount = activeRule.value;
        }
      }

      const transactionOps: any[] = [
        db.partnerPayment.update({
          where: { id: params.id },
          data: { status: "VERIFIED", verifiedAt: new Date(), verifiedById: userId },
        }),
        db.partnerProject.update({
          where: { id: projectId },
          data: { status: "PROJECT_CONFIRMED" },
        }),
        db.auditLog.create({
          data: { userId, action: "PAYMENT_VERIFIED", resource: "PartnerPayment", details: { paymentId: params.id, projectCode, amount: payment.amountPaid } },
        }),
        db.notification.create({
          data: {
            userId: brokerUserId, type: "SYSTEM", title: "Payment Verified",
            message: `Payment for project ${projectCode} has been verified. Your project is now confirmed!`,
            link: `/broker/projects/${projectId}`,
          },
        }),
      ];

      if (activeRule) {
        transactionOps.push(
          db.commission.create({
            data: {
              partnerProjectId: projectId,
              brokerProfileId: brokerProfileId,
              commissionRuleId: activeRule.id,
              projectValue: payment.projectPrice,
              commissionType: activeRule.type,
              commissionRate: activeRule.type === "PERCENTAGE" ? activeRule.value : null,
              commissionAmount: commAmount,
              status: "ELIGIBLE",
              eligibleAt: new Date(),
            }
          }),
          db.auditLog.create({
            data: { userId, action: "COMMISSION_ELIGIBLE", resource: "Commission", details: { projectId, projectCode, amount: commAmount } }
          }),
          db.notification.create({
            data: {
              userId: brokerUserId, type: "SYSTEM", title: "Commission Eligible",
              message: `Your commission for project ${projectCode} is now eligible.`,
              link: `/broker/commissions`,
            }
          })
        );
      }

      await db.$transaction(transactionOps);

      return NextResponse.json({ success: true, message: "Payment verified. Project confirmed. Commission created." });
    }

    if (action === "reject") {
      if (!rejectionReason) throw new ApiError(400, "Rejection reason is required.");

      await db.$transaction([
        db.partnerPayment.update({
          where: { id: params.id },
          data: { status: "REJECTED", rejectionReason, rejectedAt: new Date() },
        }),
        db.partnerProject.update({
          where: { id: projectId },
          data: { status: "PAYMENT_PENDING" },
        }),
        db.auditLog.create({
          data: { userId, action: "PAYMENT_REJECTED", resource: "PartnerPayment", details: { paymentId: params.id, projectCode, reason: rejectionReason } },
        }),
        db.notification.create({
          data: {
            userId: brokerUserId, type: "SYSTEM", title: "Payment Rejected",
            message: `Payment for project ${projectCode} was rejected. Reason: ${rejectionReason}`,
            link: `/broker/projects/${projectId}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Payment rejected." });
    }

    throw new ApiError(400, "Invalid action. Use 'verify' or 'reject'.");
  } catch (error) {
    return handleApiError(error);
  }
}
