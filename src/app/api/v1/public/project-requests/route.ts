import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      throw new ApiError(429, "Too many submissions. Please try again later.");
    }

    const body = await req.json().catch(() => ({}));
    const {
      clientName, clientEmail, clientPhone, clientWhatsapp, clientDesignation,
      companyName, industry, businessAddress, city, state, country, website, companySize, gstNumber, regNumber,
      projectName, requiredService, detailedRequirement, expectedTimeline, projectBudget, additionalRequirements,
      contactPerson, contactEmail, contactPhone,
      referralCode,
    } = body;

    // Server-side validation
    if (!clientName?.trim()) throw new ApiError(400, "Full Name is required.");
    if (!clientEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim()))
      throw new ApiError(400, "A valid email address is required.");
    if (!clientPhone?.trim()) throw new ApiError(400, "Phone number is required.");
    if (!companyName?.trim()) throw new ApiError(400, "Company Name is required.");
    if (!industry?.trim()) throw new ApiError(400, "Industry is required.");
    if (!city?.trim()) throw new ApiError(400, "City is required.");
    if (!state?.trim()) throw new ApiError(400, "State is required.");
    if (!country?.trim()) throw new ApiError(400, "Country is required.");
    if (!projectName?.trim()) throw new ApiError(400, "Project Name is required.");
    if (!requiredService?.trim()) throw new ApiError(400, "Required Service is required.");
    if (!detailedRequirement?.trim()) throw new ApiError(400, "Detailed Project Requirement is required.");
    if (!expectedTimeline?.trim()) throw new ApiError(400, "Expected Timeline is required.");
    if (!projectBudget?.trim()) throw new ApiError(400, "Project Budget is required.");
    if (!referralCode?.trim()) throw new ApiError(400, "Referral Code is required.");

    // Resolve referral code server-side — NEVER trust client-provided brokerId
    const brokerProfile = await db.brokerProfile.findUnique({
      where: { referralCode: referralCode.trim() },
      include: { user: { select: { id: true, name: true, status: true } } },
    });

    if (!brokerProfile) throw new ApiError(400, "Invalid referral code.");
    if (brokerProfile.user.status !== "ACTIVE") throw new ApiError(400, "This referral link is no longer active.");

    // Generate project code
    const today = new Date().toISOString().replace(/-/g, "").slice(0, 8);
    const count = await db.partnerProject.count({ where: { projectCode: { startsWith: `PRJ-${today}` } } });
    const projectCode = `PRJ-${today}-${String(count + 1).padStart(4, "0")}`;

    const project = await db.$transaction(async (tx) => {
      const newProject = await tx.partnerProject.create({
        data: {
          projectCode,
          brokerProfileId: brokerProfile.id,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientPhone: clientPhone.trim(),
          clientWhatsapp: clientWhatsapp?.trim() || null,
          clientDesignation: clientDesignation?.trim() || null,
          companyName: companyName.trim(),
          industry: industry.trim(),
          businessAddress: businessAddress?.trim() || null,
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          website: website?.trim() || null,
          companySize: companySize?.trim() || null,
          gstNumber: gstNumber?.trim() || null,
          regNumber: regNumber?.trim() || null,
          projectName: projectName.trim(),
          requiredService: requiredService.trim(),
          detailedRequirement: detailedRequirement.trim(),
          expectedTimeline: expectedTimeline.trim(),
          projectBudget: projectBudget.trim(),
          additionalRequirements: additionalRequirements?.trim() || null,
          contactPerson: contactPerson?.trim() || null,
          contactEmail: contactEmail?.trim() || null,
          contactPhone: contactPhone?.trim() || null,
          status: "PROJECT_REQUESTED",
        },
      });

      // Notify Admins & Founders
      const adminRoles = await tx.userRole.findMany({
        where: { role: { name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] } } },
        select: { userId: true },
      });
      const recipientIds = [...new Set(adminRoles.map(r => r.userId))];

      if (recipientIds.length > 0) {
        await tx.notification.createMany({
          data: recipientIds.map(userId => ({
            userId,
            type: "SYSTEM",
            title: `New Project Request: ${projectName}`,
            message: `Submitted by ${clientName} via partner ${brokerProfile.user.name} (${referralCode})`,
            link: `/admin/crm/partner-projects/${newProject.id}`,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          action: "PARTNER_PROJECT_CREATED",
          resource: "PartnerProject",
          details: {
            projectCode,
            referralCode,
            brokerName: brokerProfile.user.name,
            clientName,
            companyName,
            projectName,
            service: requiredService,
          },
        },
      });

      return newProject;
    });

    return NextResponse.json(
      { success: true, message: "Your project request has been submitted successfully.", projectCode: project.projectCode },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
