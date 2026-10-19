import { NextRequest, NextResponse } from "next/server";
import { resolvePortalContext } from "@/lib/portal-ai/portal-context";
import { PortalAssistantConfig, PortalRole } from "@/lib/portal-ai/types";

const ROLE_CONFIGS: Record<PortalRole, Omit<PortalAssistantConfig, "role">> = {
  FOUNDER: {
    portalName: "Executive Governance",
    botName: "Executive Copilot",
    tagline: "Strategic Intelligence & Governance Assistant",
    accentColor: "gold",
    welcomeMessage: "Good day. I am your Executive Copilot. I can synthesize CRM pipelines, delivery milestones, workforce metrics, and pending approvals across Axivon Technologies.",
    suggestedQuestions: [
      { label: "Executive Summary", prompt: "Summarize platform business overview" },
      { label: "Lead Pipeline", prompt: "Show current lead pipeline summary" },
      { label: "Project Health", prompt: "Which projects have overdue milestones?" },
      { label: "Pending Approvals", prompt: "Show pending leave approvals" },
    ],
    enabledTools: ["get_executive_overview", "get_lead_pipeline_summary", "get_project_health_summary", "get_pending_leave_approvals", "search_published_knowledge"],
  },
  CO_FOUNDER: {
    portalName: "Executive Governance",
    botName: "Executive Copilot",
    tagline: "Operations & Delivery Intelligence Copilot",
    accentColor: "gold",
    welcomeMessage: "Welcome. I am your Executive Copilot. How can I assist with delivery tracking, operations, or pipeline reviews today?",
    suggestedQuestions: [
      { label: "Executive Summary", prompt: "Summarize platform business overview" },
      { label: "Project Delivery", prompt: "Which projects have overdue milestones?" },
      { label: "CRM Pipeline", prompt: "Show current lead pipeline summary" },
    ],
    enabledTools: ["get_executive_overview", "get_lead_pipeline_summary", "get_project_health_summary", "get_pending_leave_approvals", "search_published_knowledge"],
  },
  ADMIN: {
    portalName: "Control Center",
    botName: "Admin Assistant",
    tagline: "Operations & Workforce Workflow Copilot",
    accentColor: "emerald",
    welcomeMessage: "Hello Administrator. I can help you monitor team leaves, inspect lead queues, draft CMS articles, and look up company documentation.",
    suggestedQuestions: [
      { label: "Pending Leaves", prompt: "Show employee leave requests awaiting approval" },
      { label: "CRM Pipeline", prompt: "Summarize current lead pipeline" },
      { label: "Project Health", prompt: "Which projects have overdue milestones?" },
      { label: "Draft Service", prompt: "Draft a new service entry for Cloud Infrastructure" },
    ],
    enabledTools: ["get_pending_leave_approvals", "get_lead_pipeline_summary", "get_project_health_summary", "draft_cms_content", "search_published_knowledge"],
  },
  EMPLOYEE: {
    portalName: "Workforce Workspace",
    botName: "Workplace Assistant",
    tagline: "Personal Tasks & Productivity Copilot",
    accentColor: "emerald",
    welcomeMessage: "Hi! I am your Workplace Assistant. I can help you check your assigned tasks, review holiday schedules, and calculate leave requests.",
    suggestedQuestions: [
      { label: "My Tasks", prompt: "What are my assigned tasks?" },
      { label: "Leave & Holidays", prompt: "Show my leave balance and upcoming holidays" },
      { label: "Company Handbook", prompt: "What are the core engineering standards?" },
    ],
    enabledTools: ["get_my_assigned_tasks", "get_my_leaves_and_holidays", "draft_leave_request", "search_published_knowledge"],
  },
  CLIENT: {
    portalName: "Client Portal",
    botName: "Project Copilot",
    tagline: "Milestone & Deliverable Assistant",
    accentColor: "emerald",
    welcomeMessage: "Welcome. I am your dedicated Project Copilot. I can provide real-time updates on your deliverables, milestone deadlines, and answer questions about Axivon services.",
    suggestedQuestions: [
      { label: "My Projects", prompt: "Summarize my active project status" },
      { label: "Milestones", prompt: "What milestones are upcoming for my project?" },
      { label: "Support Inquiry", prompt: "How do I request a technical consultation?" },
    ],
    enabledTools: ["get_my_client_projects", "draft_support_inquiry", "search_published_knowledge"],
  },
  BROKER: {
    portalName: "Partner Portal",
    botName: "Partner Copilot",
    tagline: "Deal Pipeline & Referral Assistant",
    accentColor: "emerald",
    welcomeMessage: "Welcome Partner! I can help you track your registered deals, review commission statements, and access your unique referral link.",
    suggestedQuestions: [
      { label: "My Deals", prompt: "Show my active referred leads" },
      { label: "Commission Balance", prompt: "What is my commission status and referral code?" },
      { label: "Partner Terms", prompt: "What are the partner commission tiers?" },
    ],
    enabledTools: ["get_my_broker_leads", "get_my_commission_summary", "draft_support_inquiry", "search_published_knowledge"],
  },
  PARTNER: {
    portalName: "Partner Program",
    botName: "Partner Copilot",
    tagline: "Joint Venture & Referral Assistant",
    accentColor: "emerald",
    welcomeMessage: "Welcome Business Partner. I can assist with referral submissions, program guidelines, and commission tiers.",
    suggestedQuestions: [
      { label: "Commission & Code", prompt: "What is my commission status and referral code?" },
      { label: "Referred Leads", prompt: "Show my active referred leads" },
      { label: "Program Overview", prompt: "What are the partner commission tiers?" },
    ],
    enabledTools: ["get_my_broker_leads", "get_my_commission_summary", "draft_support_inquiry", "search_published_knowledge"],
  },
};

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const queryRole = req.nextUrl.searchParams.get("role") as PortalRole | null;

    let role: PortalRole = "EMPLOYEE";
    let userName = "Member";

    if (userId) {
      const ctx = await resolvePortalContext(userId);
      if (!ctx) {
        return NextResponse.json({ error: "Forbidden: Account inactive." }, { status: 403 });
      }
      role = ctx.role;
      userName = ctx.name;
    } else if (queryRole && ROLE_CONFIGS[queryRole]) {
      role = queryRole;
      userName = queryRole === "FOUNDER" ? "Founder" : queryRole === "ADMIN" ? "Administrator" : "Partner";
    } else {
      return NextResponse.json({ error: "Unauthorized: Session required." }, { status: 401 });
    }

    const roleConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS.EMPLOYEE;
    const payload = {
      role,
      userName,
      ...roleConfig,
    };

    return NextResponse.json({
      success: true,
      data: payload,
      config: payload,
    });
  } catch (error) {
    console.error("[PortalAI Config API] Error:", error);
    return NextResponse.json({ error: "Failed to load assistant configuration." }, { status: 500 });
  }
}
