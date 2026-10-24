import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    const allowedRoles = ["CLIENT", "ADMIN", "FOUNDER", "CO_FOUNDER"];
    if (!userId || !role || !allowedRoles.includes(role)) {
      throw new ApiError(403, "Access denied.");
    }

    await validateActiveUser(userId);

    const isStaff = ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role);
    const where = isStaff ? {} : { clientUserId: userId };

    const projects = await db.partnerProject.findMany({
      where,
      select: {
        id: true,
        projectCode: true,
        projectName: true,
        status: true,
        progressPercentage: true,
        expectedDeliveryDate: true,
        requiredService: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}
