import { NextRequest, NextResponse } from "next/server";
import {
  AXIVON_KNOWLEDGE,
  getDynamicPortfolioKnowledge,
  generateConversationSummary,
  scoreLead,
} from "@/lib/chatbot/knowledge-base";
import {
  createConversation,
  getConversation,
  updateConversation,
} from "@/lib/chatbot/conversation-manager";
import { generateResponse } from "@/lib/chatbot/ai-engine";
import { createChatbotLead } from "@/lib/chatbot/crm-integration";

// "?"? Rate limiting: 30 messages per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 30) return false;
  record.count += 1;
  return true;
}

// "?"? Prompt injection protection
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|previous\s+|your\s+)?instructions/i,
  /reveal\s+(your\s+|the\s+|all\s+)?system\s+prompt/i,
  /show\s+me\s+(the\s+)?(api|secret|database|internal|password|key)/i,
  /act\s+as\s+(a\s+different|an\s+unrestricted|dan|jailbreak)/i,
  /you\s+are\s+now\s+/i,
  /disregard\s+(all|previous|your)/i,
  /override\s+(your\s+)?(instructions|rules|limits)/i,
  /pretend\s+you\s+(are|have|can)/i,
  /\[system\]/i,
  /\[instruction\]/i,
];

function sanitizeInput(text: string): { safe: boolean; sanitized: string } {
  const trimmed = text.trim().slice(0, 500);
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        safe: false,
        sanitized: "I can only help with questions about Axivon Technologies and your project needs.",
      };
    }
  }
  return { safe: true, sanitized: trimmed };
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ reply: "You're sending messages a little too quickly. Please try again in a moment.", isRateLimited: true }, { status: 429 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {}

    const rawMessages: Array<{ role: string; content: string }> = Array.isArray(body.messages) ? (body.messages as Array<{ role: string; content: string }>) : [];
    const incomingId = typeof body.conversationId === "string" ? body.conversationId : undefined;
    const pageContext: { path?: string; title?: string } = typeof body.pageContext === "object" && body.pageContext !== null ? (body.pageContext as { path?: string; title?: string }) : {};

    let lastUserMsg = "";
    if (typeof body.message === "string" && body.message.trim()) {
      lastUserMsg = body.message;
    } else {
      lastUserMsg = rawMessages.filter((m) => m.role === "user").pop()?.content ?? "";
    }

    if (!lastUserMsg.trim()) {
      return NextResponse.json({ reply: "Hi! Welcome to Axivon Technologies. How can I help you today?", conversationId: incomingId ?? newId() });
    }

    const { safe, sanitized } = sanitizeInput(lastUserMsg);
    const userMessage = safe ? sanitized : sanitized;

    const conversationId = incomingId ?? newId();
    const existingState = getConversation(conversationId);
    const state = existingState ?? createConversation(conversationId);

    // Fetch dynamic knowledge
    const dynamicPortfolio = await getDynamicPortfolioKnowledge();

    const { reply, stateUpdates, showLeadCapture, leadScore, isHumanHandoff } =
      await generateResponse(
        safe ? userMessage : lastUserMsg,
        state,
        AXIVON_KNOWLEDGE,
        dynamicPortfolio
      );

    const updatedMessages = [
      ...state.messages,
      { role: "user" as const, content: userMessage },
      { role: "assistant" as const, content: reply },
    ];
    const updatedState = updateConversation(conversationId, {
      ...stateUpdates,
      messages: updatedMessages,
    });

    let leadCreated = false;
    let leadCode: string | undefined;

    if (updatedState.collectedData.email && updatedState.collectedData.name && updatedState.stage !== "COMPLETED") {
      const summary = generateConversationSummary(updatedState.collectedData, updatedState.messages);
      const score = scoreLead(updatedState.collectedData);
      const result = await createChatbotLead(updatedState.collectedData, summary, score, conversationId);
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
      leadCreated,
      ...(leadCode ? { leadCode } : {}),
    });
  } catch (error) {
    console.error("[Chat API] Unhandled error:", error);
    return NextResponse.json(
      { reply: "I'm having trouble responding right now. Please contact us at contact@axivontech.in or +91 94732 63768." },
      { status: 500 }
    );
  }
}
