import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  subject: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "template.manage");

    const { id } = await params;
    const template = await db.communicationTemplate.findUnique({ where: { id } });
    if (!template) throw new ApiError(404, "Template not found");

    return NextResponse.json({ data: template });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "template.manage");

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateTemplateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const updated = await db.communicationTemplate.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "template.manage");

    const { id } = await params;
    await db.communicationTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Template deleted" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
