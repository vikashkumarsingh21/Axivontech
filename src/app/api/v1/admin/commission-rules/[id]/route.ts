import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = req.headers.get("x-user-id");
    if (!adminId) throw new ApiError(401, "Unauthorized");

    await requirePermission(adminId, "users:write");
    const { id } = await params;

    const body = await req.json();
    const data = updateSchema.parse(body);

    const rule = await db.$transaction(async (tx) => {
      const existing = await tx.commissionRule.findUnique({ where: { id } });
      if (!existing) throw new ApiError(404, "Commission rule not found");

      if (data.isActive === true) {
        await tx.commissionRule.updateMany({
          where: { isActive: true, id: { not: id } },
          data: { isActive: false },
        });
      }

      const updatedRule = await tx.commissionRule.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "COMMISSION_RULE_UPDATED",
          resource: "CommissionRule",
          details: { ruleId: updatedRule.id, updates: data },
        },
      });

      return updatedRule;
    });

    return NextResponse.json({ data: rule });
  } catch (error) {
    return handleApiError(error);
  }
}
