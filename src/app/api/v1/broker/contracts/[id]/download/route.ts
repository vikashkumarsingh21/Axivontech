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

    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get("versionId");

    const contract = await db.partnerContract.findUnique({
      where: { id: params.id },
      include: {
        partnerProject: { select: { brokerProfileId: true, projectCode: true } },
        versions: versionId
          ? { where: { id: versionId } }
          : { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });
    if (!contract || contract.versions.length === 0) throw new ApiError(404, "Contract or version not found.");
    if (contract.partnerProject.brokerProfileId !== brokerProfile.id) throw new ApiError(403, "Access denied.");

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
        db.auditLog.create({
          data: { userId: brokerId, action: "CONTRACT_DOWNLOADED", resource: "PartnerContract", details: { contractId: params.id, versionId: targetVersion.id, projectCode: contract.partnerProject.projectCode } },
        })
      ]);
    }

    return NextResponse.json({ success: true, fileUrl: targetVersion.contractFileUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
