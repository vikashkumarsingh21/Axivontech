import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications/service";
import { NOTIFICATION_PRIORITIES } from "@/lib/notifications/types";

const managerSendNotificationSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional().default("NORMAL"),
  departmentId: z.string().optional().nullable(),
  targetUserIds: z.array(z.string()).optional().nullable(),
  link: z.string().max(500).optional().nullable(),
  channels: z.array(z.enum(["IN_APP", "PUSH", "EMAIL"])).optional().default(["IN_APP", "PUSH"]),
});

export async function POST(req: NextRequest) {
  try {
    let userId = req.headers.get("x-user-id");
    if (!userId) {
      try {
        const session = await getAuthenticatedSession(req);
        userId = session.userId;
      } catch {
        // Handled below
      }
    }

    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    // 1. Fetch user and roles
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user || user.status === "INACTIVE") {
      throw new ApiError(401, "User not found or inactive");
    }

    const roleNames = user.userRoles.map((ur) => ur.role.name.toUpperCase());
    const isSuperAdmin =
      roleNames.includes("ADMIN") ||
      roleNames.includes("FOUNDER") ||
      roleNames.includes("CO_FOUNDER");

    // 2. Resolve manager's authorized departments
    const managedDepts = await db.department.findMany({
      where: {
        OR: [
          { managerId: userId },
          { managers: { some: { userId } } },
        ],
      },
      select: { id: true, name: true, code: true },
    });

    // If not found in Department relations, check user's assigned department field
    const authorizedDeptIds = new Set<string>(managedDepts.map((d) => d.id));
    const authorizedDeptNames = new Set<string>(managedDepts.map((d) => d.name));
    const authorizedDeptCodes = new Set<string>(managedDepts.map((d) => d.code));

    if (user.department) {
      const matchDept = await db.department.findFirst({
        where: {
          OR: [{ id: user.department }, { name: user.department }, { code: user.department }],
        },
      });
      if (matchDept) {
        authorizedDeptIds.add(matchDept.id);
        authorizedDeptNames.add(matchDept.name);
        authorizedDeptCodes.add(matchDept.code);
      } else {
        authorizedDeptNames.add(user.department);
      }
    }

    const isManager =
      isSuperAdmin ||
      roleNames.includes("DEPARTMENT_MANAGER") ||
      roleNames.includes("MANAGER") ||
      authorizedDeptIds.size > 0;

    if (!isManager) {
      throw new ApiError(
        403,
        "Access denied: Only Department Managers and Administrators may send department announcements."
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = managerSendNotificationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid payload");
    }

    const {
      title,
      message,
      priority,
      departmentId,
      targetUserIds,
      link,
      channels,
    } = parsed.data;

    // 3. Strict Boundary Enforcement
    if (!isSuperAdmin) {
      // If a specific departmentId is requested, it MUST match the manager's authorized department
      if (
        departmentId &&
        !authorizedDeptIds.has(departmentId) &&
        !authorizedDeptNames.has(departmentId) &&
        !authorizedDeptCodes.has(departmentId)
      ) {
        throw new ApiError(
          403,
          "Access denied: Department managers are strictly restricted to sending announcements within their assigned department."
        );
      }
    }

    // Determine target recipient IDs
    let recipientUserIds: string[] = [];

    if (targetUserIds && targetUserIds.length > 0) {
      // Target specific users within the department
      const targetUsers = await db.user.findMany({
        where: {
          id: { in: targetUserIds },
          status: "ACTIVE",
        },
        select: { id: true, department: true },
      });

      // Verify that all targeted users belong to the manager's authorized department
      if (!isSuperAdmin) {
        for (const targetUser of targetUsers) {
          const inAuthDept =
            targetUser.department &&
            (authorizedDeptIds.has(targetUser.department) ||
              authorizedDeptNames.has(targetUser.department) ||
              authorizedDeptCodes.has(targetUser.department));

          if (!inAuthDept) {
            throw new ApiError(
              403,
              "Access denied: You cannot send announcements to employees outside your authorized department."
            );
          }
        }
      }

      recipientUserIds = targetUsers.map((u) => u.id);
    } else {
      // Broadcast to entire department
      const deptFilters: any[] = [];
      for (const id of authorizedDeptIds) deptFilters.push({ department: id });
      for (const name of authorizedDeptNames) deptFilters.push({ department: name });
      for (const code of authorizedDeptCodes) deptFilters.push({ department: code });

      const deptUsers = await db.user.findMany({
        where: {
          status: "ACTIVE",
          ...(deptFilters.length > 0 ? { OR: deptFilters } : {}),
        },
        select: { id: true },
      });

      recipientUserIds = deptUsers.map((u) => u.id);
    }

    if (recipientUserIds.length === 0) {
      throw new ApiError(400, "No active employees found in your authorized department");
    }

    // 4. Dispatch Notifications
    const dispatchResult = await NotificationService.sendToUsers(recipientUserIds, {
      type: "DEPARTMENT_ANNOUNCEMENT",
      title,
      message,
      category: "ANNOUNCEMENT",
      priority,
      link: link || null,
      channels,
    });

    return NextResponse.json({
      success: true,
      message: `Department announcement sent to ${dispatchResult.sent} team member(s)`,
      data: {
        sentCount: dispatchResult.sent,
        failedCount: dispatchResult.failed,
        totalRecipients: recipientUserIds.length,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
