import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const AnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional().default("NORMAL"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional().default("PUBLISHED"),
  audienceType: z.enum(["ALL", "ROLE", "DEPARTMENT", "PROJECT", "SPECIFIC_USERS"]).optional().default("ALL"),
  audienceScope: z.string().optional(),
  publishAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "announcement.view");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: any = {};
    if (status) where.status = status;

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      db.announcement.count({ where }),
    ]);

    return NextResponse.json({
      data: announcements,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "announcement.create");

    const body = await req.json();
    const parsed = AnnouncementSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const { title, content, priority, status, audienceType, audienceScope, publishAt, expiresAt } = parsed.data;

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        priority,
        status,
        audienceType,
        audienceScope: audienceScope || null,
        publishAt: publishAt ? new Date(publishAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdById: userId,
      },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "ANNOUNCEMENT_CREATED",
        resource: "Announcement",
        details: { announcementId: announcement.id, title, status },
      },
    });

    // Emit event if immediately published
    if (status === "PUBLISHED") {
      const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
      if (EventBus) {
        EventBus.emit({
          eventType: "ANNOUNCEMENT_PUBLISHED",
          actorId: userId,
          entityType: "ANNOUNCEMENT",
          entityId: announcement.id,
          title: "New Announcement Published",
          message: title,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
