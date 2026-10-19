import { NextRequest, NextResponse } from "next/server";
import { getPublishedPolicyBySlug } from "@/lib/legal/legal-db";

interface RouteParams {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const policy = await getPublishedPolicyBySlug(slug);

    if (!policy) {
      return NextResponse.json({ error: "Policy not found or not published" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, policy },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch policy" }, { status: 500 });
  }
}
