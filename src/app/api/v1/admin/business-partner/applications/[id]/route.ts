import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { JobRunner } from "@/lib/jobs/runner";

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW", "MEETING_SCHEDULED", "MORE_INFO_REQUESTED", "ON_HOLD", "APPROVED", "REJECTED"],
  UNDER_REVIEW: ["MEETING_SCHEDULED", "MORE_INFO_REQUESTED", "ON_HOLD", "APPROVED", "REJECTED"],
  MEETING_SCHEDULED: ["UNDER_REVIEW", "APPROVED", "REJECTED", "ON_HOLD"],
  MORE_INFO_REQUESTED: ["UNDER_REVIEW", "APPROVED", "REJECTED"],
  ON_HOLD: ["UNDER_REVIEW", "APPROVED", "REJECTED"],
  // Terminal states — no further transitions
  APPROVED: [],
  REJECTED: [],
};

const REASON_REQUIRED = new Set(["REJECTED", "ON_HOLD", "MORE_INFO_REQUESTED"]);

const updateStatusSchema = z.object({
  status: z.enum([
    "UNDER_REVIEW",
    "MEETING_SCHEDULED",
    "MORE_INFO_REQUESTED",
    "ON_HOLD",
    "APPROVED",
    "REJECTED",
  ]),
  reason: z.string().max(2000).optional(),
});

const deleteApplicationSchema = z.object({
  reason: z.string().min(5, "Deletion reason must be at least 5 characters"),
  revokePendingInvite: z.boolean().optional().default(false),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.view");

    const { id } = await params;

    const application = await db.businessPartnerApplication.findUnique({
      where: { id },
      include: {
        meetings: {
          orderBy: { createdAt: "desc" },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: {
            changedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Check if a user / broker profile already exists for this applicant's email
    const linkedUser = await db.user.findFirst({
      where: {
        email: { equals: application.email, mode: "insensitive" },
      },
      select: {
        id: true,
        email: true,
        status: true,
        passwordHash: true,
        mustChangePassword: true,
        brokerProfile: {
          select: {
            id: true,
            partnerId: true,
            referralCode: true,
            companyName: true,
            createdAt: true,
          },
        },
      },
    });

    let accountStatus: "NOT_CREATED" | "CREATION_PENDING" | "ACTIVE" | "PASSWORD_CHANGE_REQUIRED" | "DISABLED" = "NOT_CREATED";
    if (!linkedUser || !linkedUser.brokerProfile) {
      accountStatus = "NOT_CREATED";
    } else if (linkedUser.status === "PENDING_ACTIVATION") {
      accountStatus = "CREATION_PENDING";
    } else if (linkedUser.status === "SUSPENDED" || linkedUser.status === "INACTIVE") {
      accountStatus = "DISABLED";
    } else if (linkedUser.status === "ACTIVE" && linkedUser.mustChangePassword) {
      accountStatus = "PASSWORD_CHANGE_REQUIRED";
    } else if (linkedUser.status === "ACTIVE") {
      accountStatus = "ACTIVE";
    }

    const hasUsableLogin = !!(
      linkedUser &&
      linkedUser.passwordHash &&
      linkedUser.brokerProfile &&
      (linkedUser.status === "ACTIVE" || linkedUser.status === "PENDING_ACTIVATION")
    );

    return NextResponse.json(
      {
        ...application,
        accountStatus,
        linkedBroker: linkedUser?.brokerProfile || null,
        linkedUser: linkedUser
          ? {
              id: linkedUser.id,
              email: linkedUser.email,
              status: linkedUser.status,
              mustChangePassword: linkedUser.mustChangePassword,
              partnerId: linkedUser.brokerProfile?.partnerId || null,
              referralCode: linkedUser.brokerProfile?.referralCode || null,
              brokerProfileId: linkedUser.brokerProfile?.id || null,
            }
          : null,
        hasUsableLogin,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.review");

    const { id } = await params;
    const body = await req.json();
    const { status: newStatus, reason } = updateStatusSchema.parse(body);

    const existingApp = await db.businessPartnerApplication.findUnique({
      where: { id },
    });

    if (!existingApp) {
      throw new ApiError(404, "Application not found");
    }

    // Validate transition
    const allowed = VALID_TRANSITIONS[existingApp.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(
        400,
        `Cannot transition from ${existingApp.status} to ${newStatus}`
      );
    }

    // Reason required for certain statuses
    if (REASON_REQUIRED.has(newStatus) && (!reason || reason.trim().length < 5)) {
      throw new ApiError(400, `A reason is required when setting status to ${newStatus}`);
    }

    const updatedApp = await db.$transaction(async (tx) => {
      // Record history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          previousStatus: existingApp.status,
          newStatus,
          reason: reason?.trim() ?? null,
          changedById: userId,
        },
      });

      // Update application
      return tx.businessPartnerApplication.update({
        where: { id },
        data: {
          status: newStatus,
          decisionReason: reason?.trim() ?? existingApp.decisionReason,
          reviewedById: userId,
          reviewedAt: new Date(),
        },
        select: {
          id: true,
          applicationId: true,
          fullName: true,
          email: true,
          status: true,
          updatedAt: true,
        },
      });
    });

    // Dispatch Status-Specific Transactional Notification
    try {
      const { sendTransactionalEmail } = await import("@/lib/email/service");
      const { getEmailConfig } = await import("@/lib/email/config");
      const emailConfig = getEmailConfig();

      let emailTemplateKey = "PARTNER_APPLICATION_STATUS_UPDATE";
      if (newStatus === "APPROVED") {
        emailTemplateKey = "PARTNER_APPLICATION_APPROVED";
      } else if (newStatus === "REJECTED") {
        emailTemplateKey = "PARTNER_APPLICATION_REJECTED";
      }

      // 1. Customer Notification
      await sendTransactionalEmail({
        to: updatedApp.email,
        templateKey: emailTemplateKey,
        eventKey: `bpa_status:${updatedApp.id}:${newStatus}`,
        variables: {
          name: updatedApp.fullName,
          applicationId: updatedApp.applicationId,
          newStatus,
          // If rejected, do not leak raw internal staff notes to candidate
          reason: newStatus === "REJECTED" ? undefined : (reason ?? "N/A"),
        },
        metadata: {
          applicationId: updatedApp.applicationId,
          status: newStatus,
        },
      });

      // 2. If Approved, send internal notification to company
      if (newStatus === "APPROVED") {
        await sendTransactionalEmail({
          to: emailConfig.internalNotificationEmail,
          templateKey: "GENERIC_NOTIFICATION",
          eventKey: `bpa_approved_internal:${updatedApp.applicationId}`,
          variables: {
            title: "Broker Partner Application Approved",
            message: `Partner application ${updatedApp.applicationId} for ${updatedApp.fullName} has been approved by administrator.`,
            link: `${process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in"}/admin/business-partners/applications/${updatedApp.id}`,
          },
          metadata: {
            applicationId: updatedApp.applicationId,
            type: "INTERNAL_PARTNER_APPROVED",
          },
        });
      }
    } catch (statusEmailErr) {
      console.warn("[Partner Status API] Email dispatch warning:", statusEmailErr);
    }

    // Emit AuditLog (existing infrastructure)
    try {
      await db.auditLog.create({
        data: {
          userId,
          action: `BUSINESS_PARTNER_APPLICATION_${newStatus}`,
          resource: `BusinessPartnerApplication:${existingApp.applicationId}`,
          details: {
            previousStatus: existingApp.status,
            newStatus,
            reason: reason ?? null,
            applicationId: existingApp.applicationId,
          },
        },
      });
    } catch {
      // Non-critical — don't fail the action if audit log fails
      console.error("Failed to write audit log for application status change");
    }

    return NextResponse.json(
      { message: "Application status updated successfully", application: updatedApp },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "users:delete");

    const { id } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body might be empty in some HTTP clients
    }
    const { reason, revokePendingInvite } = deleteApplicationSchema.parse(body);

    const application = await db.businessPartnerApplication.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
      },
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    // Check if linked to user by email
    const linkedUser = await db.user.findFirst({
      where: {
        email: { equals: application.email, mode: "insensitive" },
      },
      include: {
        brokerProfile: true,
        userRoles: { include: { role: true } },
      },
    });

    let revokedPendingUser = false;

    // Transactional deletion
    await db.$transaction(async (tx) => {
      // If applicant has an account that has NOT completed activation, and admin explicitly requested to revoke:
      if (
        revokePendingInvite &&
        linkedUser &&
        linkedUser.status === "PENDING_ACTIVATION"
      ) {
        // Double check no business dependencies exist on this pending user
        const leadsCount = await tx.lead.count({ where: { ownerId: linkedUser.id } });
        const projectsCount = linkedUser.brokerProfile
          ? await tx.partnerProject.count({ where: { brokerProfileId: linkedUser.brokerProfile.id } })
          : 0;

        if (leadsCount === 0 && projectsCount === 0) {
          await tx.session.deleteMany({ where: { userId: linkedUser.id } });
          await tx.userRole.deleteMany({ where: { userId: linkedUser.id } });
          if (linkedUser.brokerProfile) {
            await tx.brokerProfile.delete({ where: { id: linkedUser.brokerProfile.id } });
          }
          await tx.user.delete({ where: { id: linkedUser.id } });
          revokedPendingUser = true;
        }
      }

      // Delete the application (cascades ApplicationMeeting & ApplicationStatusHistory)
      await tx.businessPartnerApplication.delete({
        where: { id: application.id },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: "BUSINESS_PARTNER_APPLICATION_DELETED",
          resource: `BusinessPartnerApplication:${application.applicationId}`,
          details: {
            applicationId: application.applicationId,
            applicantName: application.fullName,
            email: application.email,
            status: application.status,
            reason,
            linkedBrokerAccountPreserved: !!linkedUser && !revokedPendingUser,
            linkedBrokerPartnerId: linkedUser?.brokerProfile?.partnerId || null,
            revokedPendingUser,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Application ${application.applicationId} for ${application.fullName} has been permanently deleted.`,
      linkedBrokerPreserved: !!linkedUser && !revokedPendingUser,
      revokedPendingUser,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
