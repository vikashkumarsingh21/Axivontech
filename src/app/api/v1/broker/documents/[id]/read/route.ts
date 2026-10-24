import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { normalizeRole, canAccessPartnerPortal } from "@/lib/auth/roles";

export async function POST(req: Request, props: { params: Promise<{ [key: string]: string }> }) {
  const params = await props.params;
  try {
    const session = await getAuthenticatedSession(req);
    const role = normalizeRole(session.role);
    if (!canAccessPartnerPortal(role)) throw new ApiError(403, "Access denied.");
    const brokerId = session.userId;

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
