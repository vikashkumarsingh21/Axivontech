import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireEmployee } from "@/lib/api/foundation";

const acknowledgeSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireEmployee(req);
    const body = await req.json().catch(() => ({}));

    const parsed = acknowledgeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message || "Invalid payload",
        "VALIDATION_ERROR"
      );
    }

    const { documentId } = parsed.data;

    const doc = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.isArchived) {
      throw new ApiError(404, "Document not found or archived");
    }

    const acknowledgment = await db.documentAcknowledgment.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: user.id,
        },
      },
      update: {
        acknowledgedAt: new Date(),
      },
      create: {
        documentId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      acknowledgment,
      message: `Document "${doc.title}" acknowledged successfully.`,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
