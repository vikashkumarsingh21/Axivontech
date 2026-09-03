import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ data: announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, priority } = body;
    if (!title || !content) return NextResponse.json({ error: "title and content are required" }, { status: 400 });

    const announcement = await db.announcement.create({
      data: { title, content, priority: priority || "NORMAL" },
    });

    const adminId = req.headers.get("x-user-id");
    await db.auditLog.create({
      data: { userId: adminId, action: "ANNOUNCEMENT_PUBLISHED", resource: "Announcement", details: { announcementId: announcement.id, title } },
    });

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
