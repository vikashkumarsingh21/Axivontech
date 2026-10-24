import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  checkRateLimit,
  logBrokerAudit,
} from "@/lib/api/broker";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { user, brokerId } = await requireBroker(req);

    checkRateLimit(`broker_avatar:${brokerId}`, 10, 60);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ApiError(400, "No image file was provided.", undefined, "NO_FILE");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ApiError(400, "Avatar image exceeds the 5MB limit.", undefined, "FILE_TOO_LARGE");
    }

    const validExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    const ext = path.extname(file.name).toLowerCase();
    const validMimes = ["image/png", "image/jpeg", "image/webp"];

    if (!validExtensions.includes(ext) || (file.type && !validMimes.includes(file.type))) {
      throw new ApiError(400, "Invalid image format. Only PNG, JPG, and WebP are allowed.", undefined, "INVALID_FORMAT");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp =
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (!isPng && !isJpg && !isWebp) {
      throw new ApiError(400, "Corrupted or invalid image binary detected.", undefined, "INVALID_MAGIC_BYTES");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeHash = crypto.randomBytes(16).toString("hex");
    const safeFilename = `avatar-${user.id}-${safeHash}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await fs.writeFile(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${safeFilename}`;

    await db.user.update({
      where: { id: brokerId },
      data: { avatarUrl },
    });

    await logBrokerAudit({
      userId: brokerId,
      action: "BROKER_AVATAR_UPDATED",
      resource: `User:${brokerId}`,
      details: { avatarUrl },
    });

    return apiSuccess({ avatarUrl, message: "Avatar uploaded successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
