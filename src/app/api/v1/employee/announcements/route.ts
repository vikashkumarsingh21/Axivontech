import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

const markReadSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required"),
  action: z.enum(["MARK_READ"]).optional().default("MARK_READ"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const search = searchParams.get("search")?.trim();

    const now = new Date();

    // Fetch published announcements that have not expired
    const allPublished = await db.announcement.findMany({
      where: {
        status: "PUBLISHED",
        publishAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ publishAt: "desc" }],
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        reads: {
          where: { userId: user.id },
          select: { readAt: true },
        },
      },
    });

    // Filter by audience targeting
    const userRoleNames = user.userRoles.map((ur) => ur.role.name);
    const userDepartment = user.department;

    let targeted = allPublished.filter((ann) => {
      if (ann.audienceType === "ALL") return true;
      if (ann.audienceType === "DEPARTMENT" && ann.audienceScope) {
        return (
          userDepartment &&
          ann.audienceScope.toLowerCase() === userDepartment.toLowerCase()
        );
      }
      if (ann.audienceType === "ROLE" && ann.audienceScope) {
        return userRoleNames.includes(ann.audienceScope);
      }
      if (ann.audienceType === "USERS" && ann.audienceScope) {
        return ann.audienceScope
          .split(",")
          .map((s) => s.trim())
          .includes(user.id);
      }
      return true;
    });

    if (priority && priority !== "ALL") {
      targeted = targeted.filter((a) => a.priority === priority);
    }

    if (search) {
      const q = search.toLowerCase();
      targeted = targeted.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    const announcements = targeted.map((ann) => {
      const isRead = ann.reads.length > 0;
      return {
        id: ann.id,
        title: ann.title,
        content: ann.content,
        priority: ann.priority,
        status: ann.status,
        audienceType: ann.audienceType,
        publishAt: ann.publishAt,
        publishedAt: ann.publishedAt,
        expiresAt: ann.expiresAt,
        createdBy: ann.createdBy,
        createdAt: ann.createdAt,
        updatedAt: ann.updatedAt,
        isRead,
        readAt: ann.reads[0]?.readAt || null,
      };
    });

    const finalAnnouncements = unreadOnly
      ? announcements.filter((a) => !a.isRead)
      : announcements;

    const unreadCount = announcements.filter((a) => !a.isRead).length;

    return NextResponse.json({
      success: true,
      announcements: finalAnnouncements,
      data: finalAnnouncements,
      meta: {
        total: announcements.length,
        unreadCount,
        readCount: announcements.length - unreadCount,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}

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
