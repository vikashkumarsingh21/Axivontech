import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.followup.view");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const assignedToId = searchParams.get("assignedToId") || "";
    const leadId = searchParams.get("leadId") || "";
    const opportunityId = searchParams.get("opportunityId") || "";

    const where: any = {};
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (leadId) where.leadId = leadId;
    if (opportunityId) where.opportunityId = opportunityId;

    // Check overdue items and update status dynamically
    const now = new Date();

    const followUps = await db.followUp.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
        opportunity: { select: { id: true, name: true, opportunityCode: true, value: true } },
        client: { select: { id: true, companyName: true, contactName: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 100,
    });

    // Update status to OVERDUE if past due date and UPCOMING
    const updated = followUps.map((f) => {
      if (f.status === "UPCOMING" && new Date(f.dueAt) < now) {
        return { ...f, status: "OVERDUE" };
      }
      return f;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.followup.create");

    const body = await req.json();
    const { leadId, opportunityId, clientId, assignedToId, dueAt, type = "CALL", notes } = body;

    if (!dueAt) throw new ApiError(400, "dueAt Date and Time is required.");

    const followUp = await db.followUp.create({
      data: {
        leadId: leadId || null,
        opportunityId: opportunityId || null,
        clientId: clientId || null,
        assignedToId: assignedToId || actor.id,
        dueAt: new Date(dueAt),
        type,
        notes: notes || null,
        status: new Date(dueAt) < new Date() ? "OVERDUE" : "UPCOMING",
      },
      include: {
        lead: { select: { id: true, name: true, companyName: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Activity log
    await db.leadActivity.create({
      data: {
        leadId: leadId || null,
        opportunityId: opportunityId || null,
        clientId: clientId || null,
        actorId: actor.id,
        type: "FOLLOWUP_CREATED",
        title: `Follow-up scheduled (${type}) for ${new Date(dueAt).toLocaleString()}`,
        notes: notes || null,
      },
    });

    // Send notification if assigned to another user
    const targetId = assignedToId || actor.id;
    if (targetId !== actor.id) {
      await db.notification.create({
        data: {
          userId: targetId,
          type: "SYSTEM",
          title: `Follow-Up Assigned: ${type}`,
          message: `Scheduled for ${new Date(dueAt).toLocaleDateString()}: ${notes || "CRM Follow-up"}`,
          link: `/admin/crm/follow-ups`,
        },
      });
    }

    return NextResponse.json({ success: true, data: followUp }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
