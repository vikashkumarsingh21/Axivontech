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

    const contract = await db.partnerContract.findUnique({
      where: { id: params.id },
      include: { partnerProject: { select: { brokerProfileId: true, id: true, projectCode: true } } },
    });
    if (!contract) throw new ApiError(404, "Contract not found.");
    if (contract.partnerProject.brokerProfileId !== brokerProfile.id) {
      throw new ApiError(403, "Access denied.");
    }

    const body = await req.json();
    const { versionId, signedFileUrl, signedStorageKey, stampFileUrl, stampStorageKey, signingConfirmed } = body;

    if (!versionId) throw new ApiError(400, "versionId is required.");
    if (!signedFileUrl) throw new ApiError(400, "Signed contract file is required.");
    if (!signingConfirmed) throw new ApiError(400, "You must confirm that the contract has been reviewed and signed.");

    // verify version belongs to this contract
    const version = await db.partnerContractVersion.findUnique({ where: { id: versionId } });
    if (!version || version.partnerContractId !== params.id) {
        throw new ApiError(404, "Contract version not found.");
    }

    await db.$transaction([
      db.partnerContractVersion.update({
        where: { id: versionId },
        data: {
          signedFileUrl,
          signedStorageKey: signedStorageKey || null,
          stampFileUrl: stampFileUrl || null,
          stampStorageKey: stampStorageKey || null,
          signedAt: new Date(),
          signingConfirmed: true,
          status: "UNDER_REVIEW",
        },
      }),
      db.partnerContract.update({
        where: { id: params.id },
        data: { status: "UNDER_REVIEW" }
      }),
      db.partnerProject.update({
        where: { id: contract.partnerProject.id },
        data: { status: "CONTRACT_SIGNED" },
      }),
      db.auditLog.create({
        data: { userId: brokerId, action: "SIGNED_CONTRACT_UPLOADED", resource: "PartnerContract", details: { contractId: params.id, versionId, projectCode: contract.partnerProject.projectCode } },
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
          userId: a.id, type: "SYSTEM" as const, title: "Signed Contract Uploaded",
          message: `Broker uploaded signed contract for project ${contract.partnerProject.projectCode}. Review required.`,
          link: `/admin/crm/partner-projects/${contract.partnerProject.id}`,
        })),
      });
    }

    return NextResponse.json({ success: true, message: "Signed contract uploaded. Under review." });
  } catch (error) {
    return handleApiError(error);
  }
}
