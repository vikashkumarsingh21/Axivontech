import { NextRequest, NextResponse } from "next/server";
import { getPublishedJobBySlug, isCareersPageEnabled } from "@/lib/careers/careers-db";
import { handleApiError, ApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const enabled = await isCareersPageEnabled();
    if (!enabled) {
      throw new ApiError(404, "Recruitment is currently closed and this role is not available.");
    }

    const { slug } = await params;
    const job = await getPublishedJobBySlug(slug);

    if (!job) {
      throw new ApiError(404, "The requested job position was not found or is no longer accepting applications.");
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
