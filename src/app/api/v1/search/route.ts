import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ data: [] });
    }

    const results: any[] = [];

    // 1. Search Tasks (Authorized to user or admin/executive)
    const taskWhere: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };
    if (userRole === "EMPLOYEE") {
      taskWhere.userId = userId;
    }
    const tasks = await db.task.findMany({ where: taskWhere, take: 5 });
    tasks.forEach((t) => results.push({ type: "Task", id: t.id, title: t.title, link: "/employee/tasks" }));

    // 2. Search Announcements (Publicly readable)
    const announcements = await db.announcement.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      take: 5,
    });
    announcements.forEach((a) => results.push({ type: "Announcement", id: a.id, title: a.title, link: "/employee/announcements" }));

    // 3. Search Employees (Admin or Executive only)
    if (userRole === "ADMIN" || userRole === "FOUNDER" || userRole === "CO_FOUNDER") {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      });
      users.forEach((u) => results.push({ type: "User", id: u.id, title: u.name + " (" + u.email + ")", link: "/admin/employees" }));
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    return handleApiError(error);
  }
}
