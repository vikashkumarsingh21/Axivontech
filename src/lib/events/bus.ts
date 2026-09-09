import { db } from "@/lib/db";

// -----------------------------------------------------------------------
// Approved Phase 6 event types — only these can be emitted
// -----------------------------------------------------------------------
export const APPROVED_EVENT_TYPES = [
  "TASK_ASSIGNED",
  "TASK_UPDATED",
  "LEAVE_SUBMITTED",
  "LEAVE_UPDATED",
  "WORK_REPORT_SUBMITTED",
  "WORK_REPORT_REVIEWED",
  "NEW_LEAD",
  "FOLLOW_UP_DUE",
  "PROPOSAL_UPDATED",
  "ANNOUNCEMENT_PUBLISHED",
  "DOCUMENT_SHARED",
  "SECURITY_EVENT",
  "SYSTEM_EVENT",
] as const;

export type EventType = (typeof APPROVED_EVENT_TYPES)[number];

export interface PlatformEvent {
  eventType: EventType;
  actorId?: string | null;
  recipientId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  title?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  correlationId?: string | null;
}

// -----------------------------------------------------------------------
// NotificationService — creates in-app notifications with deduplication
// -----------------------------------------------------------------------
export class NotificationService {
  static async create(opts: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string | null;
    dedupKey?: string | null;
  }) {
    const {
      userId,
      type,
      title,
      message,
      link,
      entityType,
      entityId,
      priority = "NORMAL",
      dedupKey,
    } = opts;

    // Deduplication: prevent identical notifications within last 10 minutes
    if (dedupKey) {
      const existing = await db.notification.findFirst({
        where: {
          userId,
          dedupKey,
          createdAt: { gte: new Date(Date.now() - 10 * 60_000) },
        },
      });
      if (existing) return existing;
    }

    // Check user preferences — respect in-app notification setting
    const prefs = await db.userPreference.findUnique({ where: { userId } });
    // SECURITY_EVENT always bypasses preferences
    if (prefs && !prefs.inAppNotifications && type !== "SECURITY_EVENT") {
      return null;
    }

    return db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
        entityType: entityType || null,
        entityId: entityId || null,
        priority: (priority as any) || "NORMAL",
        dedupKey: dedupKey || null,
        isRead: false,
      },
    });
  }
}

// -----------------------------------------------------------------------
// ActivityService — records human-readable operational activity
// -----------------------------------------------------------------------
export class ActivityService {
  static async log(opts: {
    actorId?: string | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    summary: string;
    metadata?: Record<string, unknown> | null;
  }) {
    const { actorId, action, entityType = "SYSTEM", entityId, summary, metadata } = opts;

    return db.activity.create({
      data: {
        actorId: actorId || null,
        action,
        entityType: entityType || "SYSTEM",
        entityId: entityId || null,
        summary,
        metadata: (metadata as any) || undefined,
      },
    });
  }
}

// -----------------------------------------------------------------------
// EventBus — dispatches platform events to notification + activity + automation
// -----------------------------------------------------------------------
export class EventBus {
  static async emit(event: PlatformEvent): Promise<void> {
    const { eventType, actorId, recipientId, entityType, entityId, title, message, metadata, correlationId } =
      event;

    // Guard: only approved event types
    if (!(APPROVED_EVENT_TYPES as readonly string[]).includes(eventType)) {
      console.warn(`[EventBus] Rejected unapproved event type: ${eventType}`);
      return;
    }

    const dedupKey = correlationId
      ? `${eventType}::${correlationId}`
      : entityId
      ? `${eventType}::${entityId}::${recipientId || "system"}::${new Date().toISOString().slice(0, 13)}`
      : undefined;

    // 1. Create in-app notification for the recipient
    if (recipientId && title && message) {
      await NotificationService.create({
        userId: recipientId,
        type: eventType,
        title,
        message,
        entityType,
        entityId,
        priority: eventType === "SECURITY_EVENT" ? "URGENT" : "NORMAL",
        dedupKey,
      }).catch((err) => {
        console.error("[EventBus] Notification creation failed:", err?.message);
      });
    }

    // 2. Log to activity feed
    if (title) {
      await ActivityService.log({
        actorId,
        action: eventType,
        entityType: entityType || "SYSTEM",
        entityId,
        summary: message || title,
        metadata: metadata ? { ...metadata, correlationId } : { correlationId },
      }).catch((err) => {
        console.error("[EventBus] Activity log failed:", err?.message);
      });
    }

    // 3. Trigger automation engine
    try {
      const { AutomationEngine } = await import("@/lib/automations/engine");
      await AutomationEngine.trigger(eventType, {
        actorId,
        userId: recipientId,
        entityId,
        entityType,
        title,
        message,
        correlationId,
      });
    } catch (err: any) {
      console.error("[EventBus] Automation trigger failed:", err?.message);
    }
  }
}
