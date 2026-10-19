import { db } from "@/lib/db";

/**
 * Persist an audit event for AI Assistant operations
 */
export async function logPortalAIAudit(
  userId: string | null,
  action: string,
  resource: string,
  details: Record<string, any> = {},
  ipAddress?: string | null
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: userId || null,
        action: `AI_${action.toUpperCase()}`,
        resource,
        details: {
          timestamp: new Date().toISOString(),
          ...details,
        },
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    // Avoid crashing primary AI flows if audit logging experiences intermittent issues
    console.error("[PortalAIAudit] Failed to record audit log:", error);
  }
}
