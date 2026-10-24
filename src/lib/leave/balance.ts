import { db } from "@/lib/db";

export const DEFAULT_LEAVE_ALLOCATIONS: Record<string, number> = {
  CASUAL: 12,
  SICK: 12,
  PAID: 15,
  REMOTE: 24,
  UNPAID: 0,
};

export interface CalculatedLeaveDays {
  calendarDays: number;
  leaveDays: number;
}

export function calculateLeaveDays(
  start: Date,
  end: Date,
  isHalfDay?: boolean
): number {
  if (isHalfDay) return 0.5;
  const startMs = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endMs = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = endMs - startMs;
  if (diffTime < 0) return 0;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Ensures leave balance records exist for a user in the given year.
 */
export async function ensureLeaveBalances(userId: string, year: number) {
  const existing = await db.leaveBalance.findMany({
    where: { userId, year },
  });

  const existingTypes = new Set(existing.map((b) => b.leaveType));
  const missingTypes = Object.keys(DEFAULT_LEAVE_ALLOCATIONS).filter(
    (t) => !existingTypes.has(t)
  );

  if (missingTypes.length > 0) {
    await db.$transaction(
      missingTypes.map((t) =>
        db.leaveBalance.create({
          data: {
            userId,
            year,
            leaveType: t,
            totalDays: DEFAULT_LEAVE_ALLOCATIONS[t],
            usedDays: 0,
            pendingDays: 0,
            remainingDays: DEFAULT_LEAVE_ALLOCATIONS[t],
          },
        })
      )
    );
  }

  return db.leaveBalance.findMany({
    where: { userId, year },
  });
}

/**
 * Get leave balances summary formatted for client response.
 */
export async function getLeaveBalancesSummary(userId: string, year: number) {
  const balances = await ensureLeaveBalances(userId, year);
  const result: Record<
    string,
    {
      total: number;
      used: number;
      pending: number;
      remaining: number;
      available: number;
    }
  > = {};

  for (const b of balances) {
    result[b.leaveType.toLowerCase()] = {
      total: b.totalDays,
      used: b.usedDays,
      pending: b.pendingDays,
      remaining: b.remainingDays,
      available: Math.max(0, b.remainingDays - b.pendingDays),
    };
  }

  return result;
}
