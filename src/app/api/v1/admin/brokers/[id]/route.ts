import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, invalidateUserPermissionCache } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateBrokerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  companyName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_ACTIVATION"]).optional(),
  customCommissionRate: z.number().min(0).max(100).optional().nullable(),
});

export async function GET(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:read");

    const identifier = params.id;

    // Support lookup by User.id, BrokerProfile.id, or BrokerProfile.partnerId
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
        avatarUrl: true,
        address: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        brokerProfile: true,
      },
    });

    if (!brokerUser || !brokerUser.brokerProfile) {
      throw new ApiError(404, "Broker profile not found.");
    }

    const brokerProfile = brokerUser.brokerProfile;

    // Fetch extended settings (KYC, payout details, custom commission rate)
    const extSetting = await db.organizationSetting.findUnique({
      where: { key: `broker_ext:${brokerProfile.id}` },
    });
    const extData = (extSetting?.value as Record<string, any>) || {};

    // Fetch internal admin notes
    const notesSetting = await db.organizationSetting.findUnique({
      where: { key: `broker_notes:${brokerUser.id}` },
    });
    const internalNotes = Array.isArray(notesSetting?.value) ? notesSetting.value : [];

    // Parallel fetch related CRM data
    const [leads, projects, contracts, commissions, documents, auditLogs] = await Promise.all([
      db.lead.findMany({
        where: {
          ownerId: brokerUser.id,
          source: "PARTNER",
        },
        select: {
          id: true,
          leadCode: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          status: true,
          qualificationStatus: true,
          budget: true,
          serviceInterest: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.partnerProject.findMany({
        where: {
          brokerProfileId: brokerProfile.id,
        },
        select: {
          id: true,
          projectCode: true,
          projectName: true,
          requiredService: true,
          status: true,
          projectBudget: true,
          expectedTimeline: true,
          clientName: true,
          clientEmail: true,
          companyName: true,
          createdAt: true,
          commission: {
            select: {
              id: true,
              commissionAmount: true,
              commissionRate: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.partnerContract.findMany({
        where: {
          partnerProject: { brokerProfileId: brokerProfile.id },
        },
        include: {
          partnerProject: {
            select: {
              id: true,
              projectCode: true,
              projectName: true,
              clientName: true,
            },
          },
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
      db.commission.findMany({
        where: {
          brokerProfileId: brokerProfile.id,
        },
        include: {
          partnerProject: {
            select: {
              projectCode: true,
              projectName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.partnerDocument.findMany({
        where: {
          brokerProfileId: brokerProfile.id,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.auditLog.findMany({
        where: {
          OR: [
            { userId: brokerUser.id },
            { resource: { contains: brokerUser.id } },
            { resource: { contains: brokerProfile.id } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    // Financial aggregates
    let totalEarned = 0;
    let pendingCommission = 0;
    let eligibleCommission = 0;
    let paidCommission = 0;

    for (const c of commissions) {
      const amt = c.commissionAmount || 0;
      if (c.status === "PAID") {
        totalEarned += amt;
        paidCommission += amt;
      } else if (c.status === "PENDING") {
        pendingCommission += amt;
      } else if (c.status === "ELIGIBLE" || c.status === "REQUESTED" || c.status === "PROCESSING" || c.status === "APPROVED") {
        eligibleCommission += amt;
      }
    }

    const dossier = {
      user: brokerUser,
      profile: brokerProfile,
      kyc: {
        panNumber: extData.panNumber || null,
        gstNumber: extData.gstNumber || null,
        payoutMethod: extData.payoutMethod || null,
        payoutDetails: extData.payoutDetails || null,
        status: extData.kycStatus || "PENDING",
        remarks: extData.kycRemarks || null,
        verifiedAt: extData.kycVerifiedAt || null,
        verifiedBy: extData.kycVerifiedBy || null,
        termsAccepted: extData.termsAccepted === true,
        termsAcceptedAt: extData.termsAcceptedAt || null,
      },
      commissionConfig: {
        customRate: extData.customCommissionRate ?? null,
      },
      stats: {
        totalLeads: leads.length,
        totalProjects: projects.length,
        totalContracts: contracts.length,
        totalCommissions: commissions.length,
        totalEarned,
        pendingCommission,
        eligibleCommission,
        paidCommission,
      },
      leads,
      projects,
      contracts,
      commissions,
      documents,
      internalNotes,
      auditLogs,
    };

    return NextResponse.json({ success: true, data: dossier });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const identifier = params.id;
    const body = await req.json();
    const validatedData = updateBrokerSchema.parse(body);

    const existingBroker = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      include: { brokerProfile: true },
    });

    if (!existingBroker) {
      throw new ApiError(404, "Broker not found.");
    }

    const brokerId = existingBroker.id;
    const profileId = existingBroker.brokerProfile?.id;

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.status) {
      updateData.status = validatedData.status;
      updateData.inactiveAt = validatedData.status === "INACTIVE" || validatedData.status === "SUSPENDED" ? new Date() : null;
    }
    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
    }

    const brokerProfileUpdate: any = {};
    if (validatedData.companyName !== undefined) brokerProfileUpdate.companyName = validatedData.companyName;
    if (validatedData.designation !== undefined) brokerProfileUpdate.designation = validatedData.designation;
    if (validatedData.city !== undefined) brokerProfileUpdate.city = validatedData.city;
    if (validatedData.state !== undefined) brokerProfileUpdate.state = validatedData.state;
    if (validatedData.country !== undefined) brokerProfileUpdate.country = validatedData.country;
    if (validatedData.website !== undefined) brokerProfileUpdate.website = validatedData.website;

    if (Object.keys(brokerProfileUpdate).length > 0) {
      updateData.brokerProfile = {
        update: brokerProfileUpdate,
      };
    }

    // Save custom commission rate if provided
    if (profileId && validatedData.customCommissionRate !== undefined) {
      const extKey = `broker_ext:${profileId}`;
      const extSetting = await db.organizationSetting.findUnique({ where: { key: extKey } });
      const currentExt = (extSetting?.value as Record<string, any>) || {};
      currentExt.customCommissionRate = validatedData.customCommissionRate;
      await db.organizationSetting.upsert({
        where: { key: extKey },
        update: { value: currentExt, updatedById: adminId },
        create: { key: extKey, value: currentExt, updatedById: adminId },
      });
    }

    const updatedBroker = await db.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { id: brokerId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          phone: true,
          brokerProfile: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_UPDATED",
          resource: `User:${result.id}`,
          details: {
            brokerId: result.id,
            updatedFields: Object.keys(validatedData),
          },
        },
      });

      return result;
    });

    return NextResponse.json({ success: true, data: updatedBroker });
  } catch (error: any) {
    return handleApiError(error);
  }
}

const deleteBrokerSchema = z.object({
  reason: z.string().min(5, "Deletion reason must be at least 5 characters"),
  confirmationWord: z.string().refine((val) => val === "DELETE", {
    message: "Confirmation word must be exactly 'DELETE'",
  }),
});

export async function DELETE(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:delete");

    const identifier = params.id;
    const body = await req.json().catch(() => ({}));
    const { reason } = deleteBrokerSchema.parse(body);

    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      include: {
        brokerProfile: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!brokerUser || !brokerUser.brokerProfile) {
      throw new ApiError(404, "Broker account not found.");
    }

    if (adminId === brokerUser.id) {
      throw new ApiError(400, "You cannot delete your own account.");
    }

    const isPrivileged = brokerUser.userRoles.some((ur) =>
      ["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(ur.role.name)
    );
    if (isPrivileged) {
      throw new ApiError(403, "Cannot delete an account with Admin, Founder, or Co-Founder privileges.");
    }

    const brokerProfile = brokerUser.brokerProfile;

    // Strict dependency check: count all business, project, and financial entities
    const [leadsCount, projectsCount, contractsCount, commissionsCount, documentsCount, clientCount] =
      await Promise.all([
        db.lead.count({ where: { ownerId: brokerUser.id } }),
        db.partnerProject.count({ where: { brokerProfileId: brokerProfile.id } }),
        db.partnerContract.count({
          where: { partnerProject: { brokerProfileId: brokerProfile.id } },
        }),
        db.commission.count({ where: { brokerProfileId: brokerProfile.id } }),
        db.partnerDocument.count({ where: { brokerProfileId: brokerProfile.id } }),
        db.crmClient.count({ where: { ownerId: brokerUser.id } }),
      ]);

    const totalDependencies =
      leadsCount + projectsCount + contractsCount + commissionsCount + documentsCount + clientCount;

    if (totalDependencies > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "CANNOT_DELETE_HAS_DEPENDENCIES",
          message:
            "Cannot permanently delete this broker because they have associated business, project, or financial records. To preserve business integrity, reporting, and audit compliance, please use Option A (Deactivate & Keep History) instead.",
          dependencies: {
            leads: leadsCount,
            projects: projectsCount,
            contracts: contractsCount,
            commissions: commissionsCount,
            documents: documentsCount,
            clients: clientCount,
            total: totalDependencies,
          },
        },
        { status: 400 }
      );
    }

    // Zero dependencies confirmed -> execute permanent removal in transaction
    await db.$transaction(async (tx) => {
      // 1. Delete organization settings for this broker
      await tx.organizationSetting.deleteMany({
        where: {
          key: {
            in: [`broker_ext:${brokerProfile.id}`, `broker_notes:${brokerUser.id}`],
          },
        },
      });

      // 2. Delete BrokerProfile
      await tx.brokerProfile.delete({
        where: { id: brokerProfile.id },
      });

      // 3. Delete User account (UserRole, Session, UserPreference cascade automatically)
      await tx.user.delete({
        where: { id: brokerUser.id },
      });

      // 4. Record permanent deletion in audit log
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_PERMANENTLY_DELETED",
          resource: `User:${brokerUser.id}`,
          details: {
            deletedBrokerId: brokerUser.id,
            deletedBrokerProfileId: brokerProfile.id,
            deletedBrokerEmail: brokerUser.email,
            deletedBrokerName: brokerUser.name,
            deletedBrokerReferralCode: brokerProfile.referralCode,
            reason,
            performedBy: adminId,
          },
        },
      });
    });

    // Invalidate permission cache
    invalidateUserPermissionCache(brokerUser.id);

    return NextResponse.json({
      success: true,
      message: "Broker account and profile have been permanently deleted.",
      deletedBroker: {
        id: brokerUser.id,
        email: brokerUser.email,
        name: brokerUser.name,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
