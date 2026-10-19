import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const altText = (formData.get("altText") as string) || null;
    const caption = (formData.get("caption") as string) || null;

    if (!file) {
      throw new ApiError(400, "No file provided. Please attach an image or supported document.");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      throw new ApiError(
        400,
        `Invalid file type (${file.type}). Allowed formats: JPEG, PNG, WebP, SVG, GIF, and PDF.`
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ApiError(400, "File exceeds the 10MB maximum upload limit.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extension resolution
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
    };

    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const ext = extMap[file.type.toLowerCase()] || path.extname(file.name) || ".jpg";
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${sanitizedBase}-${uniqueSuffix}${ext}`;

    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "general";
    const uploadDir = path.join(process.cwd(), "public", "uploads", "media", cleanFolder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/media/${cleanFolder}/${filename}`;

    const asset = await db.mediaAsset.create({
      data: {
        filename,
        originalName: file.name,
        url: publicUrl,
        fileType: file.type.toLowerCase(),
        fileSize: file.size,
        folder: cleanFolder,
        altText: altText?.trim() || file.name,
        caption: caption?.trim() || null,
        createdById: userId,
      },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
