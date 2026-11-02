import { NextRequest } from "next/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requireBroker, apiSuccess, checkRateLimit } from "@/lib/api/broker";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { brokerId } = await requireBroker(req);

    // Rate limit: Max 15 document uploads per minute per broker
    checkRateLimit(`broker_doc_upload:${brokerId}`, 15, 60);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ApiError(400, "No file was uploaded.", undefined, "NO_FILE");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new ApiError(400, "File exceeds the 10MB maximum upload limit.", undefined, "FILE_TOO_LARGE");
    }

    const originalName = file.name || "document";
    const ext = path.extname(originalName).toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".rtf",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".zip",
    ];

    if (!allowedExtensions.includes(ext)) {
      throw new ApiError(
        400,
        `Unsupported file type (${ext}). Allowed formats: PDF, DOC, DOCX, TXT, RTF, PNG, JPG, WEBP, ZIP.`,
        undefined,
        "INVALID_FILE_TYPE"
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes check for images and PDFs
    if (ext === ".pdf") {
      const isPdf = buffer.slice(0, 4).toString() === "%PDF";
      if (!isPdf) {
        throw new ApiError(400, "Corrupted or invalid PDF file header.", undefined, "INVALID_PDF");
      }
    } else if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isWebp = buffer.length > 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

      if (!isPng && !isJpg && !isWebp) {
        throw new ApiError(400, "Corrupted or invalid image binary.", undefined, "INVALID_IMAGE");
      }
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "lead-documents");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeHash = crypto.randomBytes(12).toString("hex");
    const sanitizedBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const safeFilename = `${sanitizedBase}-${safeHash}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/lead-documents/${safeFilename}`;

    return apiSuccess({
      file: {
        name: originalName,
        url: fileUrl,
        size: file.size,
        type: file.type || ext.replace(".", ""),
      },
      message: "File uploaded successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
