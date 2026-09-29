import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    if (!brokerId || role !== "BROKER") throw new ApiError(403, "Access denied.");

    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const payment = await db.partnerPayment.findUnique({
      where: { id: params.id },
      include: { 
        partnerProject: { 
          select: { 
            id: true, projectCode: true, brokerProfileId: true,
            contract: { select: { status: true } }
          } 
        } 
      },
    });
    if (!payment) throw new ApiError(404, "Payment not found.");
    if (payment.partnerProject.brokerProfileId !== brokerProfile.id) throw new ApiError(403, "Access denied.");
    if (payment.status !== "PENDING" && payment.status !== "REJECTED") {
      throw new ApiError(400, "Payment has already been submitted.");
    }
    
    // Phase 7: Payment Gate
    if (!payment.partnerProject.contract || payment.partnerProject.contract.status !== "VERIFIED") {
       throw new ApiError(400, "Project contract must be VERIFIED before payment can be submitted.");
    }

    const body = await req.json();
    const { paymentMethod, amountPaid, transactionId, paymentDate, proofFileUrl, proofStorageKey, additionalNotes } = body;

    if (!paymentMethod || (paymentMethod !== "BANK" && paymentMethod !== "UPI")) throw new ApiError(400, "Payment method must be BANK or UPI.");
    if (!amountPaid || amountPaid <= 0) throw new ApiError(400, "Valid amount is required.");
    if (!transactionId) throw new ApiError(400, "Transaction ID / UTR is required.");
    if (!proofFileUrl) throw new ApiError(400, "Payment screenshot is required.");

    await db.$transaction([
      db.partnerPayment.update({
        where: { id: params.id },
        data: {
          paymentMethod,
          amountPaid: parseFloat(amountPaid),
          transactionId: transactionId.trim(),
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          proofFileUrl,
          proofStorageKey: proofStorageKey || null,
          additionalNotes: additionalNotes?.trim() || null,
          status: "SUBMITTED",
          submittedAt: new Date(),
          // Clear any previous rejection
          rejectionReason: null,
          rejectedAt: null,
        },
      }),
      db.partnerProject.update({
        where: { id: payment.partnerProject.id },
        data: { status: "PAYMENT_SUBMITTED" },
      }),
      db.auditLog.create({
        data: {
          userId: brokerId, action: "PAYMENT_SUBMITTED", resource: "PartnerPayment",
          details: { paymentId: params.id, projectCode: payment.partnerProject.projectCode, method: paymentMethod, amount: amountPaid, utr: transactionId },
        },
      }),
    ]);

    // Notify admins
    const admins = await db.user.findMany({
      where: { userRoles: { some: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } } }, status: "ACTIVE" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id, type: "SYSTEM" as const, title: "Payment Proof Submitted",
          message: `Payment proof submitted for project ${payment.partnerProject.projectCode}. UTR: ${transactionId}. Verification required.`,
          link: `/admin/crm/partner-projects/${payment.partnerProject.id}`,
        })),
      });
    }

    return NextResponse.json({ success: true, message: "Payment submitted for verification." });
  } catch (error) {
    return handleApiError(error);
  }
}
