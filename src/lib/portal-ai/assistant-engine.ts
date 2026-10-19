import { PortalContext, PortalAIResponse, SuggestedAction, PortalRole } from "./types";
import { executeTool } from "./tool-registry";
import { sanitizeUserInput } from "@/lib/chatbot/ai-engine";

/**
 * Role-tailored system instructions
 */
const ROLE_PROMPTS: Record<PortalRole, string> = {
  FOUNDER: `You are the "Executive Intelligence Copilot" for the Founder/Co-Founder of Axivon Technologies.
Your objective is to provide concise, strategic, and high-impact operational summaries.
Strictly adhere to verified business facts provided in the tool execution results. Never fabricate financial figures, dates, or client commitments.
Highlight critical risks (e.g. overdue milestones, bottlenecks). Provide direct navigation links to executive dashboards.`,

  CO_FOUNDER: `You are the "Executive Intelligence Copilot" for the Co-Founder of Axivon Technologies.
Provide clear operational intelligence, delivery progress, and workforce metrics.
Ground all responses in provided tool facts. Highlight pending managerial reviews and critical milestones.`,

  ADMIN: `You are the "Admin Operations Assistant" for Axivon Control Center.
Help authorized administrators manage workflows, workforce records, and CMS content.
All CMS drafting remains in DRAFT state; emphasize that administrator approval is required before publishing.
Do not execute destructive operations.`,

  EMPLOYEE: `You are the "Workplace Productivity Assistant" for Axivon Technologies employees.
Help the employee review their assigned tasks, check upcoming company holidays, and understand internal workflows.
Strictly protect privacy: you only have access to the authenticated employee's personal tasks and records. Never disclose other employees' private records or salary data.`,

  CLIENT: `You are the "Client Project Copilot" for Axivon Technologies.
Help the client review their active project deliverables, upcoming milestones, and submit project inquiries.
Enforce strict client organization isolation. Provide courteous, professional updates based on real milestone status.`,

  BROKER: `You are the "Partner Growth Copilot" for Axivon Technologies Brokers.
Help the broker review their deal pipeline, track lead statuses, and check commission earnings.
Never disclose other brokers' deals or private company margins. Encourage timely follow-ups with prospective clients.`,

  PARTNER: `You are the "Business Partner Assistant" for Axivon Technologies.
Guide the partner through referral submissions, program commission tiers, and technical solutions.
Maintain strict confidentiality regarding client data and internal margins.`,
};

/**
 * Detect matching tool based on user message and user role
 */
function matchToolForQuery(
  message: string,
  role: PortalRole
): { toolName: string; params: any } | null {
  const m = message.toLowerCase();

  // 1. Executive queries
  if ((role === "FOUNDER" || role === "CO_FOUNDER") && (m.includes("overview") || m.includes("executive") || m.includes("platform summary") || m.includes("business health") || m.includes("dashboard"))) {
    return { toolName: "get_executive_overview", params: {} };
  }

  // 1b. Business Intelligence & KPIs
  if (["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(role) && (m.includes("bi") || m.includes("kpi") || m.includes("analytics") || m.includes("metrics") || m.includes("performance indicator"))) {
    return { toolName: "query_business_overview_kpis", params: {} };
  }

  // 1c. Automation Health & Queue
  if (["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(role) && (m.includes("automation health") || m.includes("workflow health") || m.includes("execution status") || m.includes("automation failure"))) {
    return { toolName: "query_automation_health_metrics", params: {} };
  }

  // 2. Lead pipeline
  if (["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(role) && (m.includes("lead") || m.includes("pipeline") || m.includes("prospect") || m.includes("crm"))) {
    return { toolName: "get_lead_pipeline_summary", params: {} };
  }

  // 3. Project health
  if (["FOUNDER", "CO_FOUNDER", "ADMIN"].includes(role) && (m.includes("project health") || m.includes("overdue") || m.includes("delivery") || m.includes("milestone"))) {
    return { toolName: "get_project_health_summary", params: {} };
  }

  // 4. Pending leave approvals (Managerial)
  if (["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role) && (m.includes("leave approval") || m.includes("pending leave") || m.includes("who is on leave"))) {
    return { toolName: "get_pending_leave_approvals", params: {} };
  }

  // 5. CMS Draft
  if (["ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role) && (m.includes("draft") || m.includes("write article") || m.includes("cms"))) {
    return {
      toolName: "draft_cms_content",
      params: {
        title: message.replace(/draft\s*(cms|article|service)?\s*/i, "").trim() || "Proposed Service",
        category: "SERVICES",
      },
    };
  }

  // 6. Employee tasks
  if (["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role) && (m.includes("task") || m.includes("assigned") || m.includes("to do") || m.includes("work today"))) {
    return { toolName: "get_my_assigned_tasks", params: {} };
  }

  // 7. Employee leaves & holidays
  if (["EMPLOYEE", "ADMIN", "FOUNDER", "CO_FOUNDER"].includes(role) && (m.includes("leave") || m.includes("holiday") || m.includes("day off") || m.includes("vacation"))) {
    return { toolName: "get_my_leaves_and_holidays", params: {} };
  }

  // 8. Client projects
  if (role === "CLIENT" && (m.includes("project") || m.includes("status") || m.includes("deliverable") || m.includes("milestone"))) {
    return { toolName: "get_my_client_projects", params: {} };
  }

  // 9. Broker leads & pipeline
  if (role === "BROKER" && (m.includes("lead") || m.includes("pipeline") || m.includes("deal") || m.includes("client"))) {
    return { toolName: "get_my_broker_leads", params: {} };
  }

  // 10. Broker commission
  if (["BROKER", "PARTNER"].includes(role) && (m.includes("commission") || m.includes("earning") || m.includes("payout") || m.includes("referral code"))) {
    return { toolName: "get_my_commission_summary", params: {} };
  }

  // 11. General knowledge fallback search
  if (m.includes("what is") || m.includes("services") || m.includes("about") || m.includes("policy") || m.includes("help") || m.includes("how to")) {
    return { toolName: "search_published_knowledge", params: { query: message } };
  }

  return null;
}

/**
 * Format grounded local fallback response directly from tool execution data
 */
function formatLocalFallbackReply(toolName: string, data: any, ctx: PortalContext): string {
  switch (toolName) {
    case "get_executive_overview":
      return `### Executive Operational Summary\n\n` +
        `- **CRM Lead Pipeline**: ${data.pipeline.totalLeads} total leads (${data.pipeline.wonDeals} won deals, ${data.pipeline.conversionRate} win rate)\n` +
        `- **Active Client Projects**: ${data.delivery.activeProjects} deliverables in progress\n` +
        `- **Workforce Operations**: ${data.workforce.activeEmployees} active team members | **${data.workforce.pendingLeaveApprovals}** pending leave approvals\n\n` +
        `*Deep Dive: [Open Executive Revenue & Pipeline](/executive/dashboard)*`;

    case "get_lead_pipeline_summary":
      return `### Current Lead Pipeline Summary\n\n` +
        `**Recent Active Deals**:\n` +
        data.recentLeads.map((l: any) => `- **${l.leadCode}**: ${l.name} (${l.companyName || "Personal"}) — *${l.status}* | Budget: ${l.budget ? "₹" + l.budget.toLocaleString("en-IN") : "TBD"}`).join("\n") +
        `\n\n*Manage CRM: [View All Leads](/admin/crm/leads)*`;

    case "get_project_health_summary":
      return `### Project Delivery & Health Overview\n\n` +
        `Currently monitoring **${data.projects.length}** client projects (${data.highRiskCount} with overdue milestones):\n\n` +
        data.projects.map((p: any) => `- **${p.title}** [${p.status}]: ${p.milestoneCount} milestones ${p.hasRisk ? "⚠️ *(Overdue Milestones)*" : "✅ *(On Schedule)*"}`).join("\n") +
        `\n\n*Operations Queue: [View Partner Projects](/admin/crm/partner-projects)*`;

    case "get_my_assigned_tasks":
      if (data.tasks.length === 0) {
        return `You currently have **no pending tasks** assigned to your queue. All caught up!`;
      }
      return `### Your Assigned Tasks (${data.totalAssigned} items)\n\n` +
        data.tasks.map((t: any) => `- **[${t.priority}]** ${t.title} — Status: *${t.status}* (Due: ${t.dueDate})`).join("\n") +
        `\n\n*Workspace: [Open Task Board](/employee/tasks)*`;

    case "get_my_leaves_and_holidays":
      return `### Leave & Holiday Schedule\n\n` +
        `**Your Recent Leaves**:\n` +
        (data.myLeaves.length > 0
          ? data.myLeaves.map((l: any) => `- ${l.type} (${l.days} days): ${l.dates} — *${l.status}*`).join("\n")
          : `- No recent leave records filed.\n`) +
        `\n**Upcoming Company Holidays**:\n` +
        data.upcomingHolidays.map((h: any) => `- **${h.name}**: ${h.date} (${h.category})`).join("\n") +
        `\n\n*Leave Portal: [Apply or Manage Leave](/employee/leave)*`;

    case "get_pending_leave_approvals":
      if (data.length === 0) {
        return `There are currently **no pending leave requests** requiring your approval.`;
      }
      return `### Pending Leave Approvals (${data.length} requests)\n\n` +
        data.map((l: any) => `- **${l.employeeName}** (${l.department || "General"}): ${l.type} from ${l.startDate} to ${l.endDate}\n  *Reason: "${l.reason}"*`).join("\n") +
        `\n\n*Review: [Leave Management Console](/admin/leave)*`;

    case "get_my_client_projects":
      if (data.projects.length === 0) {
        return `No active projects found under your client account. Please contact your account director if you believe this is in error.`;
      }
      return `### Your Project Overview\n\n` +
        data.projects.map((p: any) => `- **${p.title}** (${p.status}) — Milestones: ${p.completedMilestones}/${p.milestoneCount} completed (Target: ${p.targetEndDate})`).join("\n") +
        `\n\n*Client Portal: [View Project Deliverables](/client/projects)*`;

    case "get_my_broker_leads":
      if (data.leads.length === 0) {
        return `You have not registered any partner leads yet. Share your unique referral link to register inbound client inquiries.`;
      }
      return `### Your Partner Leads (${data.totalLeads} total)\n\n` +
        data.leads.map((l: any) => `- **${l.code}**: ${l.name} (${l.company}) — *${l.status}* (${l.service || "General"})`).join("\n") +
        `\n\n*Pipeline: [View Partner Deals](/broker/leads)*`;

    case "get_my_commission_summary":
      return `### Commission & Referral Summary\n\n` +
        `- **Referral Code**: \`${data.referralCode}\`\n` +
        `- **Commission Tier**: ${data.tier} (${data.commissionRate})\n` +
        `- **Total Earnings Recorded**: ${data.totalEarnings}\n` +
        `- **Pending Payout**: ${data.pendingPayout}\n\n` +
        `*Share Link*: \`https://axivontech.in/contact?ref=${data.referralCode}\`\n\n` +
        `*Finance Console: [View Broker Statement](/broker/commissions)*`;

    case "draft_cms_content":
      return `### Proposed CMS Draft: "${data.title}"\n\n` +
        `**Category**: ${data.category} | **Status**: ${data.status}\n` +
        `**Suggested Tags**: ${data.suggestedTags.join(", ")}\n\n` +
        `> ${data.disclaimer}\n\n` +
        `To persist and publish this entry, proceed to the [AI Knowledge Console](/admin/ai/knowledge).`;

    case "search_published_knowledge":
      if (data.length === 0) {
        return `No published documents matched your inquiry. Please reach out to administrative support.`;
      }
      return `### Knowledge Base Search Results\n\n` +
        data.map((d: any) => `**${d.title}** (${d.category}):\n${d.content}\n`).join("\n") +
        `\n*Reference Documentation*`;

    case "query_business_overview_kpis":
      return `### Business Intelligence: Overview KPIs (${data.period?.label || "Current Window"})\n\n` +
        `- **Total Leads**: ${data.kpis?.totalLeads?.current ?? "N/A"} (Comparison: ${data.kpis?.totalLeads?.direction || "FLAT"})\n` +
        `- **Active Projects**: ${data.kpis?.activeProjects?.current ?? "N/A"}\n` +
        `- **Overdue Milestones**: ${data.kpis?.overdueMilestones?.current ?? 0}\n` +
        `- **Team Capacity**: ${data.kpis?.activeEmployees?.current ?? "N/A"} active team members\n\n` +
        `Detailed cross-period analytics available at [/admin/analytics](/admin/analytics).`;

    case "query_automation_health_metrics":
      return `### Automation Platform Health\n\n` +
        `- **Active Workflows**: ${data.activeWorkflowsCount ?? 0}\n` +
        `- **Period Executions**: ${data.totalExecutionsInPeriod ?? 0} (Success: ${data.successfulExecutionsInPeriod ?? 0}, Failures: ${data.failedExecutionsInPeriod ?? 0})\n` +
        `- **Emails Dispatched**: ${data.emailsSentCount ?? 0} (Failed: ${data.emailsFailedCount ?? 0})\n\n` +
        `Manage workflows and approvals at [/admin/automations](/admin/automations).`;

    default:
      return `Here is the information retrieved for your account:\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }
}

/**
 * Generate contextual suggested actions based on user role and context
 */
function getRoleSuggestedActions(role: PortalRole): SuggestedAction[] {
  switch (role) {
    case "FOUNDER":
    case "CO_FOUNDER":
      return [
        { label: "Executive Summary", prompt: "Summarize platform business overview" },
        { label: "Lead Pipeline", prompt: "Show current lead pipeline summary" },
        { label: "Project Health", prompt: "Which projects have overdue milestones?" },
        { label: "Workforce Approvals", prompt: "Show pending leave approvals" },
      ];
    case "ADMIN":
      return [
        { label: "Pending Leaves", prompt: "Show employee leave requests awaiting approval" },
        { label: "CRM Pipeline", prompt: "Summarize current lead pipeline" },
        { label: "Draft Service FAQ", prompt: "Draft a new service entry for Cloud Infrastructure" },
        { label: "Knowledge Search", prompt: "What are company policies on data security?" },
      ];
    case "EMPLOYEE":
      return [
        { label: "My Tasks", prompt: "What are my assigned tasks?" },
        { label: "Leave & Holidays", prompt: "Show my leave balance and upcoming holidays" },
        { label: "Company Handbook", prompt: "What are the core engineering standards?" },
      ];
    case "CLIENT":
      return [
        { label: "My Projects", prompt: "Summarize my active project status" },
        { label: "Milestones", prompt: "What milestones are upcoming for my project?" },
        { label: "Technical Support", prompt: "How do I request a change or consultation?" },
      ];
    case "BROKER":
    case "PARTNER":
      return [
        { label: "My Leads", prompt: "Show my active referred leads" },
        { label: "Commission Balance", prompt: "What is my commission status and referral code?" },
        { label: "Program Terms", prompt: "What are the partner commission tiers?" },
      ];
    default:
      return [{ label: "Help", prompt: "How can you assist me in this portal?" }];
  }
}

/**
 * Process authenticated multi-portal chat request
 */
export async function processPortalAIChat(
  userMessage: string,
  ctx: PortalContext,
  history: Array<{ role: string; content: string }> = [],
  ipAddress?: string | null
): Promise<PortalAIResponse> {
  // 1. Sanitize user message for prompt injection & excessive lengths
  const { safe, sanitized } = sanitizeUserInput(userMessage, 1200);
  if (!safe) {
    return {
      reply: sanitized,
      toolsExecuted: [],
      suggestedActions: getRoleSuggestedActions(ctx.role),
      engineUsed: "LOCAL_FALLBACK",
    };
  }
  const prompt = sanitized;

  // 2. Identify matching tool for role
  const toolMatch = matchToolForQuery(prompt, ctx.role);
  const toolsExecuted: string[] = [];
  let toolData: any = null;

  if (toolMatch) {
    const result = await executeTool(toolMatch.toolName, toolMatch.params, ctx, ipAddress);
    if (result.success) {
      toolsExecuted.push(toolMatch.toolName);
      toolData = result.data;
    } else {
      return {
        reply: `⚠️ ${result.error || "Unable to retrieve requested records."}`,
        toolsExecuted: [toolMatch.toolName],
        suggestedActions: getRoleSuggestedActions(ctx.role),
        engineUsed: "LOCAL_FALLBACK",
      };
    }
  }

  // 3. Check for Gemini API key
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  // If no Gemini key or tool directly handled, use local grounded engine
  if (!apiKey || toolData) {
    const reply = toolData
      ? formatLocalFallbackReply(toolMatch!.toolName, toolData, ctx)
      : `I am your **${ctx.role} Portal Assistant**. I can help you retrieve authorized records, inspect deadlines, and navigate your workspace. Please choose a suggested quick prompt below.`;

    return {
      reply,
      toolsExecuted,
      suggestedActions: getRoleSuggestedActions(ctx.role),
      draftData: toolMatch?.toolName.startsWith("draft_") ? toolData : undefined,
      engineUsed: "LOCAL_FALLBACK",
    };
  }

  // 4. Call Gemini 1.5 Flash with strict role instruction and 8-second timeout
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
    });

    const systemInstruction = `${ROLE_PROMPTS[ctx.role] || ROLE_PROMPTS.EMPLOYEE}\n\n` +
      `AUTHENTICATED USER CONTEXT:\n` +
      `- Name: ${ctx.name}\n` +
      `- Role: ${ctx.role}\n` +
      `- Department: ${ctx.department || "General"}\n\n` +
      `TOOL DATA:\n${toolData ? JSON.stringify(toolData, null, 2) : "No specific tool execution data."}\n\n` +
      `Answer factually and helpfully based exclusively on the provided context. Never invent records.`;

    const chatHistory = history.slice(-6).map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({ history: chatHistory, systemInstruction });
    const geminiPromise = chat.sendMessage(prompt);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini call timed out after 8000ms")), 8000)
    );

    const result: any = await Promise.race([geminiPromise, timeoutPromise]);
    const reply = result.response.text();

    return {
      reply,
      toolsExecuted,
      suggestedActions: getRoleSuggestedActions(ctx.role),
      engineUsed: "GEMINI",
    };
  } catch (error) {
    console.error("[PortalAIEngine] Gemini call failed, activating local fallback:", (error as Error).message);
    const reply = toolData
      ? formatLocalFallbackReply(toolMatch!.toolName, toolData, ctx)
      : `I am currently operating in resilient local mode. I can retrieve your authorized records directly using the shortcuts below.`;

    return {
      reply,
      toolsExecuted,
      suggestedActions: getRoleSuggestedActions(ctx.role),
      engineUsed: "LOCAL_FALLBACK",
    };
  }
}

export const processPortalChatMessage = processPortalAIChat;
