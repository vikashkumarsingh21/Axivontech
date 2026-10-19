import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { seedInitialKnowledge } from "@/lib/chatbot/knowledge-base";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "admin:access");

    const result = await seedInitialKnowledge(userId);

    return NextResponse.json({
      success: result.success,
      message: `Knowledge seeding complete: ${result.seededCount} records created, ${result.skippedCount} existing records preserved.`,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
