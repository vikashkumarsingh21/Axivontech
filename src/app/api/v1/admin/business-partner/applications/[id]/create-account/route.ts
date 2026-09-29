import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { hashPassword } from "@/lib/auth/password";
import { JobRunner } from "@/lib/jobs/runner";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "business_partner_application.review"); // Reusing review permission

    const { id } = await params;

    const application = await db.businessPartnerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    if (application.status !== "APPROVED") {
      throw new ApiError(400, "Cannot create Partner account. Application must be approved first.");
    }

    // Check if the user already exists
    let user = await db.user.findUnique({
      where: { email: application.email },
    });

    // We require a BROKER or PARTNER role. The existing app uses BROKER role logic. Let's ensure it exists.
    const partnerRole = await db.role.upsert({
      where: { name: "BROKER" },
      update: {},
      create: { name: "BROKER", description: "Business Partner / Broker" },
    });

    // Idempotency: Check if Partner account is already linked
    if (user) {
      const existingBrokerProfile = await db.brokerProfile.findUnique({
        where: { userId: user.id },
      });
      if (existingBrokerProfile) {
        return NextResponse.json(
          { message: "Partner account already linked", partnerId: existingBrokerProfile.partnerId },
          { status: 200 }
        );
      }
    }

    // Generate identities
    const year = new Date().getFullYear();
    const partnerId = `AXP-${year}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    // Simple robust referral code based on their name and random string
    const safeName = application.fullName.split(" ")[0].replace(/[^A-Za-z0-9]/g, "").substring(0, 5).toUpperCase();
    const referralCode = `AXP-${safeName}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const activationToken = crypto.randomUUID();
    const temporaryPassword = crypto.randomUUID(); // they will never use this, they use the token

    const hashedPassword = await hashPassword(temporaryPassword);

    // Transaction
    const result = await db.$transaction(async (tx) => {
      let createdUser;
      if (!user) {
        createdUser = await tx.user.create({
          data: {
            email: application.email,
            name: application.fullName,
            phone: application.phone,
            passwordHash: hashedPassword,
            status: "PENDING_ACTIVATION",
            mustChangePassword: true,
            activationToken,
          },
        });
      } else {
        // Link to existing user, but update their status for the partner onboarding flow
        createdUser = await tx.user.update({
          where: { id: user.id },
          data: {
            status: "PENDING_ACTIVATION", // Optional based on if they were already active
            mustChangePassword: true,
            activationToken,
          }
        });
      }

      await tx.userRole.upsert({
        where: { userId_roleId: { userId: createdUser.id, roleId: partnerRole.id } },
        update: {},
        create: { userId: createdUser.id, roleId: partnerRole.id },
      });

      const brokerProfile = await tx.brokerProfile.create({
        data: {
          userId: createdUser.id,
          referralCode,
          partnerId,
          companyName: application.currentWork || "Independent Partner",
          designation: application.occupation,
          city: application.city,
          state: application.state,
          country: application.country,
        },
      });

      return { user: createdUser, brokerProfile };
    });

    // Enqueue activation email
    await JobRunner.enqueue("SEND_EMAIL", {
      to: application.email,
      templateKey: "PARTNER_ACCOUNT_ACTIVATION",
      variables: {
        name: application.fullName,
        partnerId: result.brokerProfile.partnerId,
        referralCode: result.brokerProfile.referralCode,
        activationLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/business-partner/activate?token=${activationToken}`,
      },
    });

    // Emit AuditLog
    try {
      await db.auditLog.create({
        data: {
          userId,
          action: "PARTNER_ACCOUNT_CREATED",
          resource: `BusinessPartnerApplication:${application.applicationId}`,
          details: {
            applicationId: application.applicationId,
            partnerUserId: result.user.id,
            partnerId: result.brokerProfile.partnerId,
            referralCode: result.brokerProfile.referralCode,
          },
        },
      });
    } catch {
      console.error("Failed to write audit log for partner account creation");
    }

    return NextResponse.json(
      {
        message: "Partner account created successfully",
        partnerId: result.brokerProfile.partnerId,
        referralCode: result.brokerProfile.referralCode,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
