import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.lead.view");

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, department: true } },
        convertedClient: true,
        activities: {
          include: { actor: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
        followUps: {
          include: { assignedTo: { select: { id: true, name: true, email: true } } },
          orderBy: { dueAt: "asc" },
        },
        opportunities: {
          include: { pipelineStage: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "crm.lead.update");

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) throw new ApiError(404, "Lead not found");

    const body = await req.json();
    const { name, email, phone, companyName, website, serviceInterest, message, status, nextFollowUpAt } = body;

    const oldStatus = lead.status;
    
    // Status transition validation
    if (status && status !== oldStatus) {
      if (oldStatus === "CONVERTED") {
        throw new ApiError(400, "Cannot change status of a converted lead.");
      }
      
      const validStatuses = ["NEW", "CONTACTED", "MEETING", "QUALIFIED", "NOT_QUALIFIED", "CONVERTED", "LOST", "NURTURE"];
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status: ${status}`);
      }
      
      // Converted status must go through the dedicated /convert endpoint
      if (status === "CONVERTED") {
         throw new ApiError(400, "Use the /convert endpoint to convert a lead.");
      }
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(companyName !== undefined && { companyName }),
        ...(website !== undefined && { website }),
        ...(serviceInterest !== undefined && { serviceInterest }),
        ...(message !== undefined && { message }),
        ...(status && { status }),
        ...(nextFollowUpAt !== undefined && { nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null }),
        ...(status && status !== oldStatus && status !== "NEW" ? { lastContactAt: new Date() } : {}),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    // Record activity if status changed
    if (status && status !== oldStatus) {
      await db.leadActivity.create({
        data: {
          leadId: id,
          actorId: user.id,
          type: "STATUS_CHANGED",
          title: `Status changed to ${status}`,
          notes: `Previous status: ${oldStatus}`,
        },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "CRM_LEAD_UPDATED",
        resource: `Lead:${id}`,
        details: { leadCode: updatedLead.leadCode, updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    return handleApiError(error);
  }
}
