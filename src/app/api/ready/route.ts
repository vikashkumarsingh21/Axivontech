import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "UP" | "DOWN"; latencyMs?: number; error?: string }> = {};
  let isReady = true;

  // 1. Database Health Check
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = {
      status: "UP",
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    isReady = false;
    checks.database = {
      status: "DOWN",
      latencyMs: Date.now() - dbStart,
      error: err.message,
    };
  }

  // 2. Attendance Policy Readiness Check
  try {
    const policyCount = await db.attendancePolicy.count();
    checks.attendancePolicy = {
      status: "UP",
      latencyMs: 0,
    };
  } catch (err: any) {
    checks.attendancePolicy = {
      status: "DOWN",
      error: err.message,
    };
  }

  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status: isReady ? "READY" : "NOT_READY",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: statusCode }
  );
}
