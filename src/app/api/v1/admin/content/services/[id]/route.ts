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

    const service = await db.websiteService.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
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
    const existing = await db.websiteService.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const {
      title,
      slug,
      badge,
      shortDescription,
      heroDescription,
      icon,
      displayOrder,
      status,
      benefits,
      process,
      technologies,
      faqs,
      cta,
      metaTitle,
      metaDescription,
    } = body;

    const updated = await db.websiteService.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug.trim() }),
        ...(badge !== undefined && { badge: badge?.trim() || null }),
        ...(shortDescription !== undefined && { shortDescription: shortDescription.trim() }),
        ...(heroDescription !== undefined && { heroDescription: heroDescription.trim() }),
        ...(icon !== undefined && { icon }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(status !== undefined && { status }),
        ...(benefits !== undefined && { benefits }),
        ...(process !== undefined && { process }),
        ...(technologies !== undefined && { technologies }),
        ...(faqs !== undefined && { faqs }),
        ...(cta !== undefined && { cta }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle?.trim() || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription?.trim() || null }),
      },
    });

    try {
      revalidatePath("/services");
      revalidatePath(`/services/${updated.slug}`);
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ service: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const existing = await db.websiteService.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.websiteService.delete({
      where: { id },
    });

    try {
      revalidatePath("/services");
      revalidatePath("/sitemap.xml");
    } catch {
      // safe
    }

    return NextResponse.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
