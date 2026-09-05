import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.opportunity.view");

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage") || "";
    const ownerId = searchParams.get("ownerId") || "";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { opportunityCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [opportunities, total, stages] = await Promise.all([
      db.opportunity.findMany({
        where,
        include: {
          lead: { select: { id: true, name: true, companyName: true, email: true } },
          client: { select: { id: true, companyName: true, contactName: true, email: true } },
          owner: { select: { id: true, name: true, email: true } },
          pipelineStage: true,
          _count: { select: { proposals: true, followUps: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      db.opportunity.count({ where }),
      db.pipelineStage.findMany({ orderBy: { order: "asc" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: opportunities,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.opportunity.create");

    const body = await req.json();
    const { name, leadId, clientId, value, currency = "INR", stage = "QUALIFIED", expectedCloseDate, ownerId, description } = body;

    if (!name) throw new ApiError(400, "Opportunity name is required.");

    const oppCount = await db.opportunity.count();
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const opportunityCode = `OPP-${todayStr}-${String(oppCount + 1).padStart(4, "0")}`;

    const pipelineStage = await db.pipelineStage.findUnique({ where: { key: stage } });

    const opportunity = await db.opportunity.create({
      data: {
        opportunityCode,
        name: name.trim(),
        leadId: leadId || null,
        clientId: clientId || null,
        value: Number(value) || 0,
        currency,
        stage,
        stageId: pipelineStage?.id || null,
        probability: pipelineStage?.probability || 20,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        ownerId: ownerId || actor.id,
        description: description || null,
      },
      include: {
        lead: { select: { id: true, name: true, companyName: true } },
        client: { select: { id: true, companyName: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        opportunityId: opportunity.id,
        leadId: leadId || null,
        clientId: clientId || null,
        actorId: actor.id,
        type: "OPPORTUNITY_CREATED",
        title: `Opportunity ${opportunity.opportunityCode} created`,
        notes: `Value: ₹${opportunity.value}, Stage: ${opportunity.stage}`,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: "CRM_OPPORTUNITY_CREATED",
        resource: `Opportunity:${opportunity.id}`,
        details: { opportunityCode, name, value },
      },
    });

    return NextResponse.json({ success: true, data: opportunity }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
