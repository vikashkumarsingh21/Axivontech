import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const now = new Date();

    // Fetch published announcements that have not expired
    const allPublished = await db.announcement.findMany({
      where: {
        status: "PUBLISHED",
        publishAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { publishAt: "desc" },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });

    // Filter by audience targeting
    const userRoleNames = user.userRoles.map((ur) => ur.role.name);
    const userDepartment = user.department;

    const filtered = allPublished.filter((ann) => {
      if (ann.audienceType === "ALL") return true;
      if (ann.audienceType === "DEPARTMENT" && ann.audienceScope) {
        return userDepartment && ann.audienceScope.toLowerCase() === userDepartment.toLowerCase();
      }
      if (ann.audienceType === "ROLE" && ann.audienceScope) {
        return userRoleNames.includes(ann.audienceScope);
      }
      if (ann.audienceType === "USERS" && ann.audienceScope) {
        return ann.audienceScope.split(",").map((s) => s.trim()).includes(user.id);
      }
      return true;
    });

    return NextResponse.json({ success: true, data: filtered, announcements: filtered });
  } catch (e) {
    return handleApiError(e);
  }
}
