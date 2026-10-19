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

    const policy = await db.legalPolicy.findUnique({
      where: { id },
      include: {
        publishedBy: {
          select: { id: true, name: true, email: true },
        },
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, policy });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const existing = await db.legalPolicy.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      summary,
      content,
      version,
      status,
      category,
      changeLog,
      requiresApproval,
      missingDetails,
      bypassGateAcknowledgement,
    } = body;

    // Publication gate check
    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      const activeMissing = missingDetails !== undefined ? missingDetails : existing.missingDetails;
      if (activeMissing && activeMissing.length > 0 && !bypassGateAcknowledgement) {
        return NextResponse.json(
          {
            error: "PUBLICATION_GATE_TRIGGERED",
            message: `This policy contains unverified corporate details (${activeMissing.join(", ")}). You must explicitly acknowledge owner approval to publish.`,
            missingDetails: activeMissing,
          },
          { status: 422 }
        );
      }
    }

    // Snapshot into PolicyVersion if content or version is changing and policy is published
    if (
      existing.status === "PUBLISHED" &&
      content &&
      content !== existing.content
    ) {
      try {
        await db.policyVersion.create({
          data: {
            policyId: existing.id,
            version: existing.version,
            title: existing.title,
            content: existing.content,
            summary: existing.summary,
            changeLog: changeLog || "Automatic snapshot before revision update.",
            publishedAt: existing.publishedAt || new Date(),
            publishedById: userId,
          },
        });
      } catch {
        // Safe ignore
      }
    }

    const updated = await db.legalPolicy.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(summary !== undefined && { summary: summary.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(version !== undefined && { version }),
        ...(status !== undefined && { status }),
        ...(category !== undefined && { category }),
        ...(requiresApproval !== undefined && { requiresApproval: Boolean(requiresApproval) }),
        ...(missingDetails !== undefined && { missingDetails }),
        ...(status === "PUBLISHED" && {
          publishedAt: new Date(),
          publishedById: userId,
        }),
        lastReviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, policy: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const existing = await db.legalPolicy.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    await db.legalPolicy.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Policy deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
