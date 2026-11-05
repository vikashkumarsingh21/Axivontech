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

    // Dispatch Partner Meeting Notification (Customer + Internal)
    try {
      const { sendTransactionalEmail } = await import("@/lib/email/service");
      const { getEmailConfig } = await import("@/lib/email/config");
      const emailConfig = getEmailConfig();
      const { formatKolkataDateTime } = await import("@/lib/email/templates/base-layout");
      const formattedDate = formatKolkataDateTime(new Date(data.meetingDate));

      // 1. Customer Notification
      await sendTransactionalEmail({
        to: application.email,
        templateKey: "PARTNER_MEETING_SCHEDULED",
        eventKey: `meeting:${meeting.id}`,
        variables: {
          name: application.fullName,
          applicationId: application.applicationId,
          meetingDate: formattedDate,
          meetingType: data.meetingType,
          locationOrLink: data.locationOrLink || "Link to be provided prior to session",
          instructions: data.notes || "Please have your business background and regional enterprise contacts ready for review.",
        },
        metadata: {
          meetingId: meeting.id,
          applicationId: application.applicationId,
          type: "PARTNER_MEETING_SCHEDULED",
        },
      });

      // 2. Internal Company Notification
      await sendTransactionalEmail({
        to: emailConfig.internalNotificationEmail,
        templateKey: "GENERIC_NOTIFICATION",
        eventKey: `meeting_internal:${meeting.id}`,
        variables: {
          title: "Partner Evaluation Meeting Scheduled",
          message: `A partner evaluation meeting has been scheduled with ${application.fullName} (${application.applicationId}) for ${formattedDate} (${data.meetingType}).`,
          link: `${process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in"}/admin/business-partners/applications/${application.id}`,
        },
        metadata: {
          meetingId: meeting.id,
          applicationId: application.applicationId,
          type: "INTERNAL_MEETING_SCHEDULED",
        },
      });
    } catch (meetingEmailErr) {
      console.warn("[Meeting API] Meeting email dispatch warning:", meetingEmailErr);
    }

    return NextResponse.json(
      { message: "Meeting scheduled successfully", meeting },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

