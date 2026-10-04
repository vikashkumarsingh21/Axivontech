import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
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
    // Basic payload size check
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 50000) {
      throw new ApiError(413, "Payload too large");
    }

    const body = await req.json();
    const data = applicationSchema.parse(body);

    // Duplicate application check
    const existingApp = await db.businessPartnerApplication.findFirst({
      where: {
        email: data.email,
        status: {
          notIn: ["REJECTED"],
        },
      },
    });

    if (existingApp) {
      return NextResponse.json(
        {
          message:
            "An application associated with this email is already under review. Please contact AXIVON if you have questions.",
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
        message: "Application submitted successfully.",
        applicationId: application.applicationId,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
