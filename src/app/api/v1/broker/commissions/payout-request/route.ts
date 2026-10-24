import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { normalizeRole, canAccessPartnerPortal } from "@/lib/auth/roles";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const role = normalizeRole(session.role);

    if (!canAccessPartnerPortal(role)) {
      throw new ApiError(403, "Access denied. Only authenticated partners can request payouts.");
    }

    const brokerUserId = session.userId;

    const brokerProfile = await db.brokerProfile.findUnique({
      where: { userId: brokerUserId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!brokerProfile) {
      throw new ApiError(404, "Broker profile not found.");
    }

    const body = await req.json().catch(() => ({}));
    const { commissionId, payoutMethod, payoutDetails, notes } = body;

    if (!commissionId) {
      throw new ApiError(400, "commissionId is required.");
    }

    if (!payoutMethod || (payoutMethod !== "BANK_TRANSFER" && payoutMethod !== "UPI")) {
      throw new ApiError(400, "Invalid payoutMethod. Supported methods: 'BANK_TRANSFER', 'UPI'.");
    }

    if (!payoutDetails || typeof payoutDetails !== "object") {
      throw new ApiError(400, "Valid payoutDetails are required.");
    }

    // Validate method-specific details
    if (payoutMethod === "BANK_TRANSFER") {
      const { accountHolder, accountNumber, ifsc, bankName } = payoutDetails;
      if (!accountHolder?.trim() || !accountNumber?.trim() || !ifsc?.trim()) {
        throw new ApiError(400, "Account holder name, account number, and IFSC code are required for Bank Transfer.");
      }
      // IFSC basic format validation (4 letters, 0, 6 alphanumerics)
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(ifsc.trim())) {
        throw new ApiError(400, "Invalid IFSC code format (e.g., HDFC0001234).");
      }
    } else if (payoutMethod === "UPI") {
      const { upiId } = payoutDetails;
      if (!upiId?.trim() || !upiId.includes("@")) {
        throw new ApiError(400, "Valid UPI ID is required (e.g., username@bank).");
      }
    }

    const commission = await db.commission.findUnique({
      where: { id: commissionId },
      include: {
        partnerProject: { select: { projectCode: true, projectName: true } },
      },
    });

    if (!commission) {
      throw new ApiError(404, "Commission record not found.");
    }

    if (commission.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied. This commission does not belong to your broker account.");
    }

    if (commission.status === "PAID") {
      throw new ApiError(400, "This commission has already been paid and settled.");
    }

    if (commission.status === "REQUESTED" || commission.status === "PROCESSING") {
      throw new ApiError(400, "A payout request is already actively being processed for this commission.");
    }

    if (commission.status !== "ELIGIBLE" && commission.status !== "REJECTED") {
      throw new ApiError(400, `Commission is in '${commission.status}' status and is not eligible for payout request.`);
    }

    const requestedAt = new Date();
    // SLA: 48 elapsed business hours (2 calendar days from request timestamp)
    const dueAt = new Date(requestedAt.getTime() + 48 * 60 * 60 * 1000);

    // Identify Admin & Finance users to notify of pending 48h SLA payout
    const financeAndAdminUsers = db.userRole
      ? await db.userRole.findMany({
          where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER", "FINANCE"] } } },
          select: { userId: true },
        })
      : [];
    const adminRecipientIds = [...new Set(financeAndAdminUsers.map((r) => r.userId))].filter((id) => id !== brokerUserId);

    const transactionOps: any[] = [
      db.commission.update({
        where: { id: commissionId },
        data: {
          status: "REQUESTED",
          payoutRequestedAt: requestedAt,
          payoutDueAt: dueAt,
          payoutMethod,
          payoutDetails,
          payoutNotes: notes?.trim() || null,
          rejectionReason: null, // Clear any prior rejection reason upon fresh request
        },
      }),
      db.auditLog.create({
        data: {
          userId: brokerUserId,
          action: "BROKER_PAYOUT_REQUESTED",
          resource: "Commission",
          details: {
            commissionId,
            projectCode: commission.partnerProject?.projectCode,
            amount: commission.commissionAmount,
            payoutMethod,
            payoutDueAt: dueAt.toISOString(),
          },
        },
      }),
      db.notification.create({
        data: {
          userId: brokerUserId,
          type: "SYSTEM",
          title: "Payout Request Received",
          message: `Your payout request for ₹${commission.commissionAmount.toLocaleString()} (${commission.partnerProject?.projectCode}) has been registered. Review SLA is 48 business hours.`,
          link: "/broker/commissions",
        },
      }),
    ];

    if (adminRecipientIds.length > 0) {
      transactionOps.push(
        db.notification.createMany({
          data: adminRecipientIds.map((adminId) => ({
            userId: adminId,
            type: "SYSTEM",
            title: "New Payout Request Submitted",
            message: `Broker ${brokerProfile.user.name} submitted a payout request of ₹${commission.commissionAmount.toLocaleString()} for project ${commission.partnerProject?.projectCode || ""}. Review SLA is 48 business hours.`,
            link: "/admin/crm/commissions",
          })),
        })
      );
    }

    const [updatedCommission] = await db.$transaction(transactionOps);

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully. SLA target is 48 business hours.",
      data: updatedCommission,
      slaDueAt: dueAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
