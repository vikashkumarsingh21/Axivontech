import { NextRequest, NextResponse } from "next/server";
import { getPublishedFaqs } from "@/lib/content/content-db";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const page = searchParams.get("page") || undefined;

    const faqs = await getPublishedFaqs(category, page);

    return NextResponse.json({
      success: true,
      faqs,
      count: faqs.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
