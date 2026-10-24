import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { normalizeRole, canAccessPartnerPortal } from "@/lib/auth/roles";

export async function GET(req: Request) {
  try {
    const session = await getAuthenticatedSession(req);
    const role = normalizeRole(session.role);

    if (!canAccessPartnerPortal(role)) {
      throw new ApiError(403, "Access denied. Partners only.");
    }

    const brokerId = session.userId;

    const brokerProfile = await db.brokerProfile.findUnique({ where: { userId: brokerId } });
    if (!brokerProfile) throw new ApiError(404, "Broker profile not found.");

    const documents = await db.partnerDocument.findMany({
      where: {
        OR: [
          { brokerProfileId: brokerProfile.id }, // targeted to this specific broker
          { brokerProfileId: null }              // shared with ALL brokers
        ]
      },
      orderBy: [
        { isImportant: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    return handleApiError(error);
  }
}
