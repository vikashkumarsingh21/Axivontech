import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, invalidateUserPermissionCache } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

const deactivateBrokerSchema = z.object({
  reason: z.string().min(5, "Deactivation reason must be at least 5 characters"),
});

export async function POST(
  req: Request,
  props: { params: Promise<{ [key: string]: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const identifier = params.id;
    const body = await req.json();
    const { reason } = deactivateBrokerSchema.parse(body);

    const brokerUser = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { brokerProfile: { id: identifier } },
          { brokerProfile: { partnerId: identifier } },
        ],
        userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
      },
      include: {
        brokerProfile: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!brokerUser || !brokerUser.brokerProfile) {
      throw new ApiError(404, "Broker account not found.");
    }

    if (adminId === brokerUser.id) {
      throw new ApiError(400, "You cannot deactivate your own account.");
    }

    const isPrivileged = brokerUser.userRoles.some((ur) =>
      ["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(ur.role.name)
    );
    if (isPrivileged) {
      throw new ApiError(403, "Cannot deactivate privileged administrative accounts.");
    }

    const updatedBroker = await db.$transaction(async (tx) => {
      // 1. Update user to INACTIVE and record timestamp
      const u = await tx.user.update({
        where: { id: brokerUser.id },
        data: {
          status: "INACTIVE",
          inactiveAt: new Date(),
          activationToken: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          inactiveAt: true,
        },
      });

      // 2. Terminate all active sessions immediately
      await tx.session.deleteMany({
        where: { userId: brokerUser.id },
      });

      // 3. Record AuditLog
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "BROKER_DEACTIVATED",
          resource: `User:${brokerUser.id}`,
          details: {
            brokerId: brokerUser.id,
            brokerName: brokerUser.name,
            email: brokerUser.email,
            partnerId: brokerUser.brokerProfile?.partnerId,
            referralCode: brokerUser.brokerProfile?.referralCode,
            reason,
            sessionsRevoked: true,
            recordsPreserved: true,
          },
        },
      });

      return u;
    });

    // Invalidate cached auth permissions in-memory
    invalidateUserPermissionCache(brokerUser.id);

    return NextResponse.json({
      success: true,
      message: `Broker ${brokerUser.name} (${brokerUser.email}) has been deactivated. Login sessions revoked; all business and historical records preserved.`,
      data: updatedBroker,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
