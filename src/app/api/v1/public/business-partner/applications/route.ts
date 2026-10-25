import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { verifyFormProtection } from "@/lib/captcha";
import crypto from "crypto";
import { JobRunner } from "@/lib/jobs/runner";

// Strict Zod schema for the application submission
const Education10thSchema = z.object({
  school: z.string().min(2, "School/Institution is required"),
  board: z.string().min(2, "Board is required"),
  passingYear: z.string().min(4, "Passing year is required"),
  percentage: z.string().optional(),
});

const EducationOptionalSchema = z.object({
  school: z.string().optional(),
  board: z.string().optional(),
  passingYear: z.string().optional(),
  percentage: z.string().optional(),
}).optional().nullable();

const EducationUGSchema = z.object({
  degree: z.string().optional(),
  college: z.string().optional(),
  passingYear: z.string().optional(),
  branch: z.string().optional(),
}).optional().nullable();

const applicationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  country: z.string().min(2, "Country is required").max(100),
  state: z.string().max(100).optional(),
  city: z.string().min(2, "City is required").max(100),
  occupation: z.string().min(2, "Occupation is required").max(100),
  currentWork: z.string().max(200).optional(),
  yearsOfExperience: z.number().int().nonnegative().max(60).optional().nullable(),
  relevantExperience: z.string().max(3000).optional(),
  clientNetwork: z.string().max(3000).optional(),
  education10th: Education10thSchema,
  education12th: EducationOptionalSchema,
  educationUndergrad: EducationUGSchema,
  motivation: z.string().max(2000).optional(),
  contribution: z.string().max(2000).optional(),
  additionalInfo: z.string().max(2000).optional(),
});

function generateApplicationId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BPA-${year}-${random}`;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = isRateLimited(`bp_apply:${ip}`, RATE_LIMIT_PRESETS.PUBLIC_LEADS);
    if (rateLimit.limited) {
      throw new ApiError(
        429,
        `Too many applications submitted from this IP. Please try again in ${Math.ceil(rateLimit.resetMs / 60000)} minutes.`
      );
    }

    // Basic payload size check
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 50000) {
      throw new ApiError(413, "Payload too large");
    }

    const body = await req.json().catch(() => ({}));

    // Server-side dual protection: Privacy Policy acknowledgement + Google reCAPTCHA v2 / Turnstile
    const protection = await verifyFormProtection(req, body, {
      action: "partner_application",
      rateLimitPreset: RATE_LIMIT_PRESETS.PUBLIC_LEADS,
      requirePolicyAcknowledgement: true,
      policySlug: "privacy-policy",
    });
    if (!protection.success && protection.errorResponse) {
      return protection.errorResponse;
    }

    const data = applicationSchema.parse(body);

    // Duplicate application check (email or phone)
    const existingApp = await db.businessPartnerApplication.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone },
        ],
        status: {
          notIn: ["REJECTED"],
        },
      },
    });

    if (existingApp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_APPLICATION",
            message: "An application associated with this email or phone number is already under review. Please contact AXIVON if you have questions.",
          },
          message:
            "An application associated with this email or phone number is already under review. Please contact AXIVON if you have questions.",
        },
        { status: 409 }
      );
    }

    const applicationId = generateApplicationId();
    const verificationToken = crypto.randomUUID();

    const application = await db.businessPartnerApplication.create({
      data: {
        applicationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        state: data.state,
        city: data.city,
        occupation: data.occupation,
        currentWork: data.currentWork,
        yearsOfExperience: data.yearsOfExperience ?? null,
        relevantExperience: data.relevantExperience,
        clientNetwork: data.clientNetwork,
        education10th: data.education10th as Prisma.InputJsonValue,
        education12th: data.education12th
          ? (data.education12th as Prisma.InputJsonValue)
          : Prisma.DbNull,
        educationUndergrad: data.educationUndergrad
          ? (data.educationUndergrad as Prisma.InputJsonValue)
          : Prisma.DbNull,
        motivation: data.motivation,
        contribution: data.contribution,
        additionalInfo: data.additionalInfo,
        status: "SUBMITTED",
        verificationToken,
      },
      select: {
        id: true,
        applicationId: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
        verificationToken: true,
      },
    });

    // Enqueue verification email
    await JobRunner.enqueue("SEND_EMAIL", {
      to: application.email,
      templateKey: "PARTNER_APPLICATION_RECEIVED",
      variables: {
        name: application.fullName,
        applicationId: application.applicationId,
        verificationLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v1/public/business-partner/applications/verify?token=${verificationToken}`,
      },
    });

    // Create initial status history
    await db.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        previousStatus: null,
        newStatus: "SUBMITTED",
        reason: "Application submitted by applicant",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully.",
        applicationId: application.applicationId,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId") || searchParams.get("id");
    const token = searchParams.get("token");

    if (!applicationId && !token) {
      throw new ApiError(400, "Application ID or verification token is required.");
    }

    const application = await db.businessPartnerApplication.findFirst({
      where: applicationId
        ? { applicationId }
        : { verificationToken: token! },
      select: {
        applicationId: true,
        fullName: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        statusHistory: {
          select: {
            newStatus: true,
            createdAt: true,
            reason: true,
          },
          orderBy: { createdAt: "asc" },
        },
        meetings: {
          select: {
            id: true,
            meetingDate: true,
            durationMinutes: true,
            meetingType: true,
            locationOrLink: true,
            status: true,
          },
          orderBy: { meetingDate: "desc" },
        },
      },
    });

    if (!application) {
      throw new ApiError(404, "Application not found.", undefined, "APPLICATION_NOT_FOUND");
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

