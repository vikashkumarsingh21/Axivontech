import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api-error";

// Schema for updating profile - strictly allowed fields only
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number too long")
      .regex(/^[+0-9\s-]*$/, "Invalid phone number format")
      .optional()
      .nullable(),
    avatarUrl: z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .max(500)
      .optional()
      .nullable(),
    address: z.string().trim().max(255, "Address too long").optional().nullable(),
    emergencyContact: z
      .string()
      .trim()
      .max(100, "Emergency contact too long")
      .optional()
      .nullable(),
  })
  .strict(); // Rejects forbidden fields like role, permissions, employeeId, status, etc.

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getEmployeeProfile(userId: string) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
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
    throw new ApiError(404, "Employee profile not found");
  }

  const role = user.userRoles.length > 0 ? user.userRoles[0].role.name : "EMPLOYEE";

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    employeeId: user.employeeId || "EMP-" + user.id.slice(-6).toUpperCase(),
    department: user.department || "Engineering",
    designation: user.designation || "Full-Stack Specialist",
    address: user.address,
    emergencyContact: user.emergencyContact,
    status: user.status,
    joiningDate: user.joiningDate,
    organizationName: user.organization?.name || "Axivon Technologies",
    role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateEmployeeProfile(
  userId: string,
  rawInput: unknown,
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
) {
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Parse and validate strictly allowed fields
  const data = updateProfileSchema.parse(rawInput);

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  // Prepare sanitized update payload
  const updatePayload: Record<string, any> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
  if (data.address !== undefined) updatePayload.address = data.address;
  if (data.emergencyContact !== undefined) updatePayload.emergencyContact = data.emergencyContact;

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: updatePayload,
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
      updatedAt: true,
    },
  });

  // Audit Log
  try {
    await db.auditLog.create({
      data: {
        userId,
        action: "employee.profile_updated",
        resource: "Profile",
        details: { updatedFields: Object.keys(data) },
        ipAddress: metadata?.ipAddress || "unknown",
        userAgent: metadata?.userAgent || "unknown",
      },
    });
  } catch (auditErr) {
    console.error("Failed to record audit log for profile update:", auditErr);
  }

  return updatedUser;
}
