import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    const posters = await db.loginPagePoster.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        altText: true,
        ctaLabel: true,
        ctaUrl: true,
        displayOrder: true,
      },
      orderBy: { displayOrder: "asc" },
      take: 10,
    });

    return NextResponse.json({ posters });
  } catch (error) {
    return handleApiError(error);
  }
}
