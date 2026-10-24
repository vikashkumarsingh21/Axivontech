import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireBroker, apiSuccess, handleApiError, ApiError } from "@/lib/api/broker";

const estimateSchema = z.object({
  budget: z.coerce.number().positive("Budget must be a positive number greater than 0."),
  serviceType: z.string().optional().default("CUSTOM_SOFTWARE"),
});

export async function POST(req: NextRequest) {
  try {
    await requireBroker(req);

    const body = await req.json().catch(() => ({}));
    const validated = estimateSchema.safeParse(body);
    if (!validated.success) {
      throw new ApiError(400, validated.error.errors[0]?.message || "Invalid input");
    }

    const { budget, serviceType } = validated.data;

    // Fetch active commission rule
    const activeRules = await db.commissionRule.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const rule = activeRules[0] || {
      id: "default-standard",
      name: "Standard Partner Commission",
      type: "PERCENTAGE",
      value: 10,
      description: "Default standard commission of 10% on confirmed project value",
    };

    let grossCommission = 0;
    if (rule.type === "PERCENTAGE") {
      grossCommission = Math.round(((budget * rule.value) / 100) * 100) / 100;
    } else {
      grossCommission = Math.round(rule.value * 100) / 100;
    }

    const tdsRate = 5; // Standard 5% under Section 194H
    const tdsAmount = Math.round(((grossCommission * tdsRate) / 100) * 100) / 100;
    const netPayout = Math.round((grossCommission - tdsAmount) * 100) / 100;

    return apiSuccess({
      input: {
        budget,
        serviceType,
      },
      ruleApplied: {
        id: rule.id,
        name: rule.name,
        type: rule.type,
        value: rule.value,
        description: rule.description,
      },
      estimate: {
        grossCommission,
        tdsRatePercentage: tdsRate,
        tdsAmount,
        netPayout,
        currency: "INR",
      },
      availableRules: activeRules.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        value: r.value,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
