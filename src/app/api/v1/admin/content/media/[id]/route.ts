import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const asset = await db.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const body = await req.json();
    const existing = await db.mediaAsset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    const { altText, caption, folder } = body;

    const updated = await db.mediaAsset.update({
      where: { id },
      data: {
        ...(altText !== undefined && { altText: altText?.trim() || null }),
        ...(caption !== undefined && { caption: caption?.trim() || null }),
        ...(folder !== undefined && { folder: folder?.trim().toLowerCase() }),
      },
    });

    return NextResponse.json({ asset: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const existing = await db.mediaAsset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    await db.mediaAsset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Media asset deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
