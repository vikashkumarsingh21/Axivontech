import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { JobRunner } from "@/lib/jobs/runner";

const meetingSchema = z.object({
  meetingDate: z.string().datetime({ message: "Invalid meeting date" }),
  durationMinutes: z.number().int().min(15).max(480).default(30),
  meetingType: z.enum(["ONLINE", "IN_PERSON", "PHONE"]).default("ONLINE"),
  locationOrLink: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.review");

    const { id } = await params;
    const body = await req.json();
    const data = meetingSchema.parse(body);

    const application = await db.businessPartnerApplication.findUnique({
      where: { id },
    });
    if (!application) throw new ApiError(404, "Application not found");

    if (["APPROVED", "REJECTED"].includes(application.status)) {
      throw new ApiError(400, "Cannot schedule a meeting on a closed application");
    }

    const meeting = await db.$transaction(async (tx) => {
      const m = await tx.applicationMeeting.create({
        data: {
          applicationId: id,
          meetingDate: new Date(data.meetingDate),
          durationMinutes: data.durationMinutes,
          meetingType: data.meetingType,
          locationOrLink: data.locationOrLink,
          notes: data.notes,
          status: "SCHEDULED",
          createdById: userId,
        },
      });

      // Move application status to MEETING_SCHEDULED if it's not already
      if (application.status !== "MEETING_SCHEDULED") {
        await tx.applicationStatusHistory.create({
          data: {
            applicationId: id,
            previousStatus: application.status,
            newStatus: "MEETING_SCHEDULED",
            reason: "Meeting scheduled",
            changedById: userId,
          },
        });
        await tx.businessPartnerApplication.update({
          where: { id },
          data: { status: "MEETING_SCHEDULED", reviewedById: userId },
        });
      }

      return m;
    });

    // Enqueue meeting email
    await JobRunner.enqueue("SEND_EMAIL", {
      to: application.email,
      templateKey: "PARTNER_APPLICATION_MEETING",
      variables: {
        name: application.fullName,
        applicationId: application.applicationId,
        meetingDate: new Date(data.meetingDate).toLocaleString(),
        meetingType: data.meetingType,
        locationOrLink: data.locationOrLink || "TBD",
      },
    });

    return NextResponse.json(
      { message: "Meeting scheduled successfully", meeting },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

