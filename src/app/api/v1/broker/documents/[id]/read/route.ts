import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, apiSuccess, apiError, handleApiError, ApiError } from "@/lib/api/broker";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { brokerProfile, session } = await requireBroker(req);

    const document = await db.partnerDocument.findFirst({
      where: {
        id,
        OR: [
          { brokerProfileId: brokerProfile.id },
          { brokerProfileId: null },
        ],
      },
    });

    if (!document) {
      throw new ApiError(404, "Document not found or access denied.");
    }

    const readTimestamp = new Date();

    if (document.brokerProfileId === brokerProfile.id) {
      // Direct broker-specific document: update document directly
      await db.partnerDocument.update({
        where: { id },
        data: { isRead: true, readAt: readTimestamp },
      });
    } else {
      // Broadcast document: store read state in OrganizationSetting key to protect other brokers
      const settingKey = `doc_reads:${brokerProfile.id}`;
      const existing = await db.organizationSetting.findUnique({
        where: { key: settingKey },
      });

      const currentMap: Record<string, string> =
        existing?.value && typeof existing.value === "object"
          ? (existing.value as Record<string, string>)
          : {};

      currentMap[id] = readTimestamp.toISOString();

      await db.organizationSetting.upsert({
        where: { key: settingKey },
        create: {
          key: settingKey,
          value: currentMap,
          description: `Document read history for broker ${brokerProfile.id}`,
        },
        update: {
          value: currentMap,
        },
      });
    }

    return apiSuccess({
      documentId: id,
      isRead: true,
      readAt: readTimestamp.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
