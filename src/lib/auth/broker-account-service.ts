import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { hashPassword, validatePasswordStrength, generateStrongPassword } from "@/lib/auth/password";
import { JobRunner } from "@/lib/jobs/runner";
import { isOutboundEmailConfigured } from "@/lib/email/service";
import crypto from "crypto";

export interface ApproveAndCreateBrokerAccountParams {
  applicationId: string; // DB id or applicationId (e.g. BPA-2026-...)
  adminUserId: string;
  adminIp?: string;
  email?: string;
  loginEmail?: string;
  mode?: "DIRECT_PASSWORD" | "ACTIVATION_LINK";
  password?: string;
  mustChangePassword?: boolean;
  partnerType?: string;
  internalNote?: string;
}

export interface ApproveAndCreateBrokerAccountResult {
  success: boolean;
  isExisting: boolean;
  applicationId: string;
  partnerId: string;
  referralCode: string;
  email: string;
  name: string;
  mode: "DIRECT_PASSWORD" | "ACTIVATION_LINK";
  mustChangePassword: boolean;
  loginUrl: string;
  oneTimePassword?: string | null;
  activationLink?: string | null;
  emailConfigured: boolean;
  user?: any;
  profile?: any;
}

export interface EmailAvailabilityResult {
  available: boolean;
  exists: boolean;
  canProceed: boolean;
  conflictType:
    | "NONE"
    | "INTERNAL_ROLE_CONFLICT"
    | "EXISTING_BROKER_SAME_APP"
    | "EXISTING_BROKER_ANOTHER_APP"
    | "UNLINKED_BROKER_ACCOUNT";
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    hasBrokerProfile: boolean;
    partnerId?: string | null;
    referralCode?: string | null;
  } | null;
}

/**
 * Checks if a login email is already registered to any User across the platform.
 * Strictly classifies internal employee/admin accounts, existing broker accounts,
 * and cross-application duplicate submissions.
 */
export async function checkEmailAvailability(
  email: string,
  currentApplicationId?: string
): Promise<EmailAvailabilityResult> {
  const normalized = email.toLowerCase().trim();
  if (!normalized || !normalized.includes("@")) {
    return {
      available: false,
      exists: false,
      canProceed: false,
      conflictType: "NONE",
      message: "Invalid email format. Please provide a valid work or personal email.",
    };
  }

  // Check if an existing User account exists
  const existing = await db.user.findUnique({
    where: { email: normalized },
    include: {
      brokerProfile: { select: { id: true, partnerId: true, referralCode: true } },
      userRoles: { include: { role: true } },
    },
  });

  if (!existing) {
    // Check if another BusinessPartnerApplication uses this email
    const otherApp = await db.businessPartnerApplication.findFirst({
      where: {
        email: normalized,
        ...(currentApplicationId
          ? {
              NOT: [{ id: currentApplicationId }, { applicationId: currentApplicationId }],
            }
          : {}),
      },
      select: { id: true, applicationId: true, fullName: true, status: true },
    });

    if (otherApp) {
      return {
        available: false,
        exists: false,
        canProceed: false,
        conflictType: "EXISTING_BROKER_ANOTHER_APP",
        message: `This email address is already associated with another partner application (${otherApp.applicationId} - ${otherApp.fullName}, Status: ${otherApp.status}).`,
      };
    }

    return {
      available: true,
      exists: false,
      canProceed: true,
      conflictType: "NONE",
      message: "Email is available. A new partner account will be created.",
      user: null,
    };
  }

  const roleNames = existing.userRoles.map((ur) => ur.role.name.toUpperCase());
  const primaryRole = roleNames[0] || (existing as any).role || "EMPLOYEE";

  // Check if existing user belongs to internal staff or higher-privilege administrative roles
  const internalRoles = [
    "ADMIN",
    "FOUNDER",
    "CO_FOUNDER",
    "EXECUTIVE",
    "EMPLOYEE",
    "HR",
    "FINANCE",
    "LEAD_DEVELOPER",
    "DEPARTMENT_MANAGER",
    "MANAGER",
  ];
  const isInternal = roleNames.some((r) => internalRoles.includes(r));

  if (isInternal) {
    return {
      available: false,
      exists: true,
      canProceed: false,
      conflictType: "INTERNAL_ROLE_CONFLICT",
      message: `Account Conflict: Email "${normalized}" belongs to an existing ${primaryRole} account (${existing.name}). Internal staff accounts cannot be converted to broker accounts. Please use a separate partner email address.`,
      user: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: primaryRole,
        status: existing.status,
        hasBrokerProfile: !!existing.brokerProfile,
        partnerId: existing.brokerProfile?.partnerId || null,
        referralCode: existing.brokerProfile?.referralCode || null,
      },
    };
  }

  // If existing user already has a broker profile
  if (existing.brokerProfile) {
    return {
      available: false,
      exists: true,
      canProceed: true,
      conflictType: "EXISTING_BROKER_SAME_APP",
      message: `Partner account already exists for ${existing.name} (Partner ID: ${existing.brokerProfile.partnerId}). Provisioning will ensure profile linkage and preserve existing access.`,
      user: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: "BUSINESS_PARTNER",
        status: existing.status,
        hasBrokerProfile: true,
        partnerId: existing.brokerProfile.partnerId,
        referralCode: existing.brokerProfile.referralCode,
      },
    };
  }

  // User exists but has no broker profile yet (e.g. unlinked user)
  return {
    available: false,
    exists: true,
    canProceed: true,
    conflictType: "UNLINKED_BROKER_ACCOUNT",
    message: `Account exists for ${existing.name} without an active broker profile. Provisioning will activate partner credentials and create their partner profile.`,
    user: {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: primaryRole,
      status: existing.status,
      hasBrokerProfile: false,
    },
  };
}

/**
 * Single transactional approval and account creation engine for Broker Partners.
 * Completely eliminates the "Approved but no login" bug by atomically binding
 * application status update, User creation/activation, role assignment, and BrokerProfile creation.
 */
export async function approveAndCreateBrokerAccount(
  params: ApproveAndCreateBrokerAccountParams
): Promise<ApproveAndCreateBrokerAccountResult> {
  const {
    applicationId,
    adminUserId,
    adminIp = "127.0.0.1",
    email,
    loginEmail,
    mode = "DIRECT_PASSWORD",
    password,
    mustChangePassword = true,
    partnerType,
    internalNote,
  } = params;

  // 1. Fetch application
  const application = await db.businessPartnerApplication.findFirst({
    where: {
      OR: [{ id: applicationId }, { applicationId: applicationId }],
    },
  });

  if (!application) {
    throw new ApiError(404, "Partner application not found.");
  }

  const rawEmail = email || loginEmail || application.email;
  if (!rawEmail) {
    throw new ApiError(400, "Login email is required.");
  }
  const normalizedEmail = rawEmail.toLowerCase().trim();

  // 2. Duplicate / Existing account check
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      brokerProfile: true,
      userRoles: { include: { role: true } },
    },
  });

  // Strict Protection: Do NOT convert internal employee/admin accounts into broker accounts!
  if (existingUser) {
    const roleNames = existingUser.userRoles.map((ur) => ur.role.name.toUpperCase());
    const internalRoles = [
      "ADMIN",
      "FOUNDER",
      "CO_FOUNDER",
      "EXECUTIVE",
      "EMPLOYEE",
      "HR",
      "FINANCE",
      "LEAD_DEVELOPER",
      "DEPARTMENT_MANAGER",
      "MANAGER",
    ];
    const isInternal = roleNames.some((r) => internalRoles.includes(r));
    if (isInternal) {
      throw new ApiError(
        409,
        `Account conflict: Email "${normalizedEmail}" belongs to an existing ${roleNames[0]} account (${existingUser.name}). Internal accounts cannot be converted to partner accounts. Please use a dedicated business partner email.`,
        undefined,
        "INTERNAL_ROLE_CONFLICT"
      );
    }
  }

  // Idempotency: If the account is already fully approved and linked to this broker profile
  if (existingUser?.brokerProfile && application.status === "APPROVED") {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
    return {
      success: true,
      isExisting: true,
      applicationId: application.applicationId,
      partnerId: existingUser.brokerProfile.partnerId || "AXP-PENDING",
      referralCode: existingUser.brokerProfile.referralCode || "AXP-PENDING",
      email: existingUser.email,
      name: existingUser.name,
      mode,
      mustChangePassword: existingUser.mustChangePassword,
      loginUrl: `${baseUrl}/login`,
      user: existingUser,
      profile: existingUser.brokerProfile,
      emailConfigured: isOutboundEmailConfigured(),
    };
  }

  // If email exists for another user who is NOT linked to this application
  if (existingUser && existingUser.email.toLowerCase() !== application.email.toLowerCase()) {
    throw new ApiError(
      400,
      `Cannot use email ${normalizedEmail}. It is already associated with another user (${existingUser.name}).`
    );
  }

  let finalPasswordHash: string;
  let activationToken: string | null = null;
  const activePassword = password?.trim() || (mode === "DIRECT_PASSWORD" ? generateStrongPassword(14) : undefined);

  if (mode === "DIRECT_PASSWORD") {
    if (!activePassword) {
      throw new ApiError(400, "Password is required for direct password provisioning.");
    }
    const validation = validatePasswordStrength(activePassword);
    if (!validation.isValid) {
      throw new ApiError(400, `Password does not meet security rules: ${validation.errors.join(" ")}`);
    }
    finalPasswordHash = await hashPassword(activePassword);
  } else {
    // Mode is ACTIVATION_LINK: generate a random unguessable temporary password and 48h activation token
    activationToken = crypto.randomUUID();
    finalPasswordHash = await hashPassword(crypto.randomUUID());
  }

  // 3. Organization and canonical role lookup
  const org = await db.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  const partnerRole = await db.role.upsert({
    where: { name: "BUSINESS_PARTNER" },
    update: {},
    create: {
      name: "BUSINESS_PARTNER",
      description: "Axivon Broker / Business Partner",
    },
  });

  // 4. Generate unique Partner ID and Referral Code
  const year = new Date().getFullYear();
  const partnerId = `AXP-${year}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const safeName = application.fullName
    .split(" ")[0]
    .replace(/[^A-Za-z0-9]/g, "")
    .substring(0, 5)
    .toUpperCase() || "BRK";
  const referralCode = `AXP-${safeName}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  // 5. ATOMIC PRISMA TRANSACTION
  const transactionResult = await db.$transaction(async (tx) => {
    // A. Create or update User
    let user;
    if (existingUser) {
      user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          name: application.fullName,
          phone: application.phone,
          passwordHash: finalPasswordHash,
          status: mode === "ACTIVATION_LINK" ? "PENDING_ACTIVATION" : "ACTIVE",
          mustChangePassword: mode === "DIRECT_PASSWORD" ? mustChangePassword : true,
          activationToken: mode === "ACTIVATION_LINK" ? activationToken : null,
          organizationId: org?.id,
        },
      });
    } else {
      user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: application.fullName,
          phone: application.phone,
          passwordHash: finalPasswordHash,
          status: mode === "ACTIVATION_LINK" ? "PENDING_ACTIVATION" : "ACTIVE",
          mustChangePassword: mode === "DIRECT_PASSWORD" ? mustChangePassword : true,
          activationToken: mode === "ACTIVATION_LINK" ? activationToken : null,
          organizationId: org?.id,
        },
      });
    }

    // B. Assign canonical role
    await tx.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: partnerRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: partnerRole.id,
      },
    });

    // C. Upsert BrokerProfile
    let profile = await tx.brokerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await tx.brokerProfile.create({
        data: {
          userId: user.id,
          partnerId,
          referralCode,
          companyName: application.currentWork || "Independent Partner",
          designation: partnerType || application.occupation || "Broker Partner",
          city: application.city,
          state: application.state,
          country: application.country,
        },
      });
    } else {
      profile = await tx.brokerProfile.update({
        where: { id: profile.id },
        data: {
          designation: partnerType || profile.designation,
          city: application.city || profile.city,
          state: application.state || profile.state,
        },
      });
    }

    // D. Update Application status
    const updatedApplication = await tx.businessPartnerApplication.update({
      where: { id: application.id },
      data: {
        status: "APPROVED",
        reviewedById: adminUserId,
        reviewedAt: new Date(),
        decisionReason: internalNote || "Approved and login account created by Admin",
      },
    });

    // E. Record ApplicationStatusHistory
    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        previousStatus: application.status,
        newStatus: "APPROVED",
        changedById: adminUserId,
        reason: internalNote || `Account created with mode ${mode}`,
      },
    });

    // F. Record AuditLog (NEVER log the password)
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "PARTNER_APPLICATION_APPROVED_AND_ACCOUNT_CREATED",
        resource: `User:${user.id}`,
        details: {
          applicationId: application.applicationId,
          partnerUserId: user.id,
          partnerId: profile.partnerId,
          referralCode: profile.referralCode,
          mode,
          mustChangePassword,
          ip: adminIp,
        },
      },
    });

    return { user: { ...user, role: "BUSINESS_PARTNER" }, profile, updatedApplication };
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
  const loginUrl = `${baseUrl}/login`;
  const activationLink =
    mode === "ACTIVATION_LINK"
      ? `${baseUrl}/broker-partner/activate?token=${activationToken}`
      : null;

  const emailConfigured = isOutboundEmailConfigured();

  // 6. Dispatch Email Notifications (Customer activation + Internal alert)
  try {
    await JobRunner.enqueue("SEND_EMAIL", {
      to: normalizedEmail,
      templateKey: "PARTNER_ACCOUNT_ACTIVATION",
      eventKey: `broker_account_ready:${transactionResult.profile.partnerId}`,
      variables: {
        name: application.fullName,
        email: normalizedEmail,
        partnerId: transactionResult.profile.partnerId,
        referralCode: transactionResult.profile.referralCode,
        activationLink: activationLink || loginUrl,
      },
    });

    const { sendTransactionalEmail } = await import("@/lib/email/service");
    const { getEmailConfig } = await import("@/lib/email/config");
    const emailConfig = getEmailConfig();

    // 6a. Dispatch Customer Partner Activation Email
    await sendTransactionalEmail({
      to: normalizedEmail,
      templateKey: "PARTNER_ACCOUNT_ACTIVATION",
      eventKey: `broker_account_ready:${transactionResult.profile.partnerId}`,
      variables: {
        name: application.fullName,
        email: normalizedEmail,
        partnerId: transactionResult.profile.partnerId,
        referralCode: transactionResult.profile.referralCode,
        activationLink: activationLink || loginUrl,
      },
      metadata: {
        partnerId: transactionResult.profile.partnerId,
        applicationId: transactionResult.updatedApplication.applicationId,
        type: "PARTNER_ACCOUNT_ACTIVATION",
      },
    });

    // 6b. Internal Business Notification to info@axivontech.in
    await sendTransactionalEmail({
      to: emailConfig.internalNotificationEmail,
      templateKey: "GENERIC_NOTIFICATION",
      eventKey: `broker_account_created_internal:${transactionResult.profile.partnerId}`,
      variables: {
        title: "Broker Account Created & Activated",
        message: `A new partner account has been created for ${application.fullName} (${transactionResult.profile.partnerId}). Application ID: ${transactionResult.updatedApplication.applicationId}. Registered Email: ${normalizedEmail}.`,
        link: `${baseUrl}/admin/crm/brokers`,
      },
      metadata: {
        partnerId: transactionResult.profile.partnerId,
        applicationId: transactionResult.updatedApplication.applicationId,
        type: "INTERNAL_BROKER_ACCOUNT_CREATED",
      },
    });
  } catch (err) {
    console.error("[EmailQueue] Failed to dispatch partner activation email:", err);
  }

  return {
    success: true,
    isExisting: false,
    applicationId: transactionResult.updatedApplication.applicationId,
    partnerId: transactionResult.profile.partnerId || partnerId,
    referralCode: transactionResult.profile.referralCode || referralCode,
    email: transactionResult.user.email,
    name: transactionResult.user.name,
    mode,
    mustChangePassword,
    loginUrl,
    oneTimePassword: mode === "DIRECT_PASSWORD" ? (activePassword || null) : null,
    activationLink,
    emailConfigured,
    user: transactionResult.user,
    profile: transactionResult.profile,
  };
}

/**
 * Direct administrative password reset for Broker Partners.
 * Generates or applies a new password, forces change on next login,
 * and creates an immutable audit trail.
 */
export async function resetBrokerPassword(params: {
  brokerId?: string; // BrokerProfile.id or User.id
  userId?: string;
  adminUserId: string;
  adminIp?: string;
  mode: "DIRECT_PASSWORD" | "ACTIVATION_LINK";
  password?: string;
  newPassword?: string;
  mustChangePassword?: boolean;
}) {
  const {
    brokerId,
    userId,
    adminUserId,
    adminIp = "127.0.0.1",
    mode,
    password,
    newPassword,
    mustChangePassword = true,
  } = params;

  const targetId = brokerId || userId;
  if (!targetId) {
    throw new ApiError(400, "Broker ID or User ID is required.");
  }
  const rawPassword = password || newPassword;

  const broker = await db.brokerProfile.findFirst({
    where: { OR: [{ id: targetId }, { userId: targetId }, { partnerId: targetId }] },
    include: { user: true },
  });

  if (!broker || !broker.user) {
    throw new ApiError(404, "Broker account not found.");
  }

  let finalPasswordHash: string;
  let activationToken: string | null = null;

  if (mode === "DIRECT_PASSWORD") {
    if (!rawPassword) {
      throw new ApiError(400, "Password is required for direct password reset.");
    }
    const validation = validatePasswordStrength(rawPassword);
    if (!validation.isValid) {
      throw new ApiError(400, `Password does not meet security rules: ${validation.errors.join(" ")}`);
    }
    finalPasswordHash = await hashPassword(rawPassword);
  } else {
    activationToken = crypto.randomUUID();
    finalPasswordHash = await hashPassword(crypto.randomUUID());
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: broker.user.id },
      data: {
        passwordHash: finalPasswordHash,
        mustChangePassword: mode === "DIRECT_PASSWORD" ? mustChangePassword : true,
        activationToken: mode === "ACTIVATION_LINK" ? activationToken : null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "BROKER_PASSWORD_RESET_BY_ADMIN",
        resource: `User:${broker.user.id}`,
        details: {
          partnerId: broker.partnerId,
          mode,
          mustChangePassword,
          ip: adminIp,
        },
      },
    });
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
  const loginUrl = `${baseUrl}/login`;
  const activationLink =
    mode === "ACTIVATION_LINK"
      ? `${baseUrl}/broker-partner/activate?token=${activationToken}`
      : null;

  return {
    success: true,
    partnerId: broker.partnerId,
    email: broker.user.email,
    loginUrl,
    mode,
    mustChangePassword,
    oneTimePassword: mode === "DIRECT_PASSWORD" ? rawPassword : null,
    activationLink,
    user: broker.user,
    profile: broker,
    credentials: {
      loginUrl,
      email: broker.user.email,
      password: mode === "DIRECT_PASSWORD" ? rawPassword : null,
      mustChangePassword,
      partnerId: broker.partnerId,
      referralCode: broker.referralCode,
    },
  };
}
