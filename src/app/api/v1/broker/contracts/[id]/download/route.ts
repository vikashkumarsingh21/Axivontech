import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, logBrokerAudit, apiSuccess, handleApiError, ApiError } from "@/lib/api/broker";

async function handleContractDownload(
  req: NextRequest,
  params: { id: string }
) {
  const { brokerProfile, session } = await requireBroker(req);
  const { searchParams } = new URL(req.url);
  const versionId = searchParams.get("versionId");

  const contract = await db.partnerContract.findUnique({
    where: { id: params.id },
    include: {
      partnerProject: {
        select: {
          brokerProfileId: true,
          projectCode: true,
          projectName: true,
        },
      },
      versions: versionId
        ? { where: { id: versionId } }
        : { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!contract || contract.versions.length === 0) {
    throw new ApiError(404, "Contract or contract version not found.");
  }

  // IDOR Protection: broker must own the project
  if (contract.partnerProject.brokerProfileId !== brokerProfile.id) {
    throw new ApiError(403, "Access denied. You do not own this contract.");
  }

  const targetVersion = contract.versions[0];

  if (targetVersion.status === "SENT") {
    await db.$transaction([
      db.partnerContractVersion.update({
        where: { id: targetVersion.id },
        data: { status: "DOWNLOADED" },
      }),
      db.partnerContract.update({
        where: { id: params.id },
        data: { status: "DOWNLOADED" },
      }),
    ]);
  }

  await logBrokerAudit(
    session.userId,
    "CONTRACT_DOWNLOADED",
    "PartnerContract",
    {
      contractId: params.id,
      versionId: targetVersion.id,
      projectCode: contract.partnerProject.projectCode,
    }
  );

  return apiSuccess({
    contractId: contract.id,
    versionId: targetVersion.id,
    versionNumber: targetVersion.versionNumber,
    contractName: targetVersion.contractName,
    projectCode: contract.partnerProject.projectCode,
    fileUrl: targetVersion.contractFileUrl,
    status: targetVersion.status === "SENT" ? "DOWNLOADED" : targetVersion.status,
  });
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    return await handleContractDownload(req, params);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    return await handleContractDownload(req, params);
  } catch (error) {
    return handleApiError(error);
  }
}
