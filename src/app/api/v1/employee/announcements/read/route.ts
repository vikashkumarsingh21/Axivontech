import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

const markReadSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = markReadSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid payload",
        "VALIDATION_ERROR"
      );
    }

    const { announcementId } = parsed.data;

    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new ApiError(404, "Announcement not found");
    }

    const readRecord = await db.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId,
          userId: user.id,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        announcementId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      readRecord,
      message: "Announcement marked as read",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
