import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.proposal.view");

    const proposals = await db.proposal.findMany({
      include: {
        opportunity: {
          include: {
            lead: { select: { id: true, name: true, companyName: true } },
            client: { select: { id: true, companyName: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: proposals });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.proposal.create");

    const body = await req.json();
    const { opportunityId, title, amount, currency = "INR", validUntil, documentReference } = body;

    if (!opportunityId || !title || !amount) {
      throw new ApiError(400, "opportunityId, title, and amount are required.");
    }

    const opportunity = await db.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) throw new ApiError(404, "Opportunity not found.");

    const propCount = await db.proposal.count();
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const proposalNumber = `PROP-${todayStr}-${String(propCount + 1).padStart(4, "0")}`;

    const proposal = await db.proposal.create({
      data: {
        proposalNumber,
        opportunityId,
        title: title.trim(),
        amount: Number(amount),
        currency,
        status: "DRAFT",
        validUntil: validUntil ? new Date(validUntil) : null,
        documentReference: documentReference || null,
        createdById: actor.id,
      },
      include: {
        opportunity: { select: { id: true, name: true, opportunityCode: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        opportunityId,
        actorId: actor.id,
        type: "NOTE_ADDED",
        title: `Proposal Draft Created: ${proposalNumber}`,
        notes: `Amount: ₹${proposal.amount}, Title: ${proposal.title}`,
      },
    });

    return NextResponse.json({ success: true, data: proposal }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
