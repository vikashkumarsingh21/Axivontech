import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const { id } = await params;
    const ann = await db.announcement.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });

    if (!ann) throw new ApiError(404, "Announcement not found");

    const userRoleNames = user.userRoles.map((ur) => ur.role.name);
    const isAdmin = userRoleNames.some((r) => ["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(r));

    if (!isAdmin) {
      if (ann.status !== "PUBLISHED") {
        throw new ApiError(403, "This announcement is not published");
      }
      if (ann.audienceType === "DEPARTMENT" && ann.audienceScope) {
        if (!user.department || ann.audienceScope.toLowerCase() !== user.department.toLowerCase()) {
          throw new ApiError(403, "You do not have access to this announcement");
        }
      }
      if (ann.audienceType === "ROLE" && ann.audienceScope) {
        if (!userRoleNames.includes(ann.audienceScope)) {
          throw new ApiError(403, "You do not have access to this announcement");
        }
      }
      if (ann.audienceType === "USERS" && ann.audienceScope) {
        if (!ann.audienceScope.split(",").map((s) => s.trim()).includes(user.id)) {
          throw new ApiError(403, "You do not have access to this announcement");
        }
      }
    }

    return NextResponse.json({ data: ann });
  } catch (e) {
    return handleApiError(e);
  }
}
