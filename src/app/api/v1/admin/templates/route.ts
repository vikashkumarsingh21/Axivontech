import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const TemplateSchema = z.object({
  key: z.string().min(1).max(100),
  category: z.enum(["EMAIL", "NOTIFICATION", "DOCUMENT", "SYSTEM"]),
  name: z.string().min(1).max(150),
  subject: z.string().nullable().optional(),
  content: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "template.manage");

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;

    const templates = await db.communicationTemplate.findMany({
      where,
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ data: templates });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await requirePermission(userId, "template.manage");

    const body = await req.json();
    const parsed = TemplateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed");

    const template = await db.communicationTemplate.create({
      data: parsed.data,
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
