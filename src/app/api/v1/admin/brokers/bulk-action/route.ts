import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, invalidateUserPermissionCache } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

const bulkBrokerActionSchema = z.object({
  action: z.enum(["DEACTIVATE", "DELETE"]),
  brokerIds: z.array(z.string().min(1)).min(1, "At least one broker ID is required").max(50, "Max 50 brokers per request"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  confirmationWord: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");

    const body = await req.json().catch(() => ({}));
    const { action, brokerIds, reason, confirmationWord } = bulkBrokerActionSchema.parse(body);

    if (action === "DEACTIVATE") {
      await requirePermission(adminId, "users:write");
    } else {
      await requirePermission(adminId, "users:delete");
      if (confirmationWord !== "DELETE") {
        throw new ApiError(400, "Confirmation word must be exactly 'DELETE' for permanent deletions.");
      }
    }

    const results: Array<{
      brokerId: string;
      status: "SUCCESS" | "SKIPPED" | "FAILED";
      message: string;
      dependencies?: Record<string, number>;
    }> = [];

    for (const brokerId of brokerIds) {
      try {
        const brokerUser = await db.user.findFirst({
          where: {
            OR: [
              { id: brokerId },
              { brokerProfile: { id: brokerId } },
              { brokerProfile: { partnerId: brokerId } },
            ],
            userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
          },
          include: {
            brokerProfile: true,
            userRoles: { include: { role: true } },
          },
        });

        if (!brokerUser || !brokerUser.brokerProfile) {
          results.push({
            brokerId,
            status: "FAILED",
            message: "Broker account not found.",
          });
          continue;
        }

        if (brokerUser.id === adminId) {
          results.push({
            brokerId,
            status: "SKIPPED",
            message: "Skipped: Cannot modify your own account.",
          });
          continue;
        }

        const isPrivileged = brokerUser.userRoles.some((ur) =>
          ["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(ur.role.name)
        );
        if (isPrivileged) {
          results.push({
            brokerId,
            status: "SKIPPED",
            message: "Skipped: Privileged administrative account.",
          });
          continue;
        }

        const brokerProfile = brokerUser.brokerProfile;

        if (action === "DEACTIVATE") {
          await db.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: brokerUser.id },
              data: {
                status: "INACTIVE",
                inactiveAt: new Date(),
                activationToken: null,
              },
            });

            await tx.session.deleteMany({
              where: { userId: brokerUser.id },
            });

            await tx.auditLog.create({
              data: {
                userId: adminId,
                action: "BROKER_DEACTIVATED",
                resource: `User:${brokerUser.id}`,
                details: {
                  brokerId: brokerUser.id,
                  brokerProfileId: brokerProfile.id,
                  email: brokerUser.email,
                  referralCode: brokerProfile.referralCode,
                  reason,
                  performedBy: adminId,
                  mode: "BULK",
                },
              },
            });
          });

          invalidateUserPermissionCache(brokerUser.id);
          results.push({
            brokerId,
            status: "SUCCESS",
            message: "Broker successfully deactivated; historical records preserved.",
          });
        } else {
          // DELETE action
          const [leadsCount, projectsCount, contractsCount, commissionsCount, documentsCount, clientCount] =
            await Promise.all([
              db.lead.count({ where: { ownerId: brokerUser.id } }),
              db.partnerProject.count({ where: { brokerProfileId: brokerProfile.id } }),
              db.partnerContract.count({
                where: { partnerProject: { brokerProfileId: brokerProfile.id } },
              }),
              db.commission.count({ where: { brokerProfileId: brokerProfile.id } }),
              db.partnerDocument.count({ where: { brokerProfileId: brokerProfile.id } }),
              db.crmClient.count({ where: { ownerId: brokerUser.id } }),
            ]);

          const totalDependencies =
            leadsCount + projectsCount + contractsCount + commissionsCount + documentsCount + clientCount;

          if (totalDependencies > 0) {
            results.push({
              brokerId,
              status: "SKIPPED",
              message: `Blocked: Broker has ${totalDependencies} associated records (${leadsCount} leads, ${projectsCount} projects, ${commissionsCount} commissions). Use Deactivation instead.`,
              dependencies: {
                leads: leadsCount,
                projects: projectsCount,
                contracts: contractsCount,
                commissions: commissionsCount,
                documents: documentsCount,
                clients: clientCount,
              },
            });
            continue;
          }

          // Zero dependencies -> permanent deletion
          await db.$transaction(async (tx) => {
            await tx.organizationSetting.deleteMany({
              where: {
                key: {
                  in: [`broker_ext:${brokerProfile.id}`, `broker_notes:${brokerUser.id}`],
                },
              },
            });

            await tx.brokerProfile.delete({
              where: { id: brokerProfile.id },
            });

            await tx.user.delete({
              where: { id: brokerUser.id },
            });

            await tx.auditLog.create({
              data: {
                userId: adminId,
                action: "BROKER_PERMANENTLY_DELETED",
                resource: `User:${brokerUser.id}`,
                details: {
                  deletedBrokerId: brokerUser.id,
                  deletedBrokerProfileId: brokerProfile.id,
                  deletedBrokerEmail: brokerUser.email,
                  deletedBrokerName: brokerUser.name,
                  deletedBrokerReferralCode: brokerProfile.referralCode,
                  reason,
                  performedBy: adminId,
                  mode: "BULK",
                },
              },
            });
          });

          invalidateUserPermissionCache(brokerUser.id);
          results.push({
            brokerId,
            status: "SUCCESS",
            message: "Broker permanently deleted.",
          });
        }
      } catch (err: any) {
        results.push({
          brokerId,
          status: "FAILED",
          message: err.message || "Failed to process broker action.",
        });
      }
    }

    const succeededCount = results.filter((r) => r.status === "SUCCESS").length;
    const skippedCount = results.filter((r) => r.status === "SKIPPED").length;
    const failedCount = results.filter((r) => r.status === "FAILED").length;

    return NextResponse.json({
      success: true,
      action,
      totalRequested: brokerIds.length,
      succeededCount,
      skippedCount,
      failedCount,
      results,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
