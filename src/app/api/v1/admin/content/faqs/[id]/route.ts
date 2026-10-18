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

    const faq = await db.websiteFaq.findUnique({
      where: { id },
    });

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ faq });
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
    const { question, answer, category, page, displayOrder, status } = body;

    const existing = await db.websiteFaq.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const updated = await db.websiteFaq.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: question.trim() }),
        ...(answer !== undefined && { answer: answer.trim() }),
        ...(category !== undefined && { category }),
        ...(page !== undefined && { page }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(status !== undefined && { status }),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/services");
    } catch {
      // safe
    }

    return NextResponse.json({ faq: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");
    const { id } = await params;

    const existing = await db.websiteFaq.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await db.websiteFaq.delete({
      where: { id },
    });

    try {
      revalidatePath("/");
      revalidatePath("/services");
    } catch {
      // safe
    }

    return NextResponse.json({ success: true, message: "FAQ deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
