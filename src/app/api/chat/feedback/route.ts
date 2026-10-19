import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";

    // Rate limit: 15 feedback ratings per hour per IP
    const rateCheck = isRateLimited(`chat_feedback:${ip}`, { windowMs: 60 * 60 * 1000, maxRequests: 15 });
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        { status: 429 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { conversationId, rating, comment, messageContent } = body;

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
    }

    if (rating !== "HELPFUL" && rating !== "NOT_HELPFUL") {
      return NextResponse.json(
        { error: "rating must be either 'HELPFUL' or 'NOT_HELPFUL'." },
        { status: 400 }
      );
    }

    const feedback = await db.chatFeedback.create({
      data: {
        conversationId: conversationId.slice(0, 100),
        rating,
        comment: typeof comment === "string" ? comment.trim().slice(0, 500) : null,
        messageContent: typeof messageContent === "string" ? messageContent.trim().slice(0, 500) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback!",
      id: feedback.id,
    });
  } catch (error) {
    console.error("[ChatFeedback API] Error persisting feedback:", error);
    return NextResponse.json({ error: "Failed to record feedback." }, { status: 500 });
  }
}
