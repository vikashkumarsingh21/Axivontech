import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";

const bulkDeleteSchema = z.object({
  applicationIds: z.array(z.string()).min(1, "At least one application must be selected"),
  reason: z.string().min(5, "Deletion reason must be at least 5 characters"),
  revokePendingInvites: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "users:delete");

    const body = await req.json();
    const { applicationIds, reason, revokePendingInvites } = bulkDeleteSchema.parse(body);

    const applications = await db.businessPartnerApplication.findMany({
      where: {
        id: { in: applicationIds },
      },
      select: {
        id: true,
        applicationId: true,
        fullName: true,
        email: true,
        status: true,
      },
    });

    if (applications.length === 0) {
      throw new ApiError(404, "No matching applications found to delete.");
    }

    const emails = applications.map((a) => a.email.toLowerCase().trim());
    const linkedUsers = await db.user.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      include: { brokerProfile: true },
    });
    const userMap = new Map(linkedUsers.map((u) => [u.email.toLowerCase().trim(), u]));

    const results: {
      id: string;
      applicationId: string;
      fullName: string;
      success: boolean;
      message: string;
      linkedBrokerPreserved?: boolean;
    }[] = [];

    let deletedCount = 0;
    let failedCount = 0;

    for (const app of applications) {
      try {
        const u = userMap.get(app.email.toLowerCase().trim());
        let revokedPendingUser = false;

        await db.$transaction(async (tx) => {
          if (
            revokePendingInvites &&
            u &&
            u.status === "PENDING_ACTIVATION"
          ) {
            const leadsCount = await tx.lead.count({ where: { ownerId: u.id } });
            const projectsCount = u.brokerProfile
              ? await tx.partnerProject.count({ where: { brokerProfileId: u.brokerProfile.id } })
              : 0;

            if (leadsCount === 0 && projectsCount === 0) {
              await tx.session.deleteMany({ where: { userId: u.id } });
              await tx.userRole.deleteMany({ where: { userId: u.id } });
              if (u.brokerProfile) {
                await tx.brokerProfile.delete({ where: { id: u.brokerProfile.id } });
              }
              await tx.user.delete({ where: { id: u.id } });
              revokedPendingUser = true;
            }
          }

          // Delete application
          await tx.businessPartnerApplication.delete({
            where: { id: app.id },
          });

          // Audit Log
          await tx.auditLog.create({
            data: {
              userId,
              action: "BUSINESS_PARTNER_APPLICATION_DELETED",
              resource: `BusinessPartnerApplication:${app.applicationId}`,
              details: {
                applicationId: app.applicationId,
                applicantName: app.fullName,
                email: app.email,
                status: app.status,
                reason,
                bulk: true,
                linkedBrokerAccountPreserved: !!u && !revokedPendingUser,
                linkedBrokerPartnerId: u?.brokerProfile?.partnerId || null,
                revokedPendingUser,
              },
            },
          });
        });

        deletedCount++;
        results.push({
          id: app.id,
          applicationId: app.applicationId,
          fullName: app.fullName,
          success: true,
          message: "Deleted successfully",
          linkedBrokerPreserved: !!u && !revokedPendingUser,
        });
      } catch (err: any) {
        failedCount++;
        results.push({
          id: app.id,
          applicationId: app.applicationId,
          fullName: app.fullName,
          success: false,
          message: err.message || "Failed to delete",
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: applicationIds.length,
      deletedCount,
      failedCount,
      results,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
