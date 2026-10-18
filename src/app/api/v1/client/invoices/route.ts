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

    const payments = await db.partnerPayment.findMany({
      where: {
        partnerProject: {
          clientUserId: userId,
        },
      },
      include: {
        partnerProject: {
          select: {
            id: true,
            projectCode: true,
            projectName: true,
            companyName: true,
            status: true,
            contract: {
              select: {
                id: true,
                status: true,
                versions: {
                  select: {
                    id: true,
                    versionNumber: true,
                    contractFileUrl: true,
                    signedFileUrl: true,
                    sentAt: true,
                  },
                  orderBy: {
                    versionNumber: "desc",
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return handleApiError(error);
  }
}
