import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireBroker,
  checkIdempotency,
  checkRateLimit,
  logBrokerAudit,
  notifyAdmins,
  apiSuccess,
  handleApiError,
  ApiError,
} from "@/lib/api/broker";

const submitPaymentSchema = z.object({
  paymentMethod: z.enum(["BANK", "UPI"], {
    errorMap: () => ({ message: "Payment method must be 'BANK' or 'UPI'." }),
  }),
  amountPaid: z.coerce.number().positive("Amount paid must be greater than 0."),
  transactionId: z
    .string()
    .trim()
    .min(6, "Transaction ID / UTR must be at least 6 characters.")
    .max(50, "Transaction ID / UTR must not exceed 50 characters."),
  paymentDate: z.string().optional().nullable(),
  proofFileUrl: z.string().url("A valid payment proof screenshot URL is required."),
  proofStorageKey: z.string().optional().nullable(),
  additionalNotes: z.string().max(1000).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { brokerProfile, session } = await requireBroker(req);

    // Rate limit: max 10 submissions per 60s
    await checkRateLimit(req, "payment-submit", 10, 60);

    const body = await req.json().catch(() => ({}));
    const validated = submitPaymentSchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.errors[0]?.message || "Invalid input data");
    }

    const {
      paymentMethod,
      amountPaid,
      transactionId,
      paymentDate,
      proofFileUrl,
      proofStorageKey,
      additionalNotes,
    } = validated.data;

    // Idempotency guard: prevent duplicate submission of the exact same payment proof
    const idempotencyKey = `${id}:${transactionId}:${amountPaid}`;
    const isDuplicate = await checkIdempotency(req, "payment_submit", idempotencyKey);
    if (isDuplicate) {
      return apiSuccess({
        paymentId: id,
        message: "Payment proof has already been submitted and is currently being verified.",
      });
    }

    const payment = await db.partnerPayment.findUnique({
      where: { id },
      include: {
        partnerProject: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
            brokerProfileId: true,
            contract: { select: { status: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(404, "Payment record not found.");
    }

    // IDOR Protection: broker must own the project
    if (payment.partnerProject.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied. You do not own this payment record.");
    }

    if (payment.status !== "PENDING" && payment.status !== "REJECTED") {
      throw new ApiError(400, `Payment is in '${payment.status}' status and cannot be resubmitted.`);
    }

    // Contract gate: project contract must be VERIFIED
    if (!payment.partnerProject.contract || payment.partnerProject.contract.status !== "VERIFIED") {
      throw new ApiError(
        400,
        "Project contract must be signed and VERIFIED by Axivon before advance payment can be submitted."
      );
    }

    // Amount validation with safe IEEE-754 precision tolerance
    const expectedAmount = payment.advanceAmount ?? payment.projectPrice ?? 0;
    if (Math.abs(amountPaid - expectedAmount) > 0.05) {
      throw new ApiError(
        400,
        `Submitted amount (₹${amountPaid}) does not match the required advance amount (₹${expectedAmount}).`
      );
    }

    // Duplicate UTR check across all payments
    const existingUtr = await db.partnerPayment.findFirst({
      where: {
        transactionId,
        id: { not: id },
      },
    });
    if (existingUtr) {
      throw new ApiError(
        400,
        `Transaction ID / UTR '${transactionId}' has already been submitted for another payment.`
      );
    }

    const submittedDate = paymentDate ? new Date(paymentDate) : new Date();

    await db.$transaction([
      db.partnerPayment.update({
        where: { id },
        data: {
          paymentMethod,
          amountPaid,
          transactionId,
          paymentDate: submittedDate,
          proofFileUrl,
          proofStorageKey: proofStorageKey || null,
          additionalNotes: additionalNotes || null,
          status: "SUBMITTED",
          submittedAt: new Date(),
          rejectionReason: null,
          rejectedAt: null,
        },
      }),
      db.partnerProject.update({
        where: { id: payment.partnerProject.id },
        data: { status: "PAYMENT_SUBMITTED" },
      }),
    ]);

    await logBrokerAudit(
      session.userId,
      "PAYMENT_SUBMITTED",
      "PartnerPayment",
      {
        paymentId: id,
        projectCode: payment.partnerProject.projectCode,
        amount: amountPaid,
        method: paymentMethod,
        utr: transactionId,
      }
    );

    await notifyAdmins({
      title: "Payment Proof Submitted",
      message: `Payment proof submitted for project ${payment.partnerProject.projectCode}. UTR: ${transactionId}, Amount: ₹${amountPaid.toLocaleString()}. Verification required.`,
      link: `/admin/crm/partner-projects/${payment.partnerProject.id}`,
    });

    return apiSuccess({
      paymentId: id,
      status: "SUBMITTED",
      projectStatus: "PAYMENT_SUBMITTED",
      message: "Payment proof submitted successfully. Verification SLA is 24 business hours.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
