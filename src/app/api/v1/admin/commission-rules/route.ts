import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0),
  isActive: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");

    // We just ensure they have read access for admin routes
    await requirePermission(adminId, "users:read");

    const rules = await db.commissionRule.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: rules });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");

    await requirePermission(adminId, "users:write");

    const body = await req.json();
    const data = createSchema.parse(body);

    const rule = await db.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.commissionRule.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const newRule = await tx.commissionRule.create({
        data: {
          name: data.name,
          type: data.type,
          value: data.value,
          isActive: data.isActive,
          createdById: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "COMMISSION_RULE_CREATED",
          resource: "CommissionRule",
          details: { ruleId: newRule.id, name: newRule.name },
        },
      });

      return newRule;
    });

    return NextResponse.json({ data: rule }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
