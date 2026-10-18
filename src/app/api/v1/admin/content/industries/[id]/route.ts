import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    const industry = await db.websiteIndustry.findUnique({
      where: { id },
    });

    if (!industry) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    return NextResponse.json({ industry });
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
    const existing = await db.websiteIndustry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    const { title, slug, description, tags, icon, displayOrder, status, relatedService, metaTitle, metaDescription } = body;

    const updated = await db.websiteIndustry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
        ...(icon !== undefined && { icon }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(status !== undefined && { status }),
        ...(relatedService !== undefined && { relatedService: relatedService || null }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle?.trim() || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription?.trim() || null }),
      },
    });

    try {
      revalidatePath("/industries");
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ industry: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const existing = await db.websiteIndustry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    await db.websiteIndustry.delete({
      where: { id },
    });

    try {
      revalidatePath("/industries");
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ success: true, message: "Industry deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
