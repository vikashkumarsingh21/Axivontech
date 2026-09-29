import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "REVISION_REQUIRED", "INFORMATION_REQUIRED", "ACCEPTED"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    
    // Require explicit permission (Admin or Technical)
    const actor = await requirePermission(userId, "crm.project.review");

    const project = await db.partnerProject.findUnique({
      where: { id },
      include: {
        brokerProfile: { select: { userId: true } },
      }
    });

    if (!project) throw new ApiError(404, "Project not found.");

    const body = await req.json().catch(() => ({}));
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { status, notes } = parsed.data;

    // Build the admin notes by appending new notes internally
    let newAdminNotes = project.adminNotes;
    if (notes) {
       const timestamp = new Date().toISOString();
       newAdminNotes = `${newAdminNotes ? newAdminNotes + "\n\n" : ""}--- [${timestamp}] ${actor.name || 'Admin'} ---\n${notes}`;
    }

    const updated = await db.partnerProject.update({
      where: { id },
      data: {
        status,
        adminNotes: newAdminNotes,
      },
    });

    // Record Activity (Audit Log)
    await db.activity.create({
      data: {
        actorId: actor.id,
        action: status,
        entityType: "PARTNER_PROJECT",
        entityId: project.id,
        summary: `Project review status changed to ${status}`,
        // Do NOT expose internal notes to the summary string
      }
    });

    // Notify Partner depending on status
    if (status === "REVISION_REQUIRED" || status === "INFORMATION_REQUIRED") {
      await db.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: "Action Required: Project Onboarding",
          message: `Your project ${project.projectCode} requires ${status === "REVISION_REQUIRED" ? "revisions" : "more information"}. Please review and update.`,
          link: `/broker/projects/${project.id}/onboarding`,
        }
      });
    } else if (status === "ACCEPTED") {
      await db.notification.create({
        data: {
          userId: project.brokerProfile.userId,
          type: "SYSTEM",
          title: "Project Accepted",
          message: `Your project ${project.projectCode} has been accepted. The final pricing is being prepared.`,
          link: `/broker/projects/${project.id}`,
        }
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
