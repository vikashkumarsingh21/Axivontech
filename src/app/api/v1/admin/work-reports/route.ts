import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      db.workReport.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      db.workReport.count({ where }),
    ]);

    return NextResponse.json({ data: reports, meta: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
