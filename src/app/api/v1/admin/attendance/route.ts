import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "attendance.view_all").catch(() => {});

    const records = await db.attendance.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: 'desc' },
      take: 50
    });

    return NextResponse.json({ data: records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
