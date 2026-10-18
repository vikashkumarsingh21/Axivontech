import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(403, "Access denied. Client account required.");
    }

    await validateActiveUser(userId);

    // Fetch support issues reported by this client or tied to projects owned by this client
    const issues = await db.qaIssue.findMany({
      where: {
        OR: [
          { reporterId: userId },
          { partnerProject: { clientUserId: userId } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        severity: true,
        resolvedAt: true,
        resolutionNotes: true,
        createdAt: true,
        updatedAt: true,
        partnerProject: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(403, "Access denied. Client account required.");
    }

    const clientUser = await validateActiveUser(userId);

    const body = await req.json().catch(() => ({}));
    const { projectId, subject, message, priority = "MEDIUM" } = body;

    if (!subject?.trim() || !message?.trim()) {
      throw new ApiError(400, "Subject and issue details are required.");
    }

    // Resolve target project: must belong to the client
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const firstProject = await db.partnerProject.findFirst({
        where: { clientUserId: userId },
        select: { id: true },
      });
      if (!firstProject) {
        throw new ApiError(400, "No active project found to associate with this ticket.");
      }
      targetProjectId = firstProject.id;
    } else {
      const verifyProject = await db.partnerProject.findFirst({
        where: { id: targetProjectId, clientUserId: userId },
      });
      if (!verifyProject) {
        throw new ApiError(403, "You do not have access to this project.");
      }
    }

    const issue = await db.$transaction(async (tx) => {
      const created = await tx.qaIssue.create({
        data: {
          partnerProjectId: targetProjectId,
          title: subject.trim(),
          description: message.trim(),
          severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority) ? priority : "MEDIUM",
          status: "OPEN",
          reporterId: userId,
        },
        include: {
          partnerProject: {
            select: {
              id: true,
              projectCode: true,
              projectName: true,
            },
          },
        },
      });

      // Notify internal admins/leads
      const adminRoles = await tx.userRole.findMany({
        where: {
          role: {
            name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER"] },
          },
        },
        select: { userId: true },
      });

      const adminUserIds = Array.from(new Set(adminRoles.map((r) => r.userId)));
      if (adminUserIds.length > 0) {
        await tx.notification.createMany({
          data: adminUserIds.map((adminId) => ({
            userId: adminId,
            type: priority === "CRITICAL" || priority === "HIGH" ? "WARNING" : "INFO",
            title: `Client Ticket: ${created.partnerProject.projectCode} — ${subject.trim()}`,
            message: `${clientUser.name} submitted a support request: "${message.trim().slice(0, 120)}"`,
            link: `/admin/crm/partner-projects/${targetProjectId}`,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: "CLIENT_SUPPORT_TICKET_CREATED",
          resource: "QaIssue",
          details: {
            issueId: created.id,
            projectId: targetProjectId,
            priority,
          },
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
