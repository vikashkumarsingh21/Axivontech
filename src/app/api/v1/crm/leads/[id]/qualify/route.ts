import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.lead.update");

    const body = await req.json();
    const { qualificationStatus, budget, timeline, businessNeed, decisionMakerKnown, qualificationNotes } = body;

    if (!["QUALIFIED", "UNQUALIFIED", "IN_PROGRESS"].includes(qualificationStatus)) {
      throw new ApiError(400, "Invalid qualification status. Must be QUALIFIED, UNQUALIFIED, or IN_PROGRESS.");
    }

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) throw new ApiError(404, "Lead not found.");

    const newStatus = qualificationStatus === "QUALIFIED" ? "QUALIFIED" : qualificationStatus === "UNQUALIFIED" ? "UNQUALIFIED" : lead.status;

    const updated = await db.lead.update({
      where: { id },
      data: {
        qualificationStatus,
        status: newStatus,
        ...(budget !== undefined && { budget: budget ? Number(budget) : null }),
        ...(timeline !== undefined && { timeline }),
        ...(businessNeed !== undefined && { businessNeed }),
        ...(decisionMakerKnown !== undefined && { decisionMakerKnown: Boolean(decisionMakerKnown) }),
        ...(qualificationNotes !== undefined && { qualificationNotes }),
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        actorId: actor.id,
        type: "STATUS_CHANGED",
        title: `Lead qualification marked as ${qualificationStatus}`,
        notes: qualificationNotes || `Budget: ${budget || "N/A"}, Timeline: ${timeline || "N/A"}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_LEAD_QUALIFIED",
        resource: `Lead:${id}`,
        details: { qualificationStatus, budget, timeline },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
