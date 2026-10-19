import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPublishedKnowledge,
  getDynamicPortfolioKnowledge,
  generateConversationSummary,
  scoreLead,
} from "@/lib/chatbot/knowledge-base";
import {
  createConversation,
  getConversation,
  updateConversation,
} from "@/lib/chatbot/conversation-manager";
import { generateResponse, sanitizeUserInput } from "@/lib/chatbot/ai-engine";
import { createChatbotLead } from "@/lib/chatbot/crm-integration";
import { isRateLimited } from "@/lib/rate-limit";

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";

    // 1. Rate limiting: 30 messages per IP per 15 minutes
    const rateCheck = isRateLimited(`chat:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 30 });
    if (rateCheck.limited) {
      return NextResponse.json(
        {
          reply: "You're sending messages a bit too quickly. Please pause for a moment before continuing.",
          isRateLimited: true,
        },
        { status: 429 }
      );
    }

    // 2. Check if Chatbot is administratively enabled
    try {
      const setting = await db.organizationSetting.findUnique({
        where: { key: "CHATBOT_CONFIG" },
      });
      if (setting && typeof setting.value === "object" && setting.value !== null) {
        const config = setting.value as any;
        if (config.enabled === false) {
          return NextResponse.json({
            reply:
              "Our AI Assistant is currently undergoing scheduled maintenance. Please reach out directly to info@axivontech.in or +91 9473263768.",
            disabled: true,
          });
        }
      }
    } catch (settingErr) {
      // Continue if setting check fails
    }

    // 3. Parse and validate request body
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const rawMessages: Array<{ role: string; content: string }> = Array.isArray(body.messages)
      ? (body.messages as Array<{ role: string; content: string }>)
      : [];
    const incomingId = typeof body.conversationId === "string" ? body.conversationId.trim() : undefined;

    let userMessageText = "";
    if (typeof body.message === "string" && body.message.trim()) {
      userMessageText = body.message;
    } else {
      userMessageText = rawMessages.filter((m) => m.role === "user").pop()?.content ?? "";
    }

    if (!userMessageText.trim()) {
      return NextResponse.json({
        reply: "Hi! Welcome to Axivon Technologies. How can our team assist you with your digital project today?",
        conversationId: incomingId ?? newId(),
      });
    }

    // 4. Sanitize and protect against prompt injection
    const { safe, sanitized } = sanitizeUserInput(userMessageText, 1000);
    const userMessage = safe ? sanitized : sanitized;

    const conversationId = incomingId || newId();
    const existingState = getConversation(conversationId);
    const state = existingState ?? createConversation(conversationId);

    // 5. Retrieve published database knowledge & portfolio
    const [publishedKnowledge, dynamicPortfolio] = await Promise.all([
      getPublishedKnowledge(),
      getDynamicPortfolioKnowledge(),
    ]);

    // 6. Generate grounded response
    const { reply, stateUpdates, showLeadCapture, leadScore, isHumanHandoff, engineUsed } =
      await generateResponse(
        safe ? userMessage : userMessageText,
        state,
        publishedKnowledge,
        dynamicPortfolio
      );

    // 7. Update conversation memory state
    const updatedMessages = [
      ...state.messages,
      { role: "user" as const, content: userMessage },
      { role: "assistant" as const, content: reply },
    ];
    const updatedState = updateConversation(conversationId, {
      ...stateUpdates,
      messages: updatedMessages,
    });

    // 8. Automatic lead persistence if contact details are gathered
    let leadCreated = false;
    let leadCode: string | undefined;

    if (
      updatedState.collectedData.email &&
      updatedState.collectedData.name &&
      updatedState.stage !== "COMPLETED"
    ) {
      const summary = generateConversationSummary(
        updatedState.collectedData,
        updatedState.messages
      );
      const score = scoreLead(updatedState.collectedData);
      const result = await createChatbotLead(
        updatedState.collectedData,
        summary,
        score,
        conversationId
      );
      if (result.success) {
        leadCreated = true;
        leadCode = result.leadCode;
        updateConversation(conversationId, { stage: "COMPLETED" });
      }
    }

    return NextResponse.json({
      reply,
      conversationId,
      showLeadCapture,
      leadScore,
      isHumanHandoff,
      engineUsed,
      leadCreated,
      ...(leadCode ? { leadCode } : {}),
    });
  } catch (error) {
    console.error("[Chat API] Unhandled error:", error);
    return NextResponse.json(
      {
        reply:
          "I'm momentarily unable to process this request. Please feel free to reach out directly to our team at info@axivontech.in or +91 9473263768.",
      },
      { status: 500 }
    );
  }
}
