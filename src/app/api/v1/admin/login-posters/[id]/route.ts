import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const poster = await db.loginPagePoster.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!poster) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 });
    }

    return NextResponse.json({ poster });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
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

    const existing = await db.loginPagePoster.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 });
    }

    const updated = await db.loginPagePoster.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(subtitle !== undefined && { subtitle: subtitle?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(altText !== undefined && { altText: altText?.trim() || null }),
        ...(ctaLabel !== undefined && { ctaLabel: ctaLabel?.trim() || null }),
        ...(ctaUrl !== undefined && { ctaUrl: ctaUrl?.trim() || null }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(status !== undefined && { status }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
        ...(internalNotes !== undefined && { internalNotes: internalNotes?.trim() || null }),
      },
    });

    return NextResponse.json({ poster: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const existing = await db.loginPagePoster.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 });
    }

    await db.loginPagePoster.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
