import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.followup.update");

    const followUp = await db.followUp.findUnique({ where: { id } });
    if (!followUp) throw new ApiError(404, "Follow-up not found.");

    const body = await req.json().catch(() => ({}));
    const { completionNotes } = body;

    const updated = await db.followUp.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        ...(completionNotes && { notes: followUp.notes ? `${followUp.notes}\n[Completed Notes]: ${completionNotes}` : completionNotes }),
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        leadId: followUp.leadId,
        opportunityId: followUp.opportunityId,
        clientId: followUp.clientId,
        actorId: actor.id,
        type: "FOLLOWUP_COMPLETED",
        title: `Follow-up completed (${followUp.type})`,
        notes: completionNotes || "Marked completed.",
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
