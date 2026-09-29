import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const brokerId = req.headers.get("x-user-id");
    if (!brokerId) throw new ApiError(401, "Unauthorized");

    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found");

    const document = await db.partnerDocument.findFirst({
      where: {
        id: params.id,
        OR: [{ brokerProfileId: brokerProfile.id }, { brokerProfileId: null }]
      }
    });

    if (!document) throw new ApiError(404, "Document not found or access denied.");

    await db.partnerDocument.update({
      where: { id: params.id },
      data: { isRead: true, readAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
