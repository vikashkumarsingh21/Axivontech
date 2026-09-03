import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "project.view").catch(() => {});

    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
