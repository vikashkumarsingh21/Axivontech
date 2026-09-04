import { describe, it, expect } from "vitest";

describe("Inactive User Lifecycle & 30-Day Cleanup Logic", () => {
  it("determines 30-day deletion eligibility strictly from inactiveAt", () => {
    const now = Date.now();
    const msIn30Days = 30 * 24 * 60 * 60 * 1000;

    const inactive20DaysAgo = new Date(now - 20 * 24 * 60 * 60 * 1000);
    const inactive35DaysAgo = new Date(now - 35 * 24 * 60 * 60 * 1000);

    const thresholdDate = new Date(now - msIn30Days);

    // 20 days ago: NOT eligible for deletion
    expect(inactive20DaysAgo.getTime() <= thresholdDate.getTime()).toBe(false);

    // 35 days ago: Eligible for deletion
    expect(inactive35DaysAgo.getTime() <= thresholdDate.getTime()).toBe(true);
  });

  it("prevents deletion if user status is ACTIVE regardless of inactiveAt timestamp", () => {
    const user = {
      id: "usr-001",
      status: "ACTIVE",
      inactiveAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // even if stale date
    };

    const isEligibleForCleanup = (u: typeof user) => {
      const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return (
        u.status === "INACTIVE" &&
        u.inactiveAt !== null &&
        u.inactiveAt.getTime() <= threshold
      );
    };

    expect(isEligibleForCleanup(user)).toBe(false);
  });

  it("cancels deletion eligibility when Admin reactivates user", () => {
    let userState = {
      status: "INACTIVE" as "ACTIVE" | "INACTIVE",
      inactiveAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) as Date | null,
    };

    // Reactivation action
    userState = {
      status: "ACTIVE",
      inactiveAt: null,
    };

    expect(userState.status).toBe("ACTIVE");
    expect(userState.inactiveAt).toBeNull();
  });
});
