import { NextResponse } from "next/server";
import { JobRunner } from "@/lib/jobs/runner";
import { verifyCronRequest } from "@/lib/auth/cron";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    // Strictly verify cron authentication before any job scheduling or execution
    verifyCronRequest(req);

    // Enqueue the job so the background worker or POST /api/v1/admin/jobs can pick it up
    const job = await JobRunner.enqueue("INACTIVE_USER_CLEANUP");
    
    // Attempt to process it immediately if there is no separate background worker loop
    const results = await JobRunner.processPending();

    return NextResponse.json({ success: true, enqueued: job, processed: results });
  } catch (error: any) {
    return handleApiError(error);
  }
}

