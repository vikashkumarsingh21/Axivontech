import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const where: any = {};
    if (status) where.status = status;

    const leaves = await db.leaveRequest.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: leaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
