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
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const existing = await db.mediaAsset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    // Check for references across published content models if not forced
    if (!force) {
      const [articlesUsing, postersUsing, projectsUsing] = await Promise.all([
        db.websiteArticle.findMany({
          where: { featuredImage: existing.url },
          select: { title: true, slug: true },
          take: 3,
        }),
        db.loginPagePoster.findMany({
          where: { imageUrl: existing.url },
          select: { title: true },
          take: 3,
        }),
        db.portfolioProject.findMany({
          where: {
            OR: [
              { heroImage: existing.url },
              { thumbnail: existing.url },
            ],
          },
          select: { title: true, slug: true },
          take: 3,
        }),
      ]);

      const references = [
        ...articlesUsing.map((a) => `Article: "${a.title}"`),
        ...postersUsing.map((p) => `Login Poster: "${p.title}"`),
        ...projectsUsing.map((p) => `Project: "${p.title}"`),
      ];

      if (references.length > 0) {
        return NextResponse.json(
          {
            error: "ASSET_IN_USE",
            message: `This asset is referenced by active content (${references.join(", ")}). Deleting it may break page layouts. Pass force=true to delete anyway.`,
            references,
          },
          { status: 409 }
        );
      }
    }

    await db.mediaAsset.delete({
      where: { id },
    });

    // Safely attempt file removal if local upload
    if (existing.url.startsWith("/uploads/media/")) {
      try {
        const { unlink } = await import("fs/promises");
        const path = await import("path");
        const filePath = path.join(process.cwd(), "public", existing.url);
        await unlink(filePath).catch(() => null);
      } catch {
        // file unlink ignored
      }
    }

    return NextResponse.json({ success: true, message: "Media asset deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
