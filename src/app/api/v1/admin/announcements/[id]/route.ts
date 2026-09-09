import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED", "EXPIRED"]).optional(),
  audienceType: z.enum(["ALL", "ROLE", "DEPARTMENT", "PROJECT", "USERS"]).optional(),
  audienceScope: z.string().nullable().optional(),
  publishAt: z.string().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "announcement.view");

    const { id } = await params;
    const announcement = await db.announcement.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!announcement) throw new ApiError(404, "Announcement not found");

    return NextResponse.json({ data: announcement });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "announcement.create");

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateAnnouncementSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Announcement not found");

    const updateData: any = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
    if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.audienceType !== undefined) updateData.audienceType = parsed.data.audienceType;
    if (parsed.data.audienceScope !== undefined) updateData.audienceScope = parsed.data.audienceScope;
    if (parsed.data.publishAt !== undefined) updateData.publishAt = new Date(parsed.data.publishAt);
    if (parsed.data.expiresAt !== undefined) {
      updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }

    const updated = await db.announcement.update({
      where: { id },
      data: updateData,
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "ANNOUNCEMENT_UPDATED",
        resource: "Announcement",
        details: { announcementId: id, changes: updateData },
      },
    });

    // If transitioned to PUBLISHED, emit event
    if (existing.status !== "PUBLISHED" && updated.status === "PUBLISHED") {
      const { EventBus } = await import("@/lib/events/bus").catch(() => ({ EventBus: null }));
      if (EventBus) {
        EventBus.emit({
          eventType: "ANNOUNCEMENT_PUBLISHED",
          actorId: userId,
          entityType: "ANNOUNCEMENT",
          entityId: updated.id,
          title: "Announcement Published",
          message: updated.title,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "announcement.archive");

    const { id } = await params;
    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Announcement not found");

    await db.announcement.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId,
        action: "ANNOUNCEMENT_DELETED",
        resource: "Announcement",
        details: { announcementId: id, title: existing.title },
      },
    });

    return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
