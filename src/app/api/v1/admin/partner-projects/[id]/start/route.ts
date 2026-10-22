import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { EmailService } from "@/lib/email/service";
import crypto from "crypto";

// BP-0904: Project Start and Client Account Creation
export async function POST(req: NextRequest, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "users:write");

    const body = await req.json().catch(() => ({}));
    const { projectOwnerId } = body; // Assume assigned owner is passed from UI

    const result = await db.$transaction(async (tx) => {
      const project = await tx.partnerProject.findUnique({
        where: { id },
        include: { brokerProfile: { select: { userId: true } } },
      });

      if (!project) throw new ApiError(404, "Project not found.");

      if (project.status === "IN_PROGRESS") {
        return { alreadyStarted: true, project };
      }

      if (project.status !== "APPROVED") {
        throw new ApiError(400, "Project must be APPROVED before it can be started.");
      }
      
      // Update project start info
      const startedProject = await tx.partnerProject.update({
        where: { id },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
          startedById: userId,
          projectOwnerId: projectOwnerId || project.projectOwnerId, // Can optionally assign during start
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "PROJECT_STARTED",
          resource: "PartnerProject",
          details: { projectId: id, projectCode: project.projectCode, ownerId: projectOwnerId },
        },
      });
      
      // BP-0904: Client Account Creation
      // Only create if there's no clientUserId linked and no existing user with that email
      const clientUserId = project.clientUserId;
      let isNewClient = false;
      let clientActivationToken: string | null = null;
      
      if (!clientUserId) {
        // Check if a user with this email already exists
        let clientUser = await tx.user.findUnique({
          where: { email: project.clientEmail },
        });

        if (!clientUser) {
          // BP-0905: Temporary credential logic
          // Generate a secure random token that will be sent via email
          const token = crypto.randomBytes(32).toString('hex');
          clientActivationToken = token;
          
          clientUser = await tx.user.create({
            data: {
              email: project.clientEmail,
              name: project.clientName,
              phone: project.clientPhone,
              passwordHash: "TEMPORARY_AWAITING_SETUP", // Not usable for normal login
              mustChangePassword: true,
              activationToken: token, 
              status: "PENDING_ACTIVATION",
            }
          });
          isNewClient = true;

          // Assign CLIENT role
          const clientRole = await tx.role.findUnique({ where: { name: "CLIENT" } });
          if (clientRole) {
            await tx.userRole.create({
              data: {
                userId: clientUser.id,
                roleId: clientRole.id,
              }
            });
          }
          
          // BP-0905: Create CrmClient profile as required for CRM integration (Phase 10 prep)
          await tx.crmClient.create({
            data: {
              clientCode: `CLI-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
              companyName: project.companyName,
              contactName: project.clientName,
              email: project.clientEmail,
              phone: project.clientPhone,
              website: project.website,
              industry: project.industry,
              ownerId: clientUser.id,
              status: "ONBOARDING"
            }
          });

          await tx.auditLog.create({
            data: {
              userId,
              action: "CLIENT_ACCOUNT_CREATED",
              resource: "User",
              details: { clientId: clientUser.id, projectId: id, projectCode: project.projectCode },
            },
          });
        }
        
        // Link client to project safely
        await tx.partnerProject.update({
          where: { id },
          data: { clientUserId: clientUser.id },
        });
      }

      if (project.brokerProfile?.userId) {
        await tx.notification.create({
          data: {
            userId: project.brokerProfile.userId,
            type: "SYSTEM",
            title: "Project Started",
            message: `Your project ${project.projectCode} has officially started! The client account has been prepared.`,
            link: `/broker/projects/${id}`,
          },
        });
      }

      return {
        project: startedProject,
        isNewClient,
        activationToken: clientActivationToken,
        clientEmail: project.clientEmail,
        clientName: project.clientName,
        companyName: project.companyName,
        projectName: project.projectName,
        projectCode: project.projectCode,
      };
    });

    // Send client onboarding activation email asynchronously if account was newly created
    if (result.isNewClient && result.activationToken) {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
      const activationLink = `${baseUrl}/client/activate?token=${result.activationToken}`;

      EmailService.send({
        to: result.clientEmail,
        templateKey: "CLIENT_ACCOUNT_ACTIVATION",
        variables: {
          name: result.clientName,
          companyName: result.companyName,
          projectName: result.projectName,
          projectCode: result.projectCode,
          activationLink,
          title: `Activate Your Axivon Client Portal — ${result.projectName}`,
          message: `Your project ${result.projectCode} (${result.projectName}) has officially commenced! Please activate your AXIVON ONE Client Portal account using the secure link below to review project deliverables, milestones, and sign-offs:\n\n${activationLink}`,
        },
      }).catch((err) => console.error("[StartProject] Client activation email dispatch error:", err));
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
