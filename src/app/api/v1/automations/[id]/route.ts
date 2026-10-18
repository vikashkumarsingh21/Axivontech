import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const updateAutomationSchema = z.object({
  name: z.string().min(1).optional(),
  triggerType: z.string().min(1).optional(),
  conditions: z.any().optional(),
  actions: z.any().optional(),
  isActive: z.boolean().optional(),
  emailTemplateKey: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.view");

    const { id } = await props.params;

    const workflow = await db.automationWorkflow.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        executions: {
          orderBy: { executedAt: "desc" },
          take: 20,
        },
      },
    });

    if (!workflow) {
      throw new ApiError(404, "Workflow not found");
    }

    return NextResponse.json({ success: true, workflow });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.manage");

    const { id } = await props.params;
    const body = await req.json();
    const parsed = updateAutomationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");
    }

    const existing = await db.automationWorkflow.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Workflow not found");
    }

    const { name, triggerType, conditions, actions, isActive, emailTemplateKey } = parsed.data;

    let mergedConditions = conditions !== undefined ? conditions : existing.conditions;
    if (emailTemplateKey !== undefined) {
      mergedConditions = {
        ...(typeof mergedConditions === "object" && mergedConditions ? mergedConditions : {}),
        emailTemplateKey,
      };
    }

    const updated = await db.automationWorkflow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(triggerType !== undefined && { triggerType }),
        ...(conditions !== undefined || emailTemplateKey !== undefined ? { conditions: mergedConditions } : {}),
        ...(actions !== undefined && { actions }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, workflow: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "automation.manage");

    const { id } = await props.params;

    const existing = await db.automationWorkflow.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "Workflow not found");
    }

    await db.automationWorkflow.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Workflow deleted successfully" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
