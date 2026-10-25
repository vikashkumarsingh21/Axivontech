import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { JobRunner } from "@/lib/jobs/runner";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");
    await requirePermission(adminId, "users:write");

    const { id } = params;

    const project = await db.partnerProject.findUnique({
      where: { id },
      include: {
        brokerProfile: {
          select: { partnerId: true, referralCode: true, user: { select: { name: true } } },
        },
      },
    });

    if (!project) throw new ApiError(404, "Partner project not found.");

    // Find client user by clientUserId or clientEmail
    let clientUser = project.clientUserId
      ? await db.user.findUnique({ where: { id: project.clientUserId } })
      : await db.user.findUnique({ where: { email: project.clientEmail } });

    const token = crypto.randomBytes(32).toString("hex");

    if (!clientUser) {
      // Create new client user and assign CLIENT role
      const clientRole = await db.role.findFirst({
        where: { name: "CLIENT" },
      });

      clientUser = await db.user.create({
        data: {
          email: project.clientEmail,
          name: project.clientName,
          phone: project.clientPhone,
          passwordHash: "TEMPORARY_AWAITING_SETUP",
          mustChangePassword: true,
          activationToken: token,
          status: "PENDING_ACTIVATION",
          userRoles: clientRole ? { create: { roleId: clientRole.id } } : undefined,
        },
      });

      // Link client user to project
      await db.partnerProject.update({
        where: { id },
        data: { clientUserId: clientUser.id },
      });
    } else {
      // Refresh activation token
      clientUser = await db.user.update({
        where: { id: clientUser.id },
        data: {
          activationToken: token,
          mustChangePassword: true,
          status: "PENDING_ACTIVATION",
        },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const activationLink = `${appUrl}/client/activate?token=${token}`;

    // Enqueue client credentials email
    await JobRunner.enqueue("SEND_EMAIL", {
      to: project.clientEmail,
      templateKey: "CLIENT_ACCOUNT_CREATION",
      variables: {
        clientName: project.clientName,
        projectName: project.projectName,
        projectCode: project.projectCode,
        activationLink,
        expiresIn: "7 days",
      },
    }).catch(() => null);

    // Audit log
    await db.auditLog.create({
      data: {
        userId: adminId,
        action: "CLIENT_ACTIVATION_RESENT",
        resource: `PartnerProject:${project.projectCode}`,
        details: {
          projectId: id,
          clientEmail: project.clientEmail,
          clientUserId: clientUser.id,
        },
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Activation link generated and email sent to ${project.clientEmail}`,
      activationLink,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
