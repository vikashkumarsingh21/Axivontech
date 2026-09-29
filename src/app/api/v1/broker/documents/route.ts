import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const brokerId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!brokerId || role !== "BROKER") {
      throw new ApiError(403, "Access denied. Brokers only.");
    }

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
