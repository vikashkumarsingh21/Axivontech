import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, getBrokerPagination, apiSuccess, apiError, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { page, limit, skip } = getBrokerPagination(req);
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();

    // 1. Fetch broker's personal broadcast document read status map
    let broadcastReads: Record<string, string> = {};
    try {
      const readRecord = await db.organizationSetting.findUnique({
        where: { key: `doc_reads:${brokerProfile.id}` },
      });
      if (readRecord?.value && typeof readRecord.value === "object") {
        broadcastReads = readRecord.value as Record<string, string>;
      }
    } catch {
      // Graceful fallback if setting record does not exist
      broadcastReads = {};
    }

    // 2. Build where filter ensuring broker only sees their own or shared documents
    const where: any = {
      OR: [
        { brokerProfileId: brokerProfile.id }, // targeted specifically to this broker
        { brokerProfileId: null },             // broadcast / shared with ALL brokers
      ],
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [documents, totalCount] = await Promise.all([
      db.partnerDocument.findMany({
        where,
        orderBy: [
          { isImportant: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      db.partnerDocument.count({ where }),
    ]);

    // 3. Compute accurate per-broker read status and unread count
    const allBrokerDocs = await db.partnerDocument.findMany({
      where: {
        OR: [
          { brokerProfileId: brokerProfile.id },
          { brokerProfileId: null },
        ],
      },
      select: { id: true, brokerProfileId: true, isRead: true, category: true },
    });

    let totalUnread = 0;
    const categoriesSet = new Set<string>();

    for (const doc of allBrokerDocs) {
      if (doc.category) categoriesSet.add(doc.category);
      const isDocRead = doc.brokerProfileId === brokerProfile.id
        ? doc.isRead
        : Boolean(broadcastReads[doc.id]);
      if (!isDocRead) totalUnread++;
    }

    const projectedDocs = documents.map((doc) => {
      const isDocRead = doc.brokerProfileId === brokerProfile.id
        ? doc.isRead
        : Boolean(broadcastReads[doc.id]);
      const readAtTime = doc.brokerProfileId === brokerProfile.id
        ? doc.readAt
        : (broadcastReads[doc.id] ? new Date(broadcastReads[doc.id]) : null);

      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        fileUrl: doc.fileUrl,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        isImportant: doc.isImportant,
        isRead: isDocRead,
        readAt: readAtTime,
        isBroadcast: doc.brokerProfileId === null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    return apiSuccess({
      documents: projectedDocs,
      categories: Array.from(categoriesSet),
      unreadCount: totalUnread,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
