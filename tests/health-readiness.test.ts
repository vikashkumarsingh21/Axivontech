import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as healthGET } from "@/app/api/health/route";
import { GET as readyGET } from "@/app/api/ready/route";

vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
    attendancePolicy: {
      count: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";

describe("Health & Readiness Probes (/api/health and /api/ready)", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 OK from /api/health with system metrics", async () => {
    const res = await healthGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("OK");
    expect(data.uptime).toBeDefined();
    expect(data.memory).toBeDefined();
  });

  it("should return 200 READY from /api/ready when all checks pass", async () => {
    (db.$queryRaw as any).mockResolvedValueOnce([{ "?column?": 1 }]);
    (db.attendancePolicy.count as any).mockResolvedValueOnce(2);

    const res = await readyGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("READY");
    expect(data.checks.database.status).toBe("UP");
    expect(data.checks.attendancePolicy.status).toBe("UP");
  });

  it("should return 503 NOT_READY without exposing internal db errors when db fails", async () => {
    (db.$queryRaw as any).mockRejectedValueOnce(
      new Error("Can't reach database server at internal-neon-host.internal:5432 with user admin_secret")
    );
    (db.attendancePolicy.count as any).mockResolvedValueOnce(0);

    const res = await readyGET();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe("NOT_READY");
    expect(data.checks.database.status).toBe("DOWN");
    // Ensure raw connection string / internal host is NOT leaked
    expect(data.checks.database.error).toBe("Database connection failed");
    expect(JSON.stringify(data)).not.toContain("internal-neon-host");
    expect(JSON.stringify(data)).not.toContain("admin_secret");
  });
});
