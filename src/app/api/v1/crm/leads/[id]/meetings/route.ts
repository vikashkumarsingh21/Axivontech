import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const createMeetingSchema = z.object({
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  type: z.enum(["VIRTUAL", "IN_PERSON", "PHONE"]).default("VIRTUAL"),
  participants: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  nextAction: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
  notes: z.string().optional().nullable(),
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
    const parsed = createMeetingSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const data = parsed.data;

    // Execute in transaction: Create meeting, update lead status if needed
    const result = await db.$transaction(async (tx) => {
      const meeting = await tx.leadMeeting.create({
        data: {
          leadId: id,
          createdById: actor.id,
          scheduledAt: new Date(data.scheduledAt),
          type: data.type,
          participants: data.participants,
          outcome: data.outcome,
          nextAction: data.nextAction,
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
          notes: data.notes,
        },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      });

      // Update lead status to MEETING if it was NEW or CONTACTED
      let updatedLead = lead;
      if (lead.status === "NEW" || lead.status === "CONTACTED") {
        updatedLead = await tx.lead.update({
          where: { id },
          data: { status: "MEETING" },
        });
      }
      
      // Update next follow-up date if provided
      if (data.followUpDate) {
         updatedLead = await tx.lead.update({
            where: { id },
            data: { nextFollowUpAt: new Date(data.followUpDate) },
         });
      }

      // Record activity
      await tx.leadActivity.create({
        data: {
          leadId: id,
          actorId: actor.id,
          type: "MEETING_RECORDED",
          title: `Meeting recorded for ${data.scheduledAt.substring(0, 10)}`,
          notes: data.outcome ? `Outcome: ${data.outcome}` : "Meeting scheduled/logged.",
        },
      });

      return { meeting, lead: updatedLead };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
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

    const meetings = await db.leadMeeting.findMany({
      where: { leadId: id },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    return handleApiError(error);
  }
}
