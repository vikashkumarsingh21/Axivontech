import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { JobRunner } from "@/lib/jobs/runner";

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["MEETING_SCHEDULED", "MORE_INFO_REQUESTED", "ON_HOLD", "APPROVED", "REJECTED"],
  MEETING_SCHEDULED: ["UNDER_REVIEW", "APPROVED", "REJECTED", "ON_HOLD"],
  MORE_INFO_REQUESTED: ["UNDER_REVIEW"],
  ON_HOLD: ["UNDER_REVIEW", "REJECTED"],
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

    return NextResponse.json(application, { status: 200 });
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

    // Enqueue status update email
    await JobRunner.enqueue("SEND_EMAIL", {
      to: updatedApp.email,
      templateKey: "PARTNER_APPLICATION_STATUS_UPDATE",
      variables: {
        name: updatedApp.fullName,
        applicationId: updatedApp.applicationId,
        newStatus,
        reason: reason ?? "N/A",
      },
    });

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
