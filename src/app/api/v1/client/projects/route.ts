import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

const clientProjectsCache = new Map<string, { data: any; expiresAt: number }>();

export function invalidateClientProjectsCache(userId?: string) {
  if (userId) clientProjectsCache.delete(userId);
  else clientProjectsCache.clear();
}

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    const allowedRoles = ["CLIENT", "ADMIN", "FOUNDER", "CO_FOUNDER"];
    if (!userId || !role || !allowedRoles.includes(role)) {
      throw new ApiError(403, "Access denied.");
    }

    const nowMs = Date.now();
    const cacheKey = `${userId}:${role}`;
    const cached = clientProjectsCache.get(cacheKey);
    if (cached && cached.expiresAt > nowMs) {
      return NextResponse.json({ data: cached.data });
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

    clientProjectsCache.set(cacheKey, { data: projects, expiresAt: Date.now() + 30_000 });

    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleApiError(error);
  }
}
