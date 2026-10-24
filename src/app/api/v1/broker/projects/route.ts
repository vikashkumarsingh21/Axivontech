import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import {
  requireBroker,
  apiSuccess,
  getBrokerPagination,
  checkIdempotency,
  checkRateLimit,
  logBrokerAudit,
  notifyAdmins,
  notifyBroker,
} from "@/lib/api/broker";
import { z } from "zod";

const createProjectSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters").max(150),
  requiredService: z.string().min(2, "Service interest is required").max(100),
  detailedRequirement: z.string().min(10, "Detailed requirement must be at least 10 characters").max(5000),
  expectedTimeline: z.string().min(1, "Expected timeline is required").max(100),
  projectBudget: z.string().min(1, "Project budget is required").max(100),
  additionalRequirements: z.string().max(2000).optional().nullable(),

  // Client Details
  clientName: z.string().min(2, "Client full name is required").max(150),
  clientEmail: z.string().email("Valid client email address is required").max(150),
  clientPhone: z.string().min(7, "Client phone number is required").max(30),
  clientWhatsapp: z.string().max(30).optional().nullable(),
  clientDesignation: z.string().max(100).optional().nullable(),

  // Company Details
  companyName: z.string().max(200).optional().default("Individual / Unspecified"),
  industry: z.string().max(100).optional().default("Technology"),
  businessAddress: z.string().max(300).optional().nullable(),
  city: z.string().max(100).optional().default("Unspecified"),
  state: z.string().max(100).optional().default("Unspecified"),
  country: z.string().max(100).optional().default("India"),
  website: z.string().url("Website must be a valid URL").optional().nullable().or(z.literal("")),
  companySize: z.string().max(50).optional().nullable(),
  gstNumber: z.string().max(25).optional().nullable(),
  regNumber: z.string().max(50).optional().nullable(),

  // Primary Contact (Optional override)
  contactPerson: z.string().max(150).optional().nullable(),
  contactEmail: z.string().email().max(150).optional().nullable().or(z.literal("")),
  contactPhone: z.string().max(30).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const { page, limit, skip } = getBrokerPagination(req, 15);

    const where: any = {
      brokerProfileId: brokerProfile.id, // IDOR strict ownership check
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { projectCode: { contains: search, mode: "insensitive" } },
        { projectName: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { requiredService: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === "projectName" || sortBy === "status" || sortBy === "createdAt" || sortBy === "updatedAt") {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [projects, total] = await Promise.all([
      db.partnerProject.findMany({
        where,
        select: {
          id: true,
          projectCode: true,
          projectName: true,
          requiredService: true,
          status: true,
          projectBudget: true,
          expectedTimeline: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          companyName: true,
          industry: true,
          city: true,
          state: true,
          country: true,
          finalProjectValue: true,
          createdAt: true,
          updatedAt: true,
          contract: {
            select: {
              id: true,
              status: true,
              versions: {
                select: { id: true, versionNumber: true, status: true, sentAt: true },
                orderBy: { versionNumber: "desc" },
                take: 1,
              },
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              advanceAmount: true,
              projectPrice: true,
              currency: true,
            },
          },
          commission: {
            select: {
              id: true,
              status: true,
              commissionAmount: true,
              eligibleAt: true,
              paidAt: true,
            },
          },
          _count: {
            select: {
              milestones: true,
              documents: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.partnerProject.count({ where }),
    ]);

    return apiSuccess(projects, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { brokerProfile, user, brokerId } = await requireBroker(req);

    // Rate limit: Max 5 submissions per minute per broker
    checkRateLimit(`broker_proj_create:${brokerId}`, 5, 60);

    const body = await req.json().catch(() => ({}));
    const validated = createProjectSchema.parse(body);

    // Idempotency: Prevent double clicks within 3 seconds
    const idempotencyKey = `proj_${brokerId}_${validated.clientEmail}_${validated.projectName}`;
    checkIdempotency(idempotencyKey, 3000);

    // Duplicate project check within last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db.partnerProject.findFirst({
      where: {
        brokerProfileId: brokerProfile.id,
        clientEmail: validated.clientEmail.trim().toLowerCase(),
        projectName: validated.projectName.trim(),
        createdAt: { gte: oneDayAgo },
      },
      select: { id: true, projectCode: true, createdAt: true },
    });

    if (existing) {
      throw new ApiError(
        409,
        `A project submission with this title and client email was already recorded today (${existing.projectCode}).`,
        undefined,
        "DUPLICATE_PROJECT"
      );
    }

    // Generate project code
    const todayStr = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const countToday = await db.partnerProject.count({
      where: { projectCode: { startsWith: `PRJ-${todayStr}` } },
    });
    const projectCode = `PRJ-${todayStr}-${String(countToday + 1).padStart(4, "0")}`;

    const newProject = await db.$transaction(async (tx) => {
      const project = await tx.partnerProject.create({
        data: {
          projectCode,
          brokerProfileId: brokerProfile.id,
          projectName: validated.projectName.trim(),
          requiredService: validated.requiredService.trim(),
          detailedRequirement: validated.detailedRequirement.trim(),
          expectedTimeline: validated.expectedTimeline.trim(),
          projectBudget: validated.projectBudget.trim(),
          additionalRequirements: validated.additionalRequirements?.trim() || null,

          clientName: validated.clientName.trim(),
          clientEmail: validated.clientEmail.trim().toLowerCase(),
          clientPhone: validated.clientPhone.trim(),
          clientWhatsapp: validated.clientWhatsapp?.trim() || null,
          clientDesignation: validated.clientDesignation?.trim() || null,

          companyName: validated.companyName.trim(),
          industry: validated.industry.trim(),
          businessAddress: validated.businessAddress?.trim() || null,
          city: validated.city.trim(),
          state: validated.state.trim(),
          country: validated.country.trim(),
          website: validated.website?.trim() || null,
          companySize: validated.companySize?.trim() || null,
          gstNumber: validated.gstNumber?.trim() || null,
          regNumber: validated.regNumber?.trim() || null,

          contactPerson: validated.contactPerson?.trim() || validated.clientName.trim(),
          contactEmail: validated.contactEmail?.trim() || validated.clientEmail.trim().toLowerCase(),
          contactPhone: validated.contactPhone?.trim() || validated.clientPhone.trim(),

          status: "PROJECT_REQUESTED", // Schema standard for initial intake
        },
      });

      // Also create an Activity entry
      await tx.activity.create({
        data: {
          actorId: brokerId,
          action: "CREATED",
          entityType: "PARTNER_PROJECT",
          entityId: project.id,
          summary: `Partner submitted new project referral: ${project.projectName} (${project.projectCode})`,
        },
      });

      return project;
    });

    // Notify platform administrators
    await notifyAdmins({
      title: `New Partner Project: ${newProject.projectName}`,
      message: `Submitted by partner ${user.name} for client ${newProject.clientName} (${newProject.companyName}). Code: ${newProject.projectCode}`,
      link: `/admin/crm/partner-projects/${newProject.id}`,
    });

    // Notify the broker with confirmation
    await notifyBroker({
      userId: brokerId,
      title: "Project Referral Received",
      message: `Your project referral "${newProject.projectName}" (${newProject.projectCode}) was received and is under executive review.`,
      link: `/broker/projects/${newProject.id}`,
    });

    // Audit Log
    await logBrokerAudit({
      userId: brokerId,
      action: "BROKER_PROJECT_CREATED",
      resource: `PartnerProject:${newProject.id}`,
      details: {
        projectId: newProject.id,
        projectCode: newProject.projectCode,
        clientName: newProject.clientName,
        projectName: newProject.projectName,
      },
    });

    return apiSuccess(newProject, undefined, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
