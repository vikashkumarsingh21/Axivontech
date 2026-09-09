import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { canAccessDocument } from "@/lib/services/document.service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const user = await validateActiveUser(userId);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { isArchived: false };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const allDocs = await db.document.findMany({
      where,
      include: {
        uploadedBy: { select: { name: true, email: true } },
        permissions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const userRoles = user.userRoles.map((ur) => ur.role.name);
    const primaryRole = userRoles[0];

    // Filter documents based on server-side access control
    const accessibleDocs: typeof allDocs = [];
    for (const doc of allDocs) {
      const allowed = await canAccessDocument(doc.id, {
        userId: user.id,
        userDepartment: user.department,
        userRole: primaryRole,
      });
      if (allowed) {
        accessibleDocs.push(doc);
      }
    }

    return NextResponse.json({ data: accessibleDocs });
  } catch (e) {
    return handleApiError(e);
  }
}
