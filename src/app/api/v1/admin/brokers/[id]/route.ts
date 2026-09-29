import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateBrokerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  companyName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function PATCH(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "users:write");

    const brokerId = params.id;
    const body = await req.json();
    const validatedData = updateBrokerSchema.parse(body);

    const existingBroker = await db.user.findFirst({
      where: {
        id: brokerId,
        userRoles: { some: { role: { name: "BROKER" } } },
      },
      include: { brokerProfile: true },
    });

    if (!existingBroker) {
      throw new ApiError(404, "Broker not found.");
    }

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.status) {
      updateData.status = validatedData.status;
      updateData.inactiveAt = validatedData.status === "INACTIVE" ? new Date() : null;
    }
    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 10);
    }

    const brokerProfileUpdate: any = {};
    if (validatedData.companyName !== undefined) brokerProfileUpdate.companyName = validatedData.companyName;
    if (validatedData.designation !== undefined) brokerProfileUpdate.designation = validatedData.designation;
    if (validatedData.city !== undefined) brokerProfileUpdate.city = validatedData.city;
    if (validatedData.state !== undefined) brokerProfileUpdate.state = validatedData.state;
    if (validatedData.country !== undefined) brokerProfileUpdate.country = validatedData.country;
    if (validatedData.website !== undefined) brokerProfileUpdate.website = validatedData.website;

    if (Object.keys(brokerProfileUpdate).length > 0) {
      updateData.brokerProfile = {
        update: brokerProfileUpdate,
      };
    }

    const updatedBroker = await db.$transaction(async (tx) => {
      const result = await tx.user.update({
        where: { id: brokerId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          brokerProfile: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_UPDATED",
          resource: "User",
          details: {
            brokerId: result.id,
            updatedFields: Object.keys(validatedData),
          },
        },
      });

      return result;
    });

    return NextResponse.json({ data: updatedBroker });
  } catch (error: any) {
    return handleApiError(error);
  }
}
