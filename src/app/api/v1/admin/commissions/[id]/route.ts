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

    if (action === "approve") {
      // Transition rule: PENDING/ELIGIBLE -> APPROVED
      if (commission.status !== "PENDING" && commission.status !== "ELIGIBLE") {
        throw new ApiError(400, "Only PENDING or ELIGIBLE commissions can be approved.");
      }
      
      await db.$transaction([
        db.commission.update({
          where: { id: params.id },
          data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId, notes: notes || commission.notes },
        }),
        db.auditLog.create({
          data: { userId, action: "COMMISSION_APPROVED", resource: "Commission", details: { commissionId: params.id } }
        }),
        db.notification.create({
          data: { userId: commission.brokerProfile.userId, type: "SYSTEM", title: "Commission Approved", message: `Your commission of ₹${commission.commissionAmount} has been approved.`, link: "/broker/commissions" }
        })
      ]);
      return NextResponse.json({ success: true, message: "Commission approved." });
    }

    if (action === "pay") {
      // Transition rule: APPROVED -> PAID
      if (commission.status !== "APPROVED") {
        throw new ApiError(400, "Commission must be APPROVED before payout.");
      }

      await db.$transaction([
        db.commission.update({
          where: { id: params.id },
          data: { 
            status: "PAID", 
            paidAt: new Date(), 
            paidById: userId, 
            notes: notes || commission.notes,
            payoutReference: payoutReference || null
          },
        }),
        db.auditLog.create({
          data: { userId, action: "COMMISSION_PAID", resource: "Commission", details: { commissionId: params.id, payoutReference } }
        }),
        db.notification.create({
          data: { userId: commission.brokerProfile.userId, type: "SYSTEM", title: "Commission Paid", message: `Your commission of ₹${commission.commissionAmount} has been paid. Ref: ${payoutReference || 'N/A'}`, link: "/broker/commissions" }
        })
      ]);
      return NextResponse.json({ success: true, message: "Commission marked as paid." });
    }
    
    if (action === "reject") {
      await db.$transaction([
        db.commission.update({
          where: { id: params.id },
          data: { status: "REJECTED", notes: notes || commission.notes },
        }),
        db.auditLog.create({
          data: { userId, action: "COMMISSION_REJECTED", resource: "Commission", details: { commissionId: params.id, reason: notes } }
        }),
        db.notification.create({
          data: { userId: commission.brokerProfile.userId, type: "SYSTEM", title: "Commission Rejected", message: `Your commission was rejected.`, link: "/broker/commissions" }
        })
      ]);
      return NextResponse.json({ success: true, message: "Commission rejected." });
    }

    throw new ApiError(400, "Invalid action.");
  } catch (error) {
    return handleApiError(error);
  }
}
