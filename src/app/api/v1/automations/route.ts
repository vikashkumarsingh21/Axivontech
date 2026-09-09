import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  triggerType: z.string().min(1, "Trigger type is required"),
  conditions: z.any().optional(),
  actions: z.any().optional(),
  emailTemplateKey: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.view").catch(() => {});

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
    await requirePermission(userId, "automation.manage");

    const body = await req.json();
    const parsed = createAutomationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }

    const data = parsed.data;

    const workflow = await db.automationWorkflow.create({
      data: {
        name: data.name,
        triggerType: data.triggerType,
        conditions: data.emailTemplateKey
          ? { ...(data.conditions || {}), emailTemplateKey: data.emailTemplateKey }
          : data.conditions || {},
        actions: data.actions || ["CREATE_NOTIFICATION"],
        isActive: data.isActive ?? true,
        createdById: userId,
      },
    });

    return NextResponse.json({ data: workflow }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
