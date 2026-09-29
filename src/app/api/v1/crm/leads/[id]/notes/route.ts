import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  visibility: z.enum(["INTERNAL", "PARTNER_VISIBLE"]).default("INTERNAL"),
});

export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const actor = await requirePermission(userId, "crm.lead.update");

    const lead = await db.lead.findUnique({
      where: { id },
    });

    if (!lead) throw new ApiError(404, "Lead not found.");

    const body = await req.json().catch(() => ({}));
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const { content, visibility } = parsed.data;

    const note = await db.leadNote.create({
      data: {
        leadId: id,
        authorId: actor.id,
        content,
        visibility,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        leadId: id,
        actorId: actor.id,
        type: "NOTE_ADDED",
        title: "Internal qualification note added",
        notes: "A new note was added to the lead.",
      },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "crm.lead.view");

    const notes = await db.leadNote.findMany({
      where: { leadId: id },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return handleApiError(error);
  }
}
