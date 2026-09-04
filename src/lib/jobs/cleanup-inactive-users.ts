import { db } from "@/lib/db";

export interface CleanupResult {
  processed: number;
  deletedUserIds: string[];
  skippedUserIds: string[];
  errors: string[];
}

export async function cleanupInactiveUsers(thirtyDaysMsOverride?: number): Promise<CleanupResult> {
  const result: CleanupResult = {
    processed: 0,
    deletedUserIds: [],
    skippedUserIds: [],
    errors: [],
  };

  const msIn30Days = thirtyDaysMsOverride ?? 30 * 24 * 60 * 60 * 1000;
  const thresholdDate = new Date(Date.now() - msIn30Days);

  try {
    // 1. Find inactive users eligible for cleanup
    const candidates = await db.user.findMany({
      where: {
        status: "INACTIVE",
        inactiveAt: {
          not: null,
          lte: thresholdDate,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        inactiveAt: true,
      },
    });

    for (const candidate of candidates) {
      result.processed++;

      try {
        // Double check safety criteria dynamically
        const freshUser = await db.user.findUnique({
          where: { id: candidate.id },
          select: { id: true, status: true, inactiveAt: true },
        });

        if (
          !freshUser ||
          freshUser.status !== "INACTIVE" ||
          !freshUser.inactiveAt ||
          freshUser.inactiveAt.getTime() > thresholdDate.getTime()
        ) {
          result.skippedUserIds.push(candidate.id);
          continue;
        }

        // 2. Perform safe cleanup & anonymization in transaction
        await db.$transaction(async (tx) => {
          // Delete transient records
          await tx.session.deleteMany({ where: { userId: candidate.id } });
          await tx.userPreference.deleteMany({ where: { userId: candidate.id } });
          await tx.reminder.deleteMany({ where: { userId: candidate.id } });
          await tx.notification.deleteMany({ where: { userId: candidate.id } });

          // Anonymize audit logs and security events (retain compliance trail without PII)
          await tx.auditLog.updateMany({
            where: { userId: candidate.id },
            data: { userId: null },
          });

          await tx.securityEvent.updateMany({
            where: { userId: candidate.id },
            data: { userId: null },
          });

          // Delete user record
          await tx.user.delete({
            where: { id: candidate.id },
          });
        });

        result.deletedUserIds.push(candidate.id);

        // Create background job audit log
        await db.auditLog.create({
          data: {
            action: "30_DAY_USER_CLEANUP_PERFORMED",
            resource: "User",
            details: {
              deletedUserId: candidate.id,
              deletedUserEmail: candidate.email,
              inactiveAt: candidate.inactiveAt,
            },
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`User ${candidate.id} cleanup failed: ${msg}`);
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Job execution error: ${msg}`);
  }

  return result;
}
