import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

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
    await requirePermission(userId, "admin:access");

    const body = await req.json();
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

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and imageUrl are required" },
        { status: 400 }
      );
    }

    const poster = await db.loginPagePoster.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        imageUrl: imageUrl.trim(),
        altText: altText?.trim() || null,
        ctaLabel: ctaLabel?.trim() || null,
        ctaUrl: ctaUrl?.trim() || null,
        displayOrder: displayOrder ?? 0,
        status: status || "DRAFT",
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        internalNotes: internalNotes?.trim() || null,
        createdById: userId,
      },
    });

    return NextResponse.json({ poster }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
