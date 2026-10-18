import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JobRunner } from "@/lib/jobs/runner";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const enqueueJobSchema = z.object({
  jobType: z.string().min(1, "jobType is required"),
  payload: z.any().optional(),
  scheduledAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const jobType = searchParams.get("jobType");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const where: any = {};
    if (status) where.status = status;
    if (jobType) where.jobType = jobType;

    const [jobs, stats] = await Promise.all([
      db.backgroundJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.backgroundJob.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const counts: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    };
    for (const s of stats) {
      counts[s.status] = s._count.id;
    }

    return NextResponse.json({
      success: true,
      jobs,
      counts,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const body = await req.json();
    const parsed = enqueueJobSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Validation error");
    }

    const { jobType, payload, scheduledAt } = parsed.data;
    const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date();

    const job = await JobRunner.enqueue(jobType, payload, scheduledDate);

    return NextResponse.json(
      {
        success: true,
        message: `Job ${jobType} enqueued successfully`,
        job,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
