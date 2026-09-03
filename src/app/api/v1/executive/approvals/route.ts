import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.role_changes.approve").catch(() => {});

    const approvals = await db.approvalRequest.findMany({
      include: {
        requestedBy: { select: { name: true, email: true } },
        decidedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: approvals });
  } catch (error: any) {
    return handleApiError(error);
  }
}
