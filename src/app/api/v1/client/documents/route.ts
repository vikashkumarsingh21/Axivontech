import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { validateActiveUser } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "CLIENT") {
      throw new ApiError(403, "Access denied. Client account required.");
    }

    await validateActiveUser(userId);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Retrieve all documents belonging to projects assigned to this client
    const documents = await db.partnerDocument.findMany({
      where: {
        isClientVisible: true,
        partnerProject: {
          clientUserId: userId,
        },
        ...(category && category !== "ALL" ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        category: true,
        mimeType: true,
        sizeBytes: true,
        isImportant: true,
        createdAt: true,
        updatedAt: true,
        partnerProject: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return handleApiError(error);
  }
}
