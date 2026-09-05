import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.client.view");

    const client = await db.crmClient.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        contacts: true,
        leads: { orderBy: { createdAt: "desc" } },
        opportunities: {
          include: { pipelineStage: true },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          include: { actor: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
        followUps: {
          include: { assignedTo: { select: { id: true, name: true, email: true } } },
          orderBy: { dueAt: "asc" },
        },
      },
    });

    if (!client) throw new ApiError(404, "Client not found.");

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.client.update");

    const client = await db.crmClient.findUnique({ where: { id } });
    if (!client) throw new ApiError(404, "Client not found.");

    const body = await req.json();
    const { companyName, contactName, email, phone, website, industry, status, ownerId } = body;

    const updated = await db.crmClient.update({
      where: { id },
      data: {
        ...(companyName && { companyName: companyName.trim() }),
        ...(contactName && { contactName: contactName.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(industry !== undefined && { industry }),
        ...(status && { status }),
        ...(ownerId && { ownerId }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_CLIENT_UPDATED",
        resource: `Client:${id}`,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
