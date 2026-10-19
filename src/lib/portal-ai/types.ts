/**
 * AXIVON ONE: Multi-Portal AI Assistant Types
 * Phase 2 Role-Aware Architecture
 */

export type PortalRole =
  | "FOUNDER"
  | "CO_FOUNDER"
  | "ADMIN"
  | "EMPLOYEE"
  | "CLIENT"
  | "BROKER"
  | "PARTNER";

export interface PortalContext {
  userId: string;
  role: PortalRole;
  name: string;
  email: string;
  organizationId?: string | null;
  department?: string | null;
  permissions: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  allowedRoles: PortalRole[];
  requiredPermission?: string;
  isWrite: boolean;
  requiresConfirmation?: boolean;
  handler: (
    params: any,
    ctx: PortalContext
  ) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
    auditNote?: string;
  }>;
}

export interface SuggestedAction {
  label: string;
  prompt: string;
  href?: string;
}

export interface PortalAIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolsExecuted?: string[];
  suggestedActions?: SuggestedAction[];
  isDraft?: boolean;
  draftData?: any;
}

export interface PortalAIResponse {
  reply: string;
  toolsExecuted: string[];
  suggestedActions: SuggestedAction[];
  draftData?: any;
  requiresConfirmation?: boolean;
  engineUsed: "GEMINI" | "LOCAL_FALLBACK";
}

export interface PortalAssistantConfig {
  role: PortalRole;
  portalName: string;
  botName: string;
  tagline: string;
  accentColor: string; // "emerald" | "gold"
  welcomeMessage: string;
  suggestedQuestions: SuggestedAction[];
  enabledTools: string[];
}
