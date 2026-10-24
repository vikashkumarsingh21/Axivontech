import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";
import { EmailService } from "@/lib/email/service";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { ROLE_HIERARCHY, normalizeRole } from "@/lib/auth/roles";

// Allowed roles for privileged Profile & Account Settings
export const ALLOWED_PROFILE_ROLES = ["ADMIN", "FOUNDER", "CO_FOUNDER"] as const;
export type AllowedProfileRole = (typeof ALLOWED_PROFILE_ROLES)[number];

export function isAllowedProfileRole(role: string): role is AllowedProfileRole {
  return (ALLOWED_PROFILE_ROLES as readonly string[]).includes(role);
}

export function ensureAllowedProfileRole(role: string): void {
  if (!isAllowedProfileRole(role)) {
    throw new ApiError(403, "Forbidden: Profile settings for this role are not managed through this endpoint");
  }
}

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

export const updateAccountProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number cannot exceed 20 characters")
      .regex(/^[+0-9\s-]*$/, "Invalid phone number format")
      .optional()
      .nullable(),
    avatarUrl: z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .max(500, "Avatar URL is too long")
      .optional()
      .nullable(),
    address: z
      .string()
      .trim()
      .max(255, "Address cannot exceed 255 characters")
      .optional()
      .nullable(),
    emergencyContact: z
      .string()
      .trim()
      .max(100, "Emergency contact cannot exceed 100 characters")
      .optional()
      .nullable(),
  })
  .strict(); // Strictly reject attempts to inject role, permissions, passwordHash, status, email, etc.

export const requestEmailChangeSchema = z
  .object({
    newEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address")
      .max(255, "Email address is too long"),
  })
  .strict();

export const verifyEmailChangeSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(32, "Invalid token format")
      .max(128, "Invalid token format"),
  })
  .strict();

export type UpdateAccountProfileInput = z.infer<typeof updateAccountProfileSchema>;

// Helper to hash token using SHA-256
export function hashVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// -----------------------------------------------------------------------------
// Profile Queries and Updates
// -----------------------------------------------------------------------------

export async function getUserProfileSettings(userId: string) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized: Identity required");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      employeeId: true,
      department: true,
      designation: true,
      address: true,
      emergencyContact: true,
      status: true,
      joiningDate: true,
      createdAt: true,
      updatedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  // Derive highest-privilege role using canonical normalization
  const roleNames = user.userRoles.map((ur) => normalizeRole(ur.role.name));
  const primaryRole = ROLE_HIERARCHY.find((r) => roleNames.includes(r)) || roleNames[0] || "USER";

  // Check for active pending email change request
  let pendingEmailChange: {
    newEmail: string;
    expiresAt: Date;
    requestedAt: Date;
  } | null = null;

  try {
    const pendingRequest = await db.emailChangeRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { requestedAt: "desc" },
      select: {
        newEmail: true,
        expiresAt: true,
        requestedAt: true,
      },
    });

    if (pendingRequest) {
      pendingEmailChange = {
        newEmail: pendingRequest.newEmail,
        expiresAt: pendingRequest.expiresAt,
        requestedAt: pendingRequest.requestedAt,
      };
    }
  } catch (err) {
    // If table not migrated in local env yet, degrade gracefully
    console.warn("[ProfileSettingsService] Could not query EmailChangeRequest:", (err as Error).message);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    displayName: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    employeeId: user.employeeId || null,
    department: user.department || "General",
    designation: user.designation || "Executive Team",
    address: user.address,
    emergencyContact: user.emergencyContact,
    status: user.status,
    role: primaryRole,
    organizationName: user.organization?.name || "Axivon Technologies",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    pendingEmailChange,
  };
}

export async function updateUserProfileSettings(
  userId: string,
  rawInput: unknown,
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized: Identity required");
  }

  // Rate limiting check
  const ip = metadata?.ipAddress || "unknown-ip";
  const rateCheck = isRateLimited(`profile_update:${userId}:${ip}`, RATE_LIMIT_PRESETS.PROFILE_UPDATE);
  if (rateCheck.limited) {
    throw new ApiError(429, "Too many profile update attempts. Please slow down.");
  }

  // Validate strictly against allowed fields schema
  const data = updateAccountProfileSchema.parse(rawInput);

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "No valid profile fields provided for update");
  }

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      department: true,
      designation: true,
      address: true,
      emergencyContact: true,
      status: true,
      updatedAt: true,
    },
  });

  // Audit log entry
  try {
    await db.auditLog.create({
      data: {
        userId,
        action: "user.profile_updated",
        resource: "Profile",
        details: {
          updatedFields: Object.keys(updateData),
        },
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });
  } catch (auditErr) {
    console.error("[ProfileSettingsService] Audit log write failed:", auditErr);
  }

  return {
    ...updatedUser,
    displayName: updatedUser.name,
  };
}

// -----------------------------------------------------------------------------
// Email Change Workflow
// -----------------------------------------------------------------------------

export async function requestEmailChange(
  userId: string,
  rawInput: unknown,
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized: Identity required");
  }

  // Rate limiting
  const ip = metadata?.ipAddress || "unknown-ip";
  const rateLimitKey = `email_change_req:${userId}:${ip}`;
  const rateCheck = isRateLimited(rateLimitKey, RATE_LIMIT_PRESETS.EMAIL_CHANGE_REQUEST);
  if (rateCheck.limited) {
    throw new ApiError(
      429,
      `Too many email change requests. Please wait ${Math.ceil(rateCheck.resetMs / 60000)} minute(s) before trying again.`
    );
  }

  const { newEmail } = requestEmailChangeSchema.parse(rawInput);
  const normalizedNewEmail = newEmail.toLowerCase().trim();

  // Retrieve current user
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  // Check if identical to current email
  if (user.email.toLowerCase() === normalizedNewEmail) {
    throw new ApiError(400, "The new email address cannot be the same as your current verified email address.");
  }

  // Check if email already belongs to another user (case-insensitive)
  const existingUser = await db.user.findFirst({
    where: {
      email: {
        equals: normalizedNewEmail,
        mode: "insensitive",
      },
    },
  });

  if (existingUser) {
    // Return a generic security message to avoid revealing account existence
    throw new ApiError(400, "This email address cannot be used. Please choose a different email address.");
  }

  // Generate 32 cryptographically secure random bytes = 64 hex characters
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);

  // Expiration: 1 hour (60 minutes)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Invalidate any previous pending requests and create the new pending request in a transaction
  await db.$transaction(async (tx) => {
    // Supersede any existing pending requests for this user
    await tx.emailChangeRequest.updateMany({
      where: {
        userId,
        status: "PENDING",
      },
      data: {
        status: "SUPERSEDED",
      },
    });

    // Create the new request
    await tx.emailChangeRequest.create({
      data: {
        userId,
        oldEmail: user.email,
        newEmail: normalizedNewEmail,
        tokenHash,
        status: "PENDING",
        expiresAt,
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });

    // Audit log: record request without storing the raw token or token hash
    await tx.auditLog.create({
      data: {
        userId,
        action: "user.email_change_requested",
        resource: "ProfileSecurity",
        details: {
          currentEmail: user.email,
          targetEmail: normalizedNewEmail,
          expiresAt: expiresAt.toISOString(),
        },
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });
  });

  // Construct verification link
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in").replace(/\/$/, "");
  const verificationLink = `${appUrl}/verify-email-change?token=${rawToken}`;

  // Primary role for email personalization
  const roleNames = user.userRoles.map((ur) => ur.role.name);
  const primaryRole = roleNames.includes("FOUNDER")
    ? "Platform Founder"
    : roleNames.includes("CO_FOUNDER")
    ? "Co-Founder"
    : roleNames.includes("ADMIN")
    ? "System Administrator"
    : "Authorized User";

  // Dispatch email to NEW address
  try {
    await EmailService.send({
      to: normalizedNewEmail,
      templateKey: "EMAIL_CHANGE_VERIFICATION",
      variables: {
        name: user.name,
        role: primaryRole,
        link: verificationLink,
        expiresIn: "60 minutes",
      },
      metadata: {
        userId: user.id,
        action: "EMAIL_CHANGE_VERIFICATION",
      },
    });
  } catch (emailErr) {
    console.error("[ProfileSettingsService] Failed to deliver email change verification:", emailErr);
    // Even if email provider fails, the token is recorded in DB and will be retried by JobRunner
  }

  return {
    success: true,
    message: `Verification link has been sent to ${normalizedNewEmail}. Please check your inbox and verify within 60 minutes.`,
    pendingEmail: normalizedNewEmail,
    expiresAt,
  };
}

export async function cancelPendingEmailChange(
  userId: string,
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized: Identity required");
  }

  const pendingRequest = await db.emailChangeRequest.findFirst({
    where: {
      userId,
      status: "PENDING",
    },
    orderBy: { requestedAt: "desc" },
  });

  if (!pendingRequest) {
    throw new ApiError(404, "No active pending email change request was found.");
  }

  await db.$transaction(async (tx) => {
    await tx.emailChangeRequest.update({
      where: { id: pendingRequest.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "user.email_change_cancelled",
        resource: "ProfileSecurity",
        details: {
          cancelledTargetEmail: pendingRequest.newEmail,
        },
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });
  });

  return {
    success: true,
    message: "Pending email change request has been cancelled successfully.",
  };
}

export async function verifyEmailChange(
  rawToken: string,
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new ApiError(400, "Verification token is required");
  }

  // Rate limiting verification attempts by IP
  const ip = metadata?.ipAddress || "unknown-ip";
  const rateLimitKey = `email_verify_attempt:${ip}`;
  const rateCheck = isRateLimited(rateLimitKey, RATE_LIMIT_PRESETS.EMAIL_CHANGE_VERIFY);
  if (rateCheck.limited) {
    throw new ApiError(429, "Too many verification attempts. Please try again later.");
  }

  const tokenHash = hashVerificationToken(rawToken.trim());

  // Look up pending request by token hash
  const request = await db.emailChangeRequest.findUnique({
    where: { tokenHash },
  });

  if (!request || request.status !== "PENDING") {
    // Record security log for failed verification attempt
    try {
      await db.auditLog.create({
        data: {
          action: "user.email_change_verification_failed",
          resource: "ProfileSecurity",
          details: {
            reason: !request ? "TOKEN_NOT_FOUND" : `STATUS_${request.status}`,
          },
          ipAddress: metadata?.ipAddress || "unknown",
          userAgent: metadata?.userAgent || "unknown",
        },
      });
    } catch (_) {}

    throw new ApiError(400, "Invalid or already used verification token. Please submit a new change request.");
  }

  // Check expiration
  const expiresAtDate = new Date(request.expiresAt);
  if (new Date() > expiresAtDate) {
    await db.emailChangeRequest.update({
      where: { id: request.id },
      data: { status: "EXPIRED" },
    });

    try {
      await db.auditLog.create({
        data: {
          userId: request.userId,
          action: "user.email_change_verification_failed",
          resource: "ProfileSecurity",
          details: {
            reason: "TOKEN_EXPIRED",
            expiredAt: expiresAtDate.toISOString(),
          },
          ipAddress: metadata?.ipAddress || "unknown",
          userAgent: metadata?.userAgent || "unknown",
        },
      });
    } catch (_) {}

    throw new ApiError(400, "Verification link has expired. Please submit a new email change request.");
  }

  // Execute database transaction: recheck email uniqueness, update user email, update request, log audit
  const result = await db.$transaction(async (tx) => {
    // Re-verify that target email is not currently taken by another user
    const conflictUser = await tx.user.findFirst({
      where: {
        email: {
          equals: request.newEmail,
          mode: "insensitive",
        },
        NOT: {
          id: request.userId,
        },
      },
    });

    if (conflictUser) {
      await tx.emailChangeRequest.update({
        where: { id: request.id },
        data: { status: "CONFLICT" },
      });
      throw new ApiError(409, "This email address is now associated with another account.");
    }

    // Fetch user for name and old email
    const currentUser = await tx.user.findUnique({
      where: { id: request.userId },
      select: { id: true, name: true, email: true },
    });

    if (!currentUser) {
      throw new ApiError(404, "User account no longer exists.");
    }

    const previousEmail = currentUser.email;

    // Update user's email
    const updatedUser = await tx.user.update({
      where: { id: request.userId },
      data: { email: request.newEmail },
      select: { id: true, name: true, email: true },
    });

    // Mark current request as VERIFIED
    await tx.emailChangeRequest.update({
      where: { id: request.id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    // Mark any remaining pending requests for this user as SUPERSEDED
    await tx.emailChangeRequest.updateMany({
      where: {
        userId: request.userId,
        status: "PENDING",
      },
      data: {
        status: "SUPERSEDED",
      },
    });

    // Record security audit log
    await tx.auditLog.create({
      data: {
        userId: request.userId,
        action: "user.email_changed",
        resource: "ProfileSecurity",
        details: {
          oldEmail: previousEmail,
          newEmail: request.newEmail,
          verifiedAt: new Date().toISOString(),
        },
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });

    return {
      user: updatedUser,
      oldEmail: previousEmail,
      newEmail: request.newEmail,
    };
  });

  // Post-transaction notifications
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in").replace(/\/$/, "");

  // 1. Notify OLD email address about the change (Critical security notification)
  try {
    await EmailService.send({
      to: result.oldEmail,
      templateKey: "EMAIL_CHANGE_SECURITY_ALERT",
      variables: {
        name: result.user.name,
        newEmail: result.newEmail,
        oldEmail: result.oldEmail,
      },
      metadata: {
        userId: result.user.id,
        action: "EMAIL_CHANGE_SECURITY_ALERT",
      },
    });
  } catch (oldEmailErr) {
    console.error("[ProfileSettingsService] Failed to notify old email address:", oldEmailErr);
  }

  // 2. Notify NEW email address confirming successful verification
  try {
    await EmailService.send({
      to: result.newEmail,
      templateKey: "EMAIL_CHANGE_CONFIRMED",
      variables: {
        name: result.user.name,
        newEmail: result.newEmail,
        link: `${appUrl}/login`,
      },
      metadata: {
        userId: result.user.id,
        action: "EMAIL_CHANGE_CONFIRMED",
      },
    });
  } catch (newEmailErr) {
    console.error("[ProfileSettingsService] Failed to confirm to new email address:", newEmailErr);
  }

  return {
    success: true,
    message: "Email address verified and updated successfully. Please log in with your new email address in future sessions.",
    newEmail: result.newEmail,
  };
}
