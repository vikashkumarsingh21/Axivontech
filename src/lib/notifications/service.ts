import { db } from "@/lib/db";
import {
  NotificationCategory,
  NotificationPriority,
  NotificationType,
  RecipientType,
  SendNotificationOptions,
  NotificationDeliveryResult,
} from "./types";
import { sendPushNotification, getUserDeviceTokens } from "./push";
import { sendTransactionalEmail } from "@/lib/email/service";

/**
 * Axivon Technologies — Central Notification Service
 *
 * Unified multi-channel dispatcher:
 * - In-App Notifications (persisted to db.notification)
 * - Android Push Notifications (via FCM and Capacitor push tokens)
 * - Transactional Email (via central email service)
 *
 * Enforces:
 * - User notification preferences
 * - Idempotency & 24h deduplication
 * - Role & department isolation
 * - Non-blocking asynchronous delivery
 */

export class NotificationService {
  /**
   * Dispatches a notification to a single user across their enabled channels.
   */
  static async sendToUser(
    userId: string,
    options: SendNotificationOptions
  ): Promise<NotificationDeliveryResult> {
    const result: NotificationDeliveryResult = {
      inApp: false,
      push: { attempted: false, sentCount: 0, failedCount: 0 },
      email: { attempted: false, sent: false },
    };

    try {
      // 1. Fetch user & preferences
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          userPreference: true,
        },
      });

      if (!user || user.status === "INACTIVE") {
        return result;
      }

      const pref = user.userPreference;
      const inAppEnabled = pref?.inAppNotifications !== false;
      const emailEnabled = pref?.emailNotifications !== false;

      // 2. Check deduplication key (within last 24h)
      if (options.dedupKey) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await db.notification.findFirst({
          where: {
            userId,
            dedupKey: options.dedupKey,
            createdAt: { gte: oneDayAgo },
          },
        });

        if (existing) {
          // Already sent recently, avoid spam
          return result;
        }
      }

      // 3. Dispatch In-App Notification
      const targetChannels = options.channels || ["IN_APP", "PUSH"];
      if (inAppEnabled && targetChannels.includes("IN_APP")) {
        try {
          await db.notification.create({
            data: {
              userId,
              type: options.type,
              title: options.title,
              message: options.message,
              link: options.link || null,
              priority: options.priority || "NORMAL",
              entityType: options.entityType || options.category || null,
              entityId: options.entityId || null,
              dedupKey: options.dedupKey || null,
            },
          });
          result.inApp = true;
        } catch (dbErr) {
          console.error("[NotificationService] In-App creation failed:", dbErr);
        }
      }

      // 4. Dispatch Push Notification (Android/Mobile)
      if (targetChannels.includes("PUSH")) {
        try {
          const deviceTokens = await getUserDeviceTokens(userId);
          if (deviceTokens.length > 0) {
            result.push.attempted = true;
            const pushPriority =
              options.priority === "URGENT" || options.priority === "HIGH" ? "high" : "normal";
            const pushResult = await sendPushNotification(
              deviceTokens.map((t) => t.token),
              {
                title: options.title,
                body: options.message,
                category: options.category || "GENERAL",
                priority: pushPriority,
                link: options.link || null,
                data: {
                  entityType: options.entityType || options.category || "",
                  entityId: options.entityId || "",
                  ...(options.metadata
                    ? Object.fromEntries(
                        Object.entries(options.metadata).map(([k, v]) => [k, String(v)])
                      )
                    : {}),
                },
              }
            );
            result.push.sentCount = pushResult.sentCount;
            result.push.failedCount = pushResult.failedCount;
            result.push.errors = pushResult.errors;
          }
        } catch (pushErr: any) {
          console.warn("[NotificationService] Push delivery warning:", pushErr?.message);
        }
      }

      // 5. Dispatch Email Notification (if requested or urgent)
      const shouldEmail =
        options.sendEmail ||
        targetChannels.includes("EMAIL") ||
        options.priority === "URGENT";

      if (shouldEmail && emailEnabled && user.email) {
        try {
          result.email.attempted = true;
          const templateKey = options.emailTemplateKey || "GENERAL_NOTIFICATION";
          await sendTransactionalEmail({
            to: user.email,
            templateKey,
            variables: {
              userName: user.name || "Team Member",
              title: options.title,
              message: options.message,
              actionUrl: options.link || "https://axivontech.in/login",
              actionLabel: options.actionLabel || "View Notification",
              priority: options.priority || "NORMAL",
              ...(options.emailVariables || {}),
            },
            idempotencyKey: options.dedupKey || undefined,
          });
          result.email.sent = true;
        } catch (emailErr: any) {
          result.email.error = emailErr?.message || "Email dispatch failed";
          console.warn("[NotificationService] Email delivery warning:", emailErr?.message);
        }
      }
    } catch (err) {
      console.error("[NotificationService] Uncaught error sending notification:", err);
    }

    return result;
  }

  /**
   * Dispatches notifications to an array of specific user IDs.
   */
  static async sendToUsers(
    userIds: string[],
    options: SendNotificationOptions
  ): Promise<{ total: number; sent: number; failed: number }> {
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    let sent = 0;
    let failed = 0;

    await Promise.allSettled(
      uniqueIds.map(async (uid) => {
        try {
          const res = await NotificationService.sendToUser(uid, options);
          if (res.inApp || res.push.sentCount > 0 || res.email.sent) {
            sent++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      })
    );

    return { total: uniqueIds.length, sent, failed };
  }

  /**
   * Dispatches notifications to all active users with a specified role.
   */
  static async sendToRole(
    roleName: string,
    options: SendNotificationOptions
  ): Promise<{ total: number; sent: number }> {
    const roleUsers = await db.user.findMany({
      where: {
        status: "ACTIVE",
        userRoles: {
          some: {
            role: {
              name: roleName.toUpperCase(),
            },
          },
        },
      },
      select: { id: true },
    });

    const userIds = roleUsers.map((u) => u.id);
    const summary = await NotificationService.sendToUsers(userIds, options);
    return { total: userIds.length, sent: summary.sent };
  }

  /**
   * Dispatches notifications to all active users assigned to a specific department.
   */
  static async sendToDepartment(
    departmentId: string,
    options: SendNotificationOptions
  ): Promise<{ total: number; sent: number }> {
    // Find department name or code for matching legacy user.department string or relations
    const dept = await db.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true, code: true },
    });

    const whereOr: any[] = [];
    if (dept) {
      whereOr.push({ department: dept.name });
      whereOr.push({ department: dept.code });
      whereOr.push({ department: dept.id });
    } else {
      whereOr.push({ department: departmentId });
    }

    const deptUsers = await db.user.findMany({
      where: {
        status: "ACTIVE",
        OR: whereOr,
      },
      select: { id: true },
    });

    const userIds = deptUsers.map((u) => u.id);
    const summary = await NotificationService.sendToUsers(userIds, options);
    return { total: userIds.length, sent: summary.sent };
  }

  /**
   * Dispatches notifications to all active users across the entire organization.
   */
  static async sendToOrganization(
    options: SendNotificationOptions
  ): Promise<{ total: number; sent: number }> {
    const allUsers = await db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    const userIds = allUsers.map((u) => u.id);
    const summary = await NotificationService.sendToUsers(userIds, options);
    return { total: userIds.length, sent: summary.sent };
  }

  /**
   * Resolves audience for manual notification broadcasting.
   */
  static async resolveAudience(
    recipientType: RecipientType,
    targets?: {
      userId?: string;
      userIds?: string[];
      role?: string;
      departmentId?: string;
    }
  ): Promise<string[]> {
    switch (recipientType) {
      case "SPECIFIC_USER":
        return targets?.userId ? [targets.userId] : [];

      case "MULTIPLE_USERS":
        return targets?.userIds || [];

      case "SELECTED_ROLE": {
        if (!targets?.role) return [];
        const users = await db.user.findMany({
          where: {
            status: "ACTIVE",
            userRoles: {
              some: { role: { name: targets.role.toUpperCase() } },
            },
          },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }

      case "SELECTED_DEPARTMENT": {
        if (!targets?.departmentId) return [];
        const dept = await db.department.findUnique({
          where: { id: targets.departmentId },
          select: { id: true, name: true, code: true },
        });
        const users = await db.user.findMany({
          where: {
            status: "ACTIVE",
            OR: [
              { department: dept?.name || targets.departmentId },
              { department: dept?.code || targets.departmentId },
              { department: targets.departmentId },
            ],
          },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }

      case "ALL_EMPLOYEES": {
        const users = await db.user.findMany({
          where: {
            status: "ACTIVE",
            userRoles: {
              some: { role: { name: "EMPLOYEE" } },
            },
          },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }

      case "ALL_BROKERS": {
        const users = await db.user.findMany({
          where: {
            status: "ACTIVE",
            userRoles: {
              some: { role: { name: "BROKER" } },
            },
          },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }

      case "ALL_MANAGERS": {
        const managers = await db.departmentManager.findMany({
          select: { userId: true },
        });
        const users = await db.user.findMany({
          where: {
            status: "ACTIVE",
            OR: [
              { id: { in: managers.map((m) => m.userId) } },
              {
                userRoles: {
                  some: { role: { name: "DEPARTMENT_MANAGER" } },
                },
              },
            ],
          },
          select: { id: true },
        });
        return Array.from(new Set(users.map((u) => u.id)));
      }

      case "FOUNDERS": {
        const users = await db.user.findMany({
          where: {
            status: "ACTIVE",
            userRoles: {
              some: {
                role: {
                  name: { in: ["FOUNDER", "CO_FOUNDER", "ADMIN"] },
                },
              },
            },
          },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }

      case "ALL_ACTIVE_USERS":
      default: {
        const users = await db.user.findMany({
          where: { status: "ACTIVE" },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }
    }
  }

  /**
   * Records a broadcast history record in OrganizationSetting for auditing and read analytics.
   */
  static async recordBroadcastHistory(record: {
    id: string;
    senderId: string;
    senderName?: string;
    title: string;
    message: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    recipientType: RecipientType;
    targetName?: string;
    recipientUserIds: string[];
    sentCount: number;
    createdAt: string;
  }) {
    try {
      const key = `notification_broadcast:${record.id}`;
      await db.organizationSetting.create({
        data: {
          key,
          value: record as any,
        },
      });
    } catch (e) {
      console.warn("[NotificationService] Could not store broadcast history record:", e);
    }
  }

  /**
   * Fetches broadcast history with live read statistics.
   */
  static async getBroadcastHistory(limit: number = 20) {
    try {
      const records = await db.organizationSetting.findMany({
        where: { key: { startsWith: "notification_broadcast:" } },
        orderBy: { updatedAt: "desc" },
        take: limit,
      });

      const parsed = [];
      for (const r of records) {
        if (r.value && typeof r.value === "object") {
          const item = r.value as any;
          // Calculate read count
          if (Array.isArray(item.recipientUserIds) && item.recipientUserIds.length > 0) {
            const readCount = await db.notification.count({
              where: {
                userId: { in: item.recipientUserIds },
                title: item.title,
                isRead: true,
              },
            });
            item.readCount = readCount;
            item.readPercentage = Math.round(
              (readCount / Math.max(1, item.sentCount || item.recipientUserIds.length)) * 100
            );
          } else {
            item.readCount = 0;
            item.readPercentage = 0;
          }
          parsed.push(item);
        }
      }

      return parsed.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.error("[NotificationService] Failed to load broadcast history:", err);
      return [];
    }
  }
}
