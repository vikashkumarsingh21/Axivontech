import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");
    await validateActiveUser(userId);

    const { entityType, entityId } = await params;

    const activities = await db.activity.findMany({
      where: {
        entityType: entityType.toUpperCase(),
        entityId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      take: 50,
    });

    return NextResponse.json({ data: activities });
  } catch (error: any) {
    return handleApiError(error);
  }
}
