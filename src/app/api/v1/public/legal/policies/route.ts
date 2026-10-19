import { NextRequest, NextResponse } from "next/server";
import { getAllPublishedPolicies } from "@/lib/legal/legal-db";

export async function GET(req: NextRequest) {
  try {
    const policies = await getAllPublishedPolicies();
    return NextResponse.json({
      success: true,
      policies: policies.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        summary: p.summary,
        version: p.version,
        effectiveDate: p.effectiveDate,
        lastReviewedAt: p.lastReviewedAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load policies" }, { status: 500 });
  }
}
