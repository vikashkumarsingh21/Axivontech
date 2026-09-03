import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const createReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueAt: z.string().datetime().or(z.string()),
  type: z.enum(["TASK", "LEAVE", "APPROVAL", "DOCUMENT", "CUSTOM"]).optional().default("CUSTOM"),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const reminders = await db.reminder.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    });

    return NextResponse.json({ data: reminders });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const data = createReminderSchema.parse(body);

    const reminder = await db.reminder.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        dueAt: new Date(data.dueAt),
        type: data.type,
        status: "PENDING",
      },
    });

    return NextResponse.json({ data: reminder }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
