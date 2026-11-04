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
      let emailTemplateKey = "PARTNER_APPLICATION_STATUS_UPDATE";
      if (newStatus === "APPROVED") {
        emailTemplateKey = "PARTNER_APPLICATION_APPROVED";
      } else if (newStatus === "REJECTED") {
        emailTemplateKey = "PARTNER_APPLICATION_REJECTED";
      }

      await JobRunner.enqueue("SEND_EMAIL", {
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
      });
    } catch (statusEmailErr) {
      console.warn("[Partner Status API] Email enqueue warning:", statusEmailErr);
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
