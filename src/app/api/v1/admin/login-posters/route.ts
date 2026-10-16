import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

function parseDateOrNull(val: unknown): Date | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const posters = await db.loginPagePoster.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    const stats = {
      total: posters.length,
      active: posters.filter((p) => p.status === "ACTIVE").length,
      draft: posters.filter((p) => p.status === "DRAFT").length,
      scheduled: posters.filter((p) => p.status === "SCHEDULED").length,
      inactive: posters.filter((p) => p.status === "INACTIVE").length,
    };

    return NextResponse.json({ posters, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await requirePermission(userId, "admin:access");

    const body = await req.json().catch(() => null);
    if (!body) {
      throw new ApiError(400, "Invalid JSON body provided.");
    }

    const {
      title,
      subtitle,
      imageUrl,
      altText,
      ctaLabel,
      ctaUrl,
      displayOrder,
      status,
      startsAt,
      endsAt,
      internalNotes,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required and must not be empty." },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return NextResponse.json(
        { error: "Image URL is required. Please upload an image or provide a valid URL." },
        { status: 400 }
      );
    }

    const validStatuses = ["DRAFT", "ACTIVE", "SCHEDULED", "INACTIVE"];
    const resolvedStatus = validStatuses.includes(status) ? status : "DRAFT";

    const parsedOrder =
      typeof displayOrder === "number"
        ? displayOrder
        : parseInt(String(displayOrder || "0"), 10) || 0;

    const poster = await db.loginPagePoster.create({
      data: {
        title: title.trim(),
        subtitle: subtitle && typeof subtitle === "string" ? subtitle.trim() || null : null,
        imageUrl: imageUrl.trim(),
        altText: altText && typeof altText === "string" ? altText.trim() || null : null,
        ctaLabel: ctaLabel && typeof ctaLabel === "string" ? ctaLabel.trim() || null : null,
        ctaUrl: ctaUrl && typeof ctaUrl === "string" ? ctaUrl.trim() || null : null,
        displayOrder: parsedOrder,
        status: resolvedStatus,
        startsAt: parseDateOrNull(startsAt),
        endsAt: parseDateOrNull(endsAt),
        internalNotes:
          internalNotes && typeof internalNotes === "string" ? internalNotes.trim() || null : null,
        createdById: user.id,
      },
    });

    return NextResponse.json({ success: true, poster }, { status: 201 });
  } catch (error: any) {
    console.error("[Create Login Poster Error]:", error);
    return handleApiError(error);
  }
}
