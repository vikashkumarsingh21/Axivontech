import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:read");

    const identifier = params.id;

    // Look up user by User.id, BrokerProfile.id, or BrokerProfile.partnerId
    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        userRoles: {
          include: { role: true },
        },
        brokerProfile: {
          select: {
            id: true,
            partnerId: true,
            referralCode: true,
            companyName: true,
            designation: true,
          },
        },
      },
    });

    if (!brokerUser || !brokerUser.brokerProfile) {
      throw new ApiError(404, "Broker account not found.");
    }

    const brokerProfile = brokerUser.brokerProfile;

    // Query dependent records
    const [
      leadsCount,
      projectsCount,
      commissionsCount,
      documentsCount,
      contractsCount,
      paymentsCount,
    ] = await Promise.all([
      db.lead.count({
        where: { ownerId: brokerUser.id },
      }),
      db.partnerProject.count({
        where: { brokerProfileId: brokerProfile.id },
      }),
      db.commission.count({
        where: { brokerProfileId: brokerProfile.id },
      }),
      db.partnerDocument.count({
        where: { brokerProfileId: brokerProfile.id },
      }),
      db.partnerContract.count({
        where: { partnerProject: { brokerProfileId: brokerProfile.id } },
      }),
      db.partnerPayment.count({
        where: { partnerProject: { brokerProfileId: brokerProfile.id } },
      }),
    ]);

    const isSelf = adminId === brokerUser.id;
    const isPrivileged = brokerUser.userRoles.some((ur) =>
      ["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(ur.role.name)
    );

    const totalBusinessRecords =
      leadsCount +
      projectsCount +
      commissionsCount +
      documentsCount +
      contractsCount +
      paymentsCount;

    const hasBusinessRecords = totalBusinessRecords > 0;
    const canPermanentlyDelete = !hasBusinessRecords && !isSelf && !isPrivileged;
    const canDeactivate = !isSelf && !isPrivileged && brokerUser.status !== "INACTIVE";

    let restrictionReason: string | null = null;
    if (isSelf) {
      restrictionReason = "You cannot delete or deactivate your own account.";
    } else if (isPrivileged) {
      restrictionReason = "Cannot delete or deactivate privileged administrative accounts.";
    } else if (hasBusinessRecords) {
      restrictionReason = `This broker has associated business or financial records (${leadsCount} leads, ${projectsCount} partner projects, ${commissionsCount} commission records, ${contractsCount} contracts, ${paymentsCount} payments, ${documentsCount} documents). Permanent deletion is restricted to protect historical financial and operational data. You can deactivate this account while retaining its complete history.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        broker: {
          id: brokerUser.id,
          name: brokerUser.name,
          email: brokerUser.email,
          phone: brokerUser.phone,
          status: brokerUser.status,
          partnerId: brokerProfile.partnerId,
          referralCode: brokerProfile.referralCode,
          companyName: brokerProfile.companyName,
          designation: brokerProfile.designation,
          createdAt: brokerUser.createdAt,
        },
        counts: {
          leads: leadsCount,
          projects: projectsCount,
          commissions: commissionsCount,
          contracts: contractsCount,
          documents: documentsCount,
          payments: paymentsCount,
          total: totalBusinessRecords,
        },
        isSelf,
        isPrivileged,
        hasBusinessRecords,
        canPermanentlyDelete,
        canDeactivate,
        restrictionReason,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
