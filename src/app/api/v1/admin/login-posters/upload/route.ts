import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ApiError(400, "No file uploaded. Please select an image file.");
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!validMimes.includes(file.type)) {
      throw new ApiError(
        400,
        `Invalid file format (${file.type}). Please upload a JPEG, PNG, WebP, GIF, or AVIF image.`
      );
    }

    // Limit size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ApiError(400, "Image file size exceeds the 10MB limit.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/avif": ".avif",
    };
    const ext = extMap[file.type] || path.extname(file.name) || ".png";
    const filename = `poster-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "posters");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/posters/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("[Poster Upload Error]:", error);
    return handleApiError(error);
  }
}
