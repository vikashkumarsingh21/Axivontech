import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isCareersPageEnabled } from "@/lib/careers/careers-db";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { verifyFormProtection } from "@/lib/captcha";

export async function POST(req: NextRequest) {
  try {
    const enabled = await isCareersPageEnabled();
    if (!enabled) {
      throw new ApiError(403, "Recruitment is currently closed and resume uploads are not accepted at this time.");
    }

    const formData = await req.formData();
    const token = (formData.get("captchaToken") || formData.get("turnstileToken") || req.headers.get("x-captcha-token")) as string | null;

    // Server-side anti-bot & CAPTCHA protection
    const protection = await verifyFormProtection(req, { captchaToken: token }, {
      action: "resume_upload",
      rateLimitPreset: RATE_LIMIT_PRESETS.RESUME_UPLOAD,
    });
    if (!protection.success && protection.errorResponse) {
      return protection.errorResponse;
    }

    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ApiError(400, "No resume file was uploaded. Please attach your PDF or DOCX file.");
    }

    // Allowed resume formats
    const validExtensions = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.name).toLowerCase();

    const validMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];

    if (!validExtensions.includes(ext) || (!validMimes.includes(file.type) && file.type)) {
      throw new ApiError(
        400,
        "Invalid file format. Only PDF (.pdf) and Word documents (.doc, .docx) are accepted."
      );
    }

    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ApiError(400, "Resume file size exceeds the 10MB limit. Please compress or link via Google Drive.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize safe filename
    const safeBaseName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 30);
    const filename = `resume-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeBaseName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/resumes/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/pdf",
    });
  } catch (error: any) {
    console.error("[Resume Upload Error]:", error);
    return handleApiError(error);
  }
}
