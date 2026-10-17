import { NextRequest, NextResponse } from "next/server";
import { getPublishedJobs, isCareersPageEnabled } from "@/lib/careers/careers-db";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const enabled = await isCareersPageEnabled();
    if (!enabled) {
      return NextResponse.json({
        success: true,
        count: 0,
        jobs: [],
        careersPageEnabled: false,
      });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const jobs = await getPublishedJobs({ department, search, limit });

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
