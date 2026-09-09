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

    const where: any = { isArchived: false };
    if (category) where.category = category;

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

    const accessibleDocs = [];
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

    return NextResponse.json({ success: true, documents: accessibleDocs, data: accessibleDocs });
  } catch (e) {
    return handleApiError(e);
  }
}
