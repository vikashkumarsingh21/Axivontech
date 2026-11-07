import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getSessionUser, apiError } from "@/lib/api/foundation";
import { hasProjectLibraryWriteAccess } from "@/lib/project-library/permissions";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;

    if (!hasProjectLibraryWriteAccess(userRole)) {
      return apiError("FORBIDDEN", "Access denied: Write authorization required to upload project assets.", 403);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = (formData.get("projectId") as string)?.trim() || null;
    const assetType = (formData.get("assetType") as string)?.trim() || "GALLERY";
    const title = (formData.get("title") as string)?.trim() || file?.name || "Project Asset";

    if (!file) {
      return apiError("BAD_REQUEST", "No file provided for upload.", 400);
    }

    const mime = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      return apiError(
        "BAD_REQUEST",
        `Unsupported file type (${mime}). Allowed: JPEG, PNG, WebP, SVG, GIF, PDF, DOCX.`,
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("BAD_REQUEST", "File size exceeds the 15MB limit.", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    };

    const ext = extMap[mime] || path.extname(file.name) || ".bin";
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${sanitizedBase}-${uniqueSuffix}${ext}`;

    const subfolder = mime.startsWith("image/") ? "images" : "documents";
    const uploadDir = path.join(process.cwd(), "public", "uploads", "project-library", subfolder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/project-library/${subfolder}/${filename}`;

    let createdAsset = null;
    let createdDoc = null;

    if (projectId) {
      const projectExists = await db.projectLibraryItem.findUnique({
        where: { id: projectId },
      });

      if (projectExists) {
        if (mime.startsWith("image/")) {
          createdAsset = await db.projectLibraryAsset.create({
            data: {
              projectId,
              title,
              assetType,
              url: publicUrl,
              isPublic: true,
            },
          });
        } else {
          createdDoc = await db.projectLibraryDocument.create({
            data: {
              projectId,
              title,
              fileUrl: publicUrl,
              fileSize: file.size,
              fileType: mime,
              isConfidential: true,
              uploadedById: userContext.id,
            },
          });
        }

        // Log audit entry
        await db.projectLibraryAuditLog.create({
          data: {
            projectId,
            userId: userContext.id,
            userName: userContext.name,
            userRole,
            action: "MEDIA_UPLOADED",
            details: {
              filename,
              assetType,
              url: publicUrl,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      title,
      assetType,
      size: file.size,
      mimeType: mime,
      asset: createdAsset,
      document: createdDoc,
    });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to upload project asset", error.statusCode || 500);
  }
}
