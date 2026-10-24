import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireBroker,
  checkIdempotency,
  checkRateLimit,
  logBrokerAudit,
  notifyAdmins,
  notifyBroker,
  apiSuccess,
  handleApiError,
  ApiError,
} from "@/lib/api/broker";

const payoutRequestSchema = z.object({
  commissionId: z.string().min(1, "commissionId is required."),
  payoutMethod: z.enum(["BANK_TRANSFER", "UPI"]).optional(),
  payoutDetails: z
    .object({
      accountHolder: z.string().optional(),
      accountNumber: z.string().optional(),
      ifsc: z.string().optional(),
      bankName: z.string().optional(),
      upiId: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const { brokerProfile, session } = await requireBroker(req);

    // Rate limit: max 5 payout requests per 60s
    await checkRateLimit(req, "payout-request", 5, 60);

    const body = await req.json().catch(() => ({}));
    const validated = payoutRequestSchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.errors[0]?.message || "Invalid payout request.");
    }

    const { commissionId, notes } = validated.data;
    let { payoutMethod, payoutDetails } = validated.data;

    // Idempotency guard: prevent duplicate submission of the same commission request
    const isDuplicate = await checkIdempotency(req, "payout_request", `${commissionId}:${session.userId}`);
    if (isDuplicate) {
      return apiSuccess({
        commissionId,
        message: "Payout request has already been registered and is under processing.",
      });
    }

    // 1. Fetch commission
    const commission = await db.commission.findUnique({
      where: { id: commissionId },
      include: {
        partnerProject: { select: { projectCode: true, projectName: true } },
      },
    });

    if (!commission) {
      throw new ApiError(404, "Commission record not found.");
    }

    // IDOR protection
    if (commission.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied. You do not own this commission record.");
    }

    if (commission.status === "PAID") {
      throw new ApiError(400, "This commission has already been paid and settled.");
    }

    if (commission.status === "REQUESTED" || commission.status === "PROCESSING" || commission.status === "APPROVED") {
      throw new ApiError(400, `A payout request is already actively in '${commission.status}' status.`);
    }

    if (commission.status !== "ELIGIBLE" && commission.status !== "REJECTED") {
      throw new ApiError(400, `Commission is in '${commission.status}' status and is not eligible for payout request.`);
    }

    // Minimum payout threshold: ₹500
    const MINIMUM_PAYOUT_INR = 500;
    if (commission.commissionAmount < MINIMUM_PAYOUT_INR) {
      throw new ApiError(
        400,
        `Commission amount (₹${commission.commissionAmount}) is below the minimum payout threshold of ₹${MINIMUM_PAYOUT_INR}.`
      );
    }

    // 2. Resolve payout details (use provided details, or fallback to saved profile details)
    let resolvedMethod = payoutMethod;
    let resolvedDetails = payoutDetails;

    if (!resolvedMethod || !resolvedDetails || Object.keys(resolvedDetails).length === 0) {
      // Check saved settings in OrganizationSetting
      const savedExt = await db.organizationSetting.findUnique({
        where: { key: `broker_ext:${brokerProfile.id}` },
      });
      const ext = savedExt?.value as any;
      if (ext?.payoutDetails && ext.payoutDetails.method) {
        resolvedMethod = ext.payoutDetails.method === "BANK" ? "BANK_TRANSFER" : "UPI";
        resolvedDetails = ext.payoutDetails;
      }
    }

    if (!resolvedMethod) {
      throw new ApiError(400, "Payout method is required. Select 'BANK_TRANSFER' or 'UPI'.");
    }

    if (resolvedMethod === "BANK_TRANSFER") {
      const { accountHolder, accountNumber, ifsc } = (resolvedDetails || {}) as any;
      if (!accountHolder?.trim() || !accountNumber?.trim() || !ifsc?.trim()) {
        throw new ApiError(
          400,
          "Account holder name, account number, and IFSC code are required for Bank Transfer. Update your payout profile first."
        );
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(ifsc.trim())) {
        throw new ApiError(400, "Invalid IFSC code format (e.g. HDFC0001234).");
      }
    } else if (resolvedMethod === "UPI") {
      const { upiId } = (resolvedDetails || {}) as any;
      if (!upiId?.trim() || !upiId.includes("@")) {
        throw new ApiError(400, "A valid UPI ID is required (e.g. username@okhdfcbank).");
      }
    }

    const requestedAt = new Date();
    // SLA: 48 business hours
    const dueAt = new Date(requestedAt.getTime() + 48 * 60 * 60 * 1000);

    const [updatedCommission] = await db.$transaction([
      db.commission.update({
        where: { id: commissionId },
        data: {
          status: "REQUESTED",
          payoutRequestedAt: requestedAt,
          payoutDueAt: dueAt,
          payoutMethod: resolvedMethod,
          payoutDetails: resolvedDetails as any,
          payoutNotes: notes?.trim() || null,
          rejectionReason: null, // Clear any prior rejection
        },
      }),
      db.auditLog.create({
        data: {
          userId: session.userId,
          action: "BROKER_PAYOUT_REQUESTED",
          resource: "Commission",
          details: {
            commissionId,
            projectCode: commission.partnerProject?.projectCode,
            amount: commission.commissionAmount,
            payoutMethod: resolvedMethod,
            payoutDueAt: dueAt.toISOString(),
          },
        },
      }),
      db.notification.create({
        data: {
          userId: session.userId,
          type: "SYSTEM",
          title: "Payout Request Received",
          message: `Your payout request for ₹${commission.commissionAmount.toLocaleString()} (${commission.partnerProject?.projectCode || ""}) has been registered. Target review SLA is 48 business hours.`,
          link: "/broker/commissions",
        },
      }),
    ]);

    await notifyAdmins({
      title: "New Broker Payout Request",
      message: `Broker ${session.userId} submitted payout request for ₹${commission.commissionAmount.toLocaleString()} (${commission.partnerProject?.projectCode || ""}). SLA is 48 hours.`,
      link: "/admin/crm/commissions",
    });

    return apiSuccess({
      commissionId: updatedCommission.id,
      status: "REQUESTED",
      amount: updatedCommission.commissionAmount,
      payoutMethod: resolvedMethod,
      requestedAt: requestedAt.toISOString(),
      slaDueAt: dueAt.toISOString(),
      message: "Payout request submitted successfully. SLA target is 48 business hours.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
