import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  triggerType: z.enum(["TASK_OVERDUE", "LEAVE_SUBMITTED", "DOCUMENT_EXPIRING"]),
  conditions: z.any().optional(),
  actions: z.any().optional(),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automations.view").catch(() => {});

    const workflows = await db.automationWorkflow.findMany({
      include: { createdBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: workflows });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automations.create");

    const body = await req.json();
    const data = createAutomationSchema.parse(body);

    const workflow = await db.automationWorkflow.create({
      data: {
        name: data.name,
        triggerType: data.triggerType,
        conditions: data.conditions || {},
        actions: data.actions || {},
        createdById: userId,
      },
    });

    return NextResponse.json({ data: workflow }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
