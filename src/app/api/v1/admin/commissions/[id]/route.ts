import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { action, notes, payoutReference } = body;

    const commission = await db.commission.findUnique({
      where: { id: params.id },
      include: { brokerProfile: { select: { userId: true } } }
    });
    
    if (!commission) throw new ApiError(404, "Commission not found.");

    // BP-1204: History Immutability - Once PAID, it cannot be modified arbitrarily
    if (commission.status === "PAID" && action !== "adjust") {
       throw new ApiError(400, "Paid commissions cannot be modified.");
    }

    if (action === "approve" || action === "process") {
      // Transition rule: REQUESTED, PENDING, or ELIGIBLE -> PROCESSING / APPROVED
      if (commission.status !== "REQUESTED" && commission.status !== "PENDING" && commission.status !== "ELIGIBLE") {
        throw new ApiError(400, "Only REQUESTED, PENDING, or ELIGIBLE commissions can be approved for payout.");
      }
      
      const newStatus = action === "process" ? "PROCESSING" : "APPROVED";

      await db.$transaction([
        db.commission.update({
          where: { id: params.id },
          data: { 
            status: newStatus, 
            approvedAt: new Date(), 
            approvedById: userId, 
            payoutNotes: notes || commission.payoutNotes,
            notes: notes || commission.notes 
          },
        }),
        db.auditLog.create({
          data: { 
            userId, 
            action: `COMMISSION_${newStatus}`, 
            resource: "Commission", 
            details: { commissionId: params.id, amount: commission.commissionAmount, status: newStatus } 
          }
        }),
        db.notification.create({
          data: { 
            userId: commission.brokerProfile.userId, 
            type: "SYSTEM", 
            title: "Payout Request Processing", 
            message: `Your payout request for ₹${commission.commissionAmount.toLocaleString()} has been approved and is being processed by Finance.`, 
            link: "/broker/commissions" 
          }
        })
      ]);
      return NextResponse.json({ success: true, message: `Commission marked as ${newStatus}.` });
    }

    if (action === "pay") {
      // Business Rule: Payout is marked PAID only upon verified settlement confirmation with UTR
      if (!payoutReference || !payoutReference.trim()) {
        throw new ApiError(400, "Bank transaction reference (UTR) is strictly required to mark commission as PAID.");
      }

      if (commission.status !== "APPROVED" && commission.status !== "PROCESSING" && commission.status !== "REQUESTED") {
        throw new ApiError(400, "Commission must be in REQUESTED, PROCESSING, or APPROVED status before final payout settlement.");
      }

      const cleanUtr = payoutReference.trim();

      // Financial Safeguard: Ensure UTR is unique and not already recorded for another settled payout
      const duplicateUtr = db.commission.findFirst
        ? await db.commission.findFirst({
            where: {
              payoutReference: cleanUtr,
              id: { not: params.id },
              status: "PAID",
            },
          })
        : null;
      if (duplicateUtr) {
        throw new ApiError(400, `Bank transaction reference (UTR) '${cleanUtr}' has already been recorded for another settled commission.`);
      }

      await db.$transaction([
        db.commission.update({
          where: { id: params.id },
          data: { 
            status: "PAID", 
            paidAt: new Date(), 
            paidById: userId, 
            notes: notes || commission.notes,
            payoutReference: cleanUtr,
          },
        }),
        db.auditLog.create({
          data: { 
            userId, 
            action: "COMMISSION_PAID", 
            resource: "Commission", 
            details: { commissionId: params.id, payoutReference: cleanUtr, amount: commission.commissionAmount } 
          }
        }),
        db.notification.create({
          data: { 
            userId: commission.brokerProfile.userId, 
            type: "SYSTEM", 
            title: "Payout Settled", 
            message: `Your commission of ₹${commission.commissionAmount.toLocaleString()} has been settled. UTR / Ref: ${cleanUtr}`, 
            link: "/broker/commissions" 
          }
        })
      ]);
      return NextResponse.json({ success: true, message: "Commission marked as paid and settled.", payoutReference: cleanUtr });
    }
    
    if (action === "reject") {
      const reason = body.rejectionReason?.trim() || notes?.trim();
      if (!reason) {
        throw new ApiError(400, "A rejection reason is required to reject a payout request.");
      }

      await db.$transaction([
        db.commission.update({
          where: { id: params.id },
          data: { 
            status: "REJECTED", 
            rejectionReason: reason,
            payoutNotes: reason,
            notes: reason 
          },
        }),
        db.auditLog.create({
          data: { userId, action: "COMMISSION_REJECTED", resource: "Commission", details: { commissionId: params.id, reason } }
        }),
        db.notification.create({
          data: { 
            userId: commission.brokerProfile.userId, 
            type: "SYSTEM", 
            title: "Payout Request Rejected", 
            message: `Your payout request was rejected. Reason: ${reason}. You may correct your account details and re-request.`, 
            link: "/broker/commissions" 
          }
        })
      ]);
      return NextResponse.json({ success: true, message: "Commission payout request rejected." });
    }

    throw new ApiError(400, "Invalid action.");
  } catch (error) {
    return handleApiError(error);
  }
}
