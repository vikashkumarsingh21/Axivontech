import { db } from "@/lib/db";

/**
 * Scrub PII (emails, phone numbers) from logged question strings
 */
function sanitizeQuestionForLogging(question: string): string {
  const cleaned = question
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
    .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE]")
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[CARD]")
    .replace(/[^\w\s?.,\-\[\]]/gi, "")
    .trim()
    .slice(0, 250);

  return cleaned.toLowerCase();
}

/**
 * Log a knowledge gap to the persistent database
 */
export async function logKnowledgeGap(question: string, intent = "UNKNOWN"): Promise<void> {
  try {
    const cleaned = sanitizeQuestionForLogging(question);
    if (!cleaned || cleaned.length < 5) return;

    // Check for existing open gap with the same question
    const existing = await db.chatKnowledgeGap.findFirst({
      where: {
        question: cleaned,
        status: "OPEN",
      },
    });

    if (existing) {
      await db.chatKnowledgeGap.update({
        where: { id: existing.id },
        data: {
          frequency: existing.frequency + 1,
          updatedAt: new Date(),
        },
      });
    } else {
      await db.chatKnowledgeGap.create({
        data: {
          question: cleaned,
          intent,
          frequency: 1,
          status: "OPEN",
        },
      });
    }
  } catch (error) {
    console.error("[KnowledgeGapLogger] Failed to persist gap:", error);
  }
}

/**
 * Query knowledge gaps for admin review
 */
export async function getKnowledgeGaps(options: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  gaps: Array<{
    id: string;
    question: string;
    intent: string;
    frequency: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
  }>;
  total: number;
  pages: number;
}> {
  try {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.search) {
      where.question = { contains: options.search.toLowerCase() };
    }

    const [gaps, total] = await Promise.all([
      db.chatKnowledgeGap.findMany({
        where,
        orderBy: [{ frequency: "desc" }, { updatedAt: "desc" }],
        skip,
        take: limit,
      }),
      db.chatKnowledgeGap.count({ where }),
    ]);

    return {
      gaps,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[KnowledgeGapLogger] Failed to query gaps:", error);
    return { gaps: [], total: 0, pages: 0 };
  }
}

/**
 * Resolve or ignore a knowledge gap
 */
export async function updateKnowledgeGapStatus(
  id: string,
  status: "ADDRESSED" | "IGNORED" | "OPEN"
): Promise<boolean> {
  try {
    await db.chatKnowledgeGap.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "ADDRESSED" ? new Date() : null,
      },
    });
    return true;
  } catch (error) {
    console.error(`[KnowledgeGapLogger] Failed to update gap ${id}:`, error);
    return false;
  }
}
