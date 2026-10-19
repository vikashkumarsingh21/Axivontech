import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { parseDocument, validateUploadFile } from "@/lib/chatbot/document-parser";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "COMPANY";
    const status = (formData.get("status") as string) || "DRAFT";
    const previewOnly = formData.get("preview") === "true";

    if (!file) {
      throw new ApiError(400, "No file uploaded. Please select a valid document.");
    }

    const validation = validateUploadFile({ name: file.name, size: file.size });
    if (!validation.valid) {
      throw new ApiError(400, validation.error || "Invalid file.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parseResult = await parseDocument(file.name, buffer, category);
    if (!parseResult.success || !parseResult.data) {
      throw new ApiError(422, parseResult.error || "Failed to extract readable text from document.");
    }

    const { title, content, chunks, tags, metadata } = parseResult.data;

    // If admin requested preview only, return extracted text without database persistence
    if (previewOnly) {
      return NextResponse.json({
        success: true,
        preview: true,
        data: {
          title,
          category,
          content,
          chunks,
          tags,
          metadata,
        },
      });
    }

    // Persist as a KnowledgeDocument in the database
    const document = await db.knowledgeDocument.create({
      data: {
        title,
        category,
        content,
        sourceType: "DOCUMENT",
        sourceReference: file.name,
        tags,
        status: ["DRAFT", "REVIEW", "PUBLISHED"].includes(status) ? status : "DRAFT",
        version: 1,
        createdById: userId || null,
        updatedById: userId || null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Document '${file.name}' processed successfully with ${chunks.length} chunks.`,
        data: document,
        metadata,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
