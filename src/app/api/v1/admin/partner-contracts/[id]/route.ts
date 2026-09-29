import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:read");

    const contract = await db.partnerContract.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        partnerProject: {
          include: {
            brokerProfile: { select: { id: true, user: { select: { name: true, email: true } } } },
          },
        },
      },
    });
    if (!contract) throw new ApiError(404, "Contract not found.");

    return NextResponse.json({ data: contract });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json();
    const { action, rejectionReason, versionId } = body;

    if (!versionId) throw new ApiError(400, "versionId is required.");

    const contract = await db.partnerContract.findUnique({
      where: { id: params.id },
      include: {
        versions: { where: { id: versionId } },
        partnerProject: { select: { id: true, projectCode: true, projectBudget: true, finalProjectValue: true, brokerProfile: { select: { userId: true } } } }
      },
    });
    if (!contract || contract.versions.length === 0) throw new ApiError(404, "Contract or version not found.");

    const targetVersion = contract.versions[0];
    const brokerUserId = contract.partnerProject.brokerProfile.userId;
    const projectId = contract.partnerProject.id;
    const projectCode = contract.partnerProject.projectCode;

    if (action === "verify") {
      if (targetVersion.status !== "UNDER_REVIEW" && targetVersion.status !== "SIGNED") {
        throw new ApiError(400, "Contract version must be in UNDER_REVIEW or SIGNED status to verify.");
      }

      // Resolve project price from finalProjectValue (established in Phase 6)
      const projectPrice = contract.partnerProject.finalProjectValue || parseFloat(contract.partnerProject.projectBudget.replace(/[^0-9.]/g, "")) || 0;
      
      const advancePercentage = 40;
      const advanceAmount = Math.round((projectPrice * advancePercentage) / 100);
      const remainingAmount = projectPrice - advanceAmount;

      // Snapshot current active payment settings
      const [bankSettings, upiSettings] = await Promise.all([
        db.paymentSettings.findFirst({ where: { type: "BANK", isActive: true } }),
        db.paymentSettings.findFirst({ where: { type: "UPI", isActive: true } }),
      ]);

      await db.$transaction([
        db.partnerContractVersion.update({
          where: { id: versionId },
          data: { status: "VERIFIED", verifiedAt: new Date(), verifiedById: userId },
        }),
        db.partnerContract.update({
          where: { id: params.id },
          data: { status: "VERIFIED" },
        }),
        db.partnerProject.update({
          where: { id: projectId },
          data: { status: "PAYMENT_PENDING" },
        }),
        db.partnerPayment.create({
          data: {
            partnerProjectId: projectId,
            projectPrice,
            advancePercentage,
            advanceAmount,
            remainingAmount,
            paymentSettingsSnapshot: { bank: bankSettings, upi: upiSettings },
            status: "PENDING",
          },
        }),
        db.auditLog.create({
          data: { userId, action: "CONTRACT_VERIFIED", resource: "PartnerContract", details: { contractId: params.id, versionId, projectCode } },
        }),
        db.notification.create({
          data: {
            userId: brokerUserId,
            type: "SYSTEM",
            title: "Contract Verified",
            message: `Your contract for project ${projectCode} has been verified. Please proceed with payment.`,
            link: `/broker/projects/${projectId}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Contract verified. Payment request created." });
    }

    if (action === "reject") {
      if (!rejectionReason) throw new ApiError(400, "Rejection reason is required.");

      await db.$transaction([
        db.partnerContractVersion.update({
          where: { id: versionId },
          data: { status: "REJECTED", rejectionReason, rejectedAt: new Date() },
        }),
        db.partnerContract.update({
          where: { id: params.id },
          data: { status: "REJECTED" },
        }),
        db.auditLog.create({
          data: { userId, action: "CONTRACT_REJECTED", resource: "PartnerContract", details: { contractId: params.id, versionId, projectCode, reason: rejectionReason } },
        }),
        db.notification.create({
          data: {
            userId: brokerUserId,
            type: "SYSTEM",
            title: "Contract Rejected",
            message: `Your contract for project ${projectCode} was rejected. Reason: ${rejectionReason}`,
            link: `/broker/projects/${projectId}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Contract rejected." });
    }

    if (action === "request_reupload") {
      await db.$transaction([
        db.partnerContractVersion.update({
          where: { id: versionId },
          data: { status: "REUPLOAD_REQUIRED", rejectionReason: "Re-upload requested", rejectedAt: new Date() },
        }),
        db.partnerContractVersion.create({
          data: {
            partnerContractId: params.id,
            versionNumber: targetVersion.versionNumber + 1,
            contractName: targetVersion.contractName,
            contractDescription: targetVersion.contractDescription,
            contractFileUrl: targetVersion.contractFileUrl,
            contractStorageKey: targetVersion.contractStorageKey,
            sentById: userId!,
            status: "SENT",
          },
        }),
        db.partnerContract.update({
          where: { id: params.id },
          data: { status: "SENT" },
        }),
        db.partnerProject.update({
          where: { id: projectId },
          data: { status: "CONTRACT_SENT" },
        }),
        db.auditLog.create({
          data: { userId, action: "CONTRACT_REUPLOAD_REQUESTED", resource: "PartnerContract", details: { contractId: params.id, versionId, projectCode } },
        }),
        db.notification.create({
          data: {
            userId: brokerUserId,
            type: "SYSTEM",
            title: "Contract Re-upload Required",
            message: `Please re-upload the signed contract for project ${projectCode}.`,
            link: `/broker/projects/${projectId}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Re-upload requested." });
    }

    throw new ApiError(400, "Invalid action. Use 'verify', 'reject', or 'request_reupload'.");
  } catch (error) {
    return handleApiError(error);
  }
}
