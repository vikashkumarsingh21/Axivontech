import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ data: notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, title, message, link } = body;
    if (!userId || !title || !message) return NextResponse.json({ error: "userId, title, and message are required" }, { status: 400 });

    const notification = await db.notification.create({
      data: { userId, type: type || "SYSTEM", title, message, link: link || null },
    });

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
