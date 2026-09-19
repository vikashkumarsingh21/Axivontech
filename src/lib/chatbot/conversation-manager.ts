import { LeadData, ChatIntent } from "./knowledge-base";

export interface ConversationState {
  id: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  collectedData: LeadData;
  intent: ChatIntent;
  stage: "GREETING" | "EXPLORING" | "CONSULTING" | "QUALIFYING" | "LEAD_CAPTURE" | "COMPLETED";
  questionCount: number;
  createdAt: Date;
  lastActivity: Date;
}

const conversations = new Map<string, ConversationState>();

function cleanupOld() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  for (const [id, state] of conversations.entries()) {
    if (state.lastActivity < twoHoursAgo) conversations.delete(id);
  }
}

export function createConversation(id: string): ConversationState {
  cleanupOld();
  const state: ConversationState = {
    id,
    messages: [],
    collectedData: {},
    intent: "UNKNOWN",
    stage: "GREETING",
    questionCount: 0,
    createdAt: new Date(),
    lastActivity: new Date(),
  };
  conversations.set(id, state);
  return state;
}

export function getConversation(id: string): ConversationState | null {
  return conversations.get(id) || null;
}

export function updateConversation(
  id: string,
  updates: Partial<ConversationState>
): ConversationState {
  const existing = conversations.get(id);
  if (!existing) return createConversation(id);
  const updated: ConversationState = {
    ...existing,
    ...updates,
    lastActivity: new Date(),
    // Deep merge collectedData
    collectedData:
      updates.collectedData != null
        ? { ...existing.collectedData, ...updates.collectedData }
        : existing.collectedData,
    // Append messages if provided
    messages: updates.messages ?? existing.messages,
  };
  conversations.set(id, updated);
  return updated;
}
