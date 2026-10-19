import { NextRequest, NextResponse } from "next/server";
import { resolvePortalContext } from "@/lib/portal-ai/portal-context";
import { processPortalAIChat } from "@/lib/portal-ai/assistant-engine";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Active session required." }, { status: 401 });
    }

    // Rate limiting: 60 requests per 15 minutes per authenticated user
    const rateCheck = isRateLimited(`portal_ai:${userId}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 60,
    });
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment before sending more queries." },
        { status: 429 }
      );
    }

    // Resolve context & verify active user
    const ctx = await resolvePortalContext(userId);
    if (!ctx) {
      return NextResponse.json({ error: "Forbidden: Account inactive or invalid." }, { status: 403 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Message parameter is required." }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history : [];
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const response = await processPortalAIChat(message, ctx, history, ip);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("[PortalAI API] Unhandled error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your assistant request." },
      { status: 500 }
    );
  }
}
