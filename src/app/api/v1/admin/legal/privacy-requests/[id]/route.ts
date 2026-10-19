import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const record = await db.privacyRequest.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Privacy request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: record });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const { status, resolutionNotes, assignedToId } = body;

    const existing = await db.privacyRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Privacy request not found" }, { status: 404 });
    }

    const updated = await db.privacyRequest.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(resolutionNotes !== undefined && { resolutionNotes }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(status === "FULFILLED" || status === "REJECTED" ? { resolvedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
