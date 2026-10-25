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

const uploadContractSchema = z.object({
  versionId: z.string().min(1, "versionId is required"),
  signedFileUrl: z
    .string()
    .url("A valid signed file URL is required")
    .refine((url) => {
      // Must point to a PDF document or verified secure upload
      const clean = url.split("?")[0].toLowerCase();
      return clean.endsWith(".pdf") || clean.includes("/uploads/") || clean.includes("blob:");
    }, "Only PDF contract files are permitted"),
  signedStorageKey: z.string().optional().nullable(),
  stampFileUrl: z.string().url().optional().nullable(),
  stampStorageKey: z.string().optional().nullable(),
  signingConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the contract has been reviewed and executed.",
  }),
  notes: z.string().max(1000).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { brokerProfile, session } = await requireBroker(req);

    // Rate limit: max 10 submissions per 60s
    checkRateLimit(req, "contract-upload", 10, 60);

    const body = await req.json().catch(() => ({}));
    const validated = uploadContractSchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.issues[0]?.message || "Invalid input");
    }

    const { versionId, signedFileUrl, signedStorageKey, stampFileUrl, stampStorageKey, notes } =
      validated.data;

    // Idempotency check
    const idempotencyKey = `${id}:${versionId}:${signedFileUrl}`;
    const isDuplicate = await checkIdempotency(req, "contract_upload", idempotencyKey);
    if (isDuplicate) {
      return apiSuccess({
        contractId: id,
        message: "Signed contract has already been submitted and is currently under review.",
      });
    }

    const contract = await db.partnerContract.findUnique({
      where: { id },
      include: {
        partnerProject: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
            brokerProfileId: true,
          },
        },
      },
    });

    if (!contract) {
      throw new ApiError(404, "Contract not found.");
    }

    // IDOR Protection
    if (contract.partnerProject.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied. You do not own this contract.");
    }

    // Verify version belongs to this contract
    const version = await db.partnerContractVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.partnerContractId !== id) {
      throw new ApiError(404, "Contract version not found for this contract.");
    }

    const signedAt = new Date();

    await db.$transaction([
      db.partnerContractVersion.update({
        where: { id: versionId },
        data: {
          signedFileUrl,
          signedStorageKey: signedStorageKey || null,
          stampFileUrl: stampFileUrl || null,
          stampStorageKey: stampStorageKey || null,
          signedAt,
          signingConfirmed: true,
          status: "UNDER_REVIEW",
        },
      }),
      db.partnerContract.update({
        where: { id },
        data: { status: "UNDER_REVIEW" },
      }),
      db.partnerProject.update({
        where: { id: contract.partnerProject.id },
        data: { status: "CONTRACT_SIGNED" },
      }),
    ]);

    await logBrokerAudit(
      session.userId,
      "SIGNED_CONTRACT_UPLOADED",
      "PartnerContract",
      {
        contractId: id,
        versionId,
        projectCode: contract.partnerProject.projectCode,
        notes: notes || undefined,
      }
    );

    await notifyAdmins({
      title: "Signed Contract Uploaded",
      message: `Broker ${session.userId} uploaded signed contract for project ${contract.partnerProject.projectCode}. Verification required.`,
      link: `/admin/crm/partner-projects/${contract.partnerProject.id}`,
    });

    return apiSuccess({
      contractId: id,
      versionId,
      status: "UNDER_REVIEW",
      projectStatus: "CONTRACT_SIGNED",
      message: "Signed contract uploaded successfully and submitted for review.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
