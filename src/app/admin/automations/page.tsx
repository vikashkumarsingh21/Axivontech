"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  X,
  RefreshCw,
  Trash2,
  Layers,
  AlertTriangle,
  Send,
  Bell,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Bot,
  Filter,
  Eye,
  AlertCircle,
  UserCheck,
  RotateCw,
  ChevronRight,
} from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  triggerType: string;
  actions: any;
  conditions?: any;
  isActive: boolean;
  createdAt: string;
  createdBy?: { name: string; email: string } | null;
}

interface Execution {
  id: string;
  automationId: string;
  automation?: { id: string; name: string; triggerType: string };
  triggerEvent: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED" | string;
  dedupKey?: string;
  result?: any;
  executedAt: string;
}

interface ApprovalItem {
  id: string;
  requestType: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXECUTION_FAILED" | string;
  reason?: string;
  metadata?: any;
  requestedBy?: { name: string; email: string } | null;
  decidedBy?: { name: string; email: string } | null;
  createdAt: string;
  decidedAt?: string;
}

interface TemplateBlueprint {
  templateId: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  conditions?: any;
  actions: any[];
  approvalRequired?: boolean;
}

export default function AdminAutomationsPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "workflows" | "builder" | "executions" | "approvals" | "templates"
  >("overview");

  // Workflows
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);

  // Executions
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(false);

  // Approvals
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [approvalActionLoading, setApprovalActionLoading] = useState<string | null>(null);

  // Templates
  const [templates, setTemplates] = useState<TemplateBlueprint[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [installingTemplateId, setInstallingTemplateId] = useState<string | null>(null);

  // AI Builder state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Manual Workflow Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualTrigger, setManualTrigger] = useState("NEW_LEAD");
  const [manualAction, setManualAction] = useState("CREATE_NOTIFICATION");

  // Dry run / Action feedback banner
  const [banner, setBanner] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [tickingScheduler, setTickingScheduler] = useState(false);

  // 1. Load Workflows
  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true);
    try {
      const res = await fetch("/api/v1/automations");
      const d = await res.json();
      setWorkflows(d.data || []);
    } catch {
      // fallback
    } finally {
      setLoadingWorkflows(false);
    }
  }, []);

  // 2. Load Executions
  const loadExecutions = useCallback(async () => {
    setLoadingExecutions(true);
    try {
      const res = await fetch("/api/v1/automations/executions?limit=50");
      const d = await res.json();
      setExecutions(d.executions || []);
    } catch {
      // fallback
    } finally {
      setLoadingExecutions(false);
    }
  }, []);

  // 3. Load Approvals
  const loadApprovals = useCallback(async () => {
    setLoadingApprovals(true);
    try {
      const res = await fetch("/api/v1/automations/approvals?take=50");
      const d = await res.json();
      setApprovals(d.approvals || []);
    } catch {
      // fallback
    } finally {
      setLoadingApprovals(false);
    }
  }, []);

  // 4. Load Templates
  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/v1/automations/templates");
      const d = await res.json();
      setTemplates(d.templates || []);
    } catch {
      // fallback
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
    loadApprovals();
    loadTemplates();
  }, [loadWorkflows, loadExecutions, loadApprovals, loadTemplates]);

  // Handle Tab Switch
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "workflows") loadWorkflows();
    if (tab === "executions") loadExecutions();
    if (tab === "approvals") loadApprovals();
    if (tab === "templates") loadTemplates();
  };

  // Toggle Workflow Active
  const toggleWorkflow = async (wf: Workflow) => {
    try {
      const res = await fetch(`/api/v1/automations/${wf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !wf.isActive }),
      });
      if (res.ok) {
        setWorkflows((prev) =>
          prev.map((item) => (item.id === wf.id ? { ...item, isActive: !item.isActive } : item))
        );
        setBanner({
          type: "success",
          message: `Workflow "${wf.name}" is now ${!wf.isActive ? "ACTIVE" : "PAUSED"}.`,
        });
      }
    } catch {
      setBanner({ type: "error", message: "Failed to update workflow status." });
    }
  };

  // Run or Dry Run Workflow
  const handleRunWorkflow = async (workflowId: string, isDryRun: boolean) => {
    try {
      const res = await fetch(`/api/v1/automations/${workflowId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDryRun }),
      });
      const d = await res.json();
      if (res.ok) {
        setBanner({
          type: "info",
          message: isDryRun
            ? `Dry Run Simulation Complete: Status = ${d.result?.status}, Actions Simulated = ${d.result?.actionsExecuted?.length || 0}`
            : `Manual Execution Dispatched: Status = ${d.result?.status}`,
        });
        loadExecutions();
      } else {
        setBanner({ type: "error", message: d.error || "Execution failed." });
      }
    } catch (e: any) {
      setBanner({ type: "error", message: e.message || "Failed to trigger workflow." });
    }
  };

  // Retry Failed Execution
  const handleRetryExecution = async (executionId: string) => {
    try {
      const res = await fetch(`/api/v1/automations/executions/${executionId}/retry`, {
        method: "POST",
      });
      const d = await res.json();
      if (res.ok) {
        setBanner({ type: "success", message: d.message || "Retry executed successfully." });
        loadExecutions();
      } else {
        setBanner({ type: "error", message: d.error || "Retry failed." });
      }
    } catch (e: any) {
      setBanner({ type: "error", message: e.message });
    }
  };

  // Decide on Approval Request
  const handleDecideApproval = async (approvalId: string, decision: "APPROVED" | "REJECTED") => {
    setApprovalActionLoading(approvalId);
    try {
      const res = await fetch("/api/v1/automations/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, decision }),
      });
      const d = await res.json();
      if (res.ok) {
        setBanner({
          type: "success",
          message: `Approval request ${decision.toLowerCase()} successfully.`,
        });
        loadApprovals();
        loadExecutions();
      } else {
        setBanner({ type: "error", message: d.error || `Failed to ${decision.toLowerCase()} request.` });
      }
    } catch (e: any) {
      setBanner({ type: "error", message: e.message });
    } finally {
      setApprovalActionLoading(null);
    }
  };

  // Install Blueprint Template
  const handleInstallTemplate = async (templateId: string) => {
    setInstallingTemplateId(templateId);
    try {
      const res = await fetch("/api/v1/automations/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const d = await res.json();
      if (res.ok) {
        setBanner({
          type: "success",
          message: `Template "${templateId}" installed and activated successfully!`,
        });
        loadWorkflows();
        setActiveTab("workflows");
      } else {
        setBanner({ type: "error", message: d.error || "Failed to install template." });
      }
    } catch (e: any) {
      setBanner({ type: "error", message: e.message });
    } finally {
      setInstallingTemplateId(null);
    }
  };

  // AI Workflow Proposal Generator
  const handleGenerateAiProposal = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiProposal(null);
    setAiSuccessMsg(null);
    try {
      const res = await fetch("/api/v1/automations/ai-propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const d = await res.json();
      if (res.ok && d.proposal) {
        setAiProposal(d.proposal);
      } else {
        setAiError(d.error || "Failed to generate workflow proposal.");
      }
    } catch (e: any) {
      setAiError(e.message || "Network error generating proposal.");
    } finally {
      setAiLoading(false);
    }
  };

  // Confirm and Create Workflow from AI Proposal
  const handleConfirmAiProposal = async () => {
    if (!aiProposal) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: aiProposal.name,
          triggerType: aiProposal.triggerType,
          conditions: aiProposal.conditions || {},
          actions: aiProposal.actions || ["CREATE_NOTIFICATION"],
          isActive: true,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setAiSuccessMsg(`Workflow "${aiProposal.name}" successfully created and armed.`);
        setAiProposal(null);
        setAiPrompt("");
        loadWorkflows();
      } else {
        setAiError(d.error || "Failed to create workflow.");
      }
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Tick Persistent Scheduler
  const handleTickScheduler = async () => {
    setTickingScheduler(true);
    try {
      const res = await fetch("/api/v1/automations/scheduler/tick", { method: "POST" });
      const d = await res.json();
      if (res.ok) {
        setBanner({
          type: "success",
          message: `Scheduler tick executed: ${d.summary?.processed || 0} jobs processed (${d.summary?.succeeded || 0} succeeded, ${d.summary?.recovered || 0} leases recovered).`,
        });
        loadExecutions();
      } else {
        setBanner({ type: "error", message: d.error || "Scheduler tick failed." });
      }
    } catch (e: any) {
      setBanner({ type: "error", message: e.message });
    } finally {
      setTickingScheduler(false);
    }
  };

  // Calculations for overview KPIs
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter((w) => w.isActive).length;
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter((e) => e.status === "SUCCESS").length;
  const successRate =
    totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;
  const pendingApprovalsCount = approvals.filter((a) => a.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] p-6 lg:p-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E2530] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Automation & Intelligence Center
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Phase 3
                  </span>
                </h1>
                <p className="text-xs text-[#7E8997] mt-0.5">
                  Autonomous event triggers, scheduled leases, human approval safeguards, and AI orchestration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTickScheduler}
              disabled={tickingScheduler}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-white border border-[#29313B] transition-colors"
              title="Manually trigger persistent scheduler tick to process due background jobs"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${tickingScheduler ? "animate-spin" : ""}`} />
              Run Scheduler Tick
            </button>
            <button
              onClick={() => setActiveTab("builder")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#04130E] transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Workflow Builder
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {banner && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              banner.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : banner.type === "info"
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {banner.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {banner.type === "info" && <Activity className="w-4 h-4 shrink-0" />}
              {banner.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{banner.message}</span>
            </div>
            <button onClick={() => setBanner(null)} className="text-current opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-[#1E2530] overflow-x-auto pb-px">
          {[
            { id: "overview", label: "Overview & Health", icon: Activity },
            { id: "workflows", label: `Workflows (${totalWorkflows})`, icon: Layers },
            { id: "builder", label: "Visual Builder & AI", icon: Sparkles },
            { id: "executions", label: `Execution History (${totalExecutions})`, icon: Clock },
            { id: "approvals", label: `Approval Queue (${pendingApprovalsCount})`, icon: ShieldCheck, badge: pendingApprovalsCount > 0 },
            { id: "templates", label: "Template Gallery (12)", icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-transparent text-[#7E8997] hover:text-[#F3F5F7] hover:border-[#29313B]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & HEALTH */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#7E8997]">
                  <span>Active Workflows</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{activeWorkflows}</span>
                  <span className="text-xs text-[#7E8997]">of {totalWorkflows} enabled</span>
                </div>
                <div className="mt-3 w-full bg-[#101318] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${totalWorkflows > 0 ? (activeWorkflows / totalWorkflows) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#7E8997]">
                  <span>Execution Success Rate</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{successRate}%</span>
                  <span className="text-xs text-emerald-400">Verified Runs</span>
                </div>
                <p className="mt-3 text-[11px] text-[#7E8997]">
                  {successfulExecutions} succeeded out of {totalExecutions} total runs
                </p>
              </div>

              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#7E8997]">
                  <span>Pending Approvals</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{pendingApprovalsCount}</span>
                  <span className="text-xs text-amber-400">Awaiting Decider</span>
                </div>
                <p className="mt-3 text-[11px] text-[#7E8997]">
                  Human-in-the-loop protection for high-impact actions
                </p>
              </div>

              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#7E8997]">
                  <span>Template Blueprint Library</span>
                  <FileSpreadsheet className="w-4 h-4 text-[#D6B779]" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{templates.length}</span>
                  <span className="text-xs text-[#D6B779]">Blueprints Ready</span>
                </div>
                <p className="mt-3 text-[11px] text-[#7E8997]">
                  Pre-audited enterprise automation playbooks
                </p>
              </div>
            </div>

            {/* Approvals Alert Banner if any pending */}
            {pendingApprovalsCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? "s" : ""} Pending Administrative Approval
                    </h3>
                    <p className="text-xs text-amber-300/80 mt-0.5">
                      Workflows paused execution awaiting verified human sign-off.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#04130E] text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  Review Queue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Two-Column Overview Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Active Workflows List */}
              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Armed Automation Workflows
                  </h3>
                  <button
                    onClick={() => setActiveTab("workflows")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-[#1E2530]">
                  {workflows.slice(0, 5).map((wf) => (
                    <div key={wf.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">{wf.name}</p>
                        <p className="text-[11px] text-[#7E8997] font-mono mt-0.5">{wf.triggerType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            wf.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                          }`}
                        >
                          {wf.isActive ? "ACTIVE" : "PAUSED"}
                        </span>
                        <button
                          onClick={() => handleRunWorkflow(wf.id, true)}
                          className="px-2 py-1 text-[11px] rounded bg-[#101318] text-[#A7B0BC] hover:text-white border border-[#29313B]"
                          title="Dry Run Simulation"
                        >
                          Dry Run
                        </button>
                      </div>
                    </div>
                  ))}
                  {workflows.length === 0 && (
                    <p className="text-xs text-[#7E8997] py-6 text-center">No workflows found. Install a template to start.</p>
                  )}
                </div>
              </div>

              {/* Right: Recent Executions Preview */}
              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Recent Execution Ledger
                  </h3>
                  <button
                    onClick={() => setActiveTab("executions")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-[#1E2530]">
                  {executions.slice(0, 5).map((ex) => (
                    <div key={ex.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">{ex.automation?.name || ex.triggerEvent}</p>
                        <p className="text-[10px] text-[#7E8997] mt-0.5">
                          {new Date(ex.executedAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          ex.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : ex.status === "SKIPPED"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {ex.status}
                      </span>
                    </div>
                  ))}
                  {executions.length === 0 && (
                    <p className="text-xs text-[#7E8997] py-6 text-center">No executions recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKFLOWS LIST */}
        {activeTab === "workflows" && (
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1E2530] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Registered Automations</h3>
                <p className="text-xs text-[#7E8997] mt-0.5">Toggle active state, simulate dry runs, or execute live triggers.</p>
              </div>
              <button
                onClick={() => setActiveTab("builder")}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Workflow
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2530] text-[#7E8997] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Workflow Name</th>
                    <th className="px-5 py-3">Trigger Type</th>
                    <th className="px-5 py-3">Actions</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {workflows.map((wf) => (
                    <tr key={wf.id} className="hover:bg-[#101318]/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{wf.name}</p>
                        <p className="text-[11px] text-[#7E8997] mt-0.5">
                          Created {new Date(wf.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#101318] border border-[#29313B] text-[#A7B0BC]">
                          {wf.triggerType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(wf.actions) &&
                            wf.actions.map((act: any, idx: number) => {
                              const actName = typeof act === "string" ? act : act.actionId || "ACTION";
                              return (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B222B] text-emerald-400 border border-emerald-500/20"
                                >
                                  {actName}
                                </span>
                              );
                            })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleWorkflow(wf)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                            wf.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                              : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                          }`}
                        >
                          {wf.isActive ? "ACTIVE" : "PAUSED"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleRunWorkflow(wf.id, true)}
                            className="px-2.5 py-1 rounded bg-[#101318] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-white border border-[#29313B] text-[11px] font-medium transition-colors"
                            title="Dry Run Simulation"
                          >
                            Simulate
                          </button>
                          <button
                            onClick={() => handleRunWorkflow(wf.id, false)}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium transition-colors"
                            title="Live Execution"
                          >
                            Execute
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VISUAL BUILDER & AI ASSISTANT */}
        {activeTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Natural-Language AI Workflow Assistant */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Natural-Language Workflow Designer</h3>
                  <p className="text-xs text-[#7E8997]">Describe your automation rule in plain English.</p>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. When a new high-budget lead arrives, notify the founder, assign the lead to senior sales, and schedule a follow-up call within 24 hours."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101318] border border-[#29313B] text-xs text-white placeholder-[#566171] focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#7E8997]">
                    Safe sandbox: Generated workflows require explicit admin confirmation.
                  </p>
                  <button
                    onClick={handleGenerateAiProposal}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Generate Proposal
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {aiError}
                </div>
              )}

              {aiSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {aiSuccessMsg}
                </div>
              )}

              {/* Proposal Preview Box */}
              {aiProposal && (
                <div className="p-4 rounded-xl bg-[#101318] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E2530] pb-2">
                    <span className="text-xs font-semibold text-emerald-400">Structured Proposal</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {aiProposal.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{aiProposal.name}</h4>
                    <p className="text-[11px] text-[#A7B0BC] mt-0.5">{aiProposal.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-[#151A21] border border-[#29313B]">
                      <span className="text-[#7E8997] block text-[10px]">TRIGGER</span>
                      <span className="font-mono text-white">{aiProposal.triggerType}</span>
                    </div>
                    <div className="p-2 rounded bg-[#151A21] border border-[#29313B]">
                      <span className="text-[#7E8997] block text-[10px]">ACTIONS</span>
                      <span className="font-mono text-white">{aiProposal.actions?.length || 0} step(s)</span>
                    </div>
                  </div>
                  {aiProposal.approvalRequired && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      Requires human approval before sensitive actions execute.
                    </div>
                  )}
                  <button
                    onClick={handleConfirmAiProposal}
                    disabled={submitting}
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm & Arm Workflow
                  </button>
                </div>
              )}
            </div>

            {/* Quick Visual Rule Builder */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Direct Rule Configurator</h3>
                  <p className="text-xs text-[#7E8997]">Construct a rule step-by-step with typed parameters.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#7E8997] mb-1">Workflow Name</label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Lead Inbound Alert"
                    className="w-full px-3 py-2 rounded-lg bg-[#101318] border border-[#29313B] text-xs text-white placeholder-[#566171] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7E8997] mb-1">Trigger Event</label>
                  <select
                    value={manualTrigger}
                    onChange={(e) => setManualTrigger(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#101318] border border-[#29313B] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NEW_LEAD">NEW_LEAD (Inbound lead received)</option>
                    <option value="TASK_ASSIGNED">TASK_ASSIGNED (Task delegated)</option>
                    <option value="LEAVE_SUBMITTED">LEAVE_SUBMITTED (Leave submitted)</option>
                    <option value="PROJECT_DEADLINE_APPROACHING">PROJECT_DEADLINE_APPROACHING</option>
                    <option value="MANUAL_TRIGGER">MANUAL_TRIGGER (Admin manual run)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7E8997] mb-1">Primary Action</label>
                  <select
                    value={manualAction}
                    onChange={(e) => setManualAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#101318] border border-[#29313B] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CREATE_NOTIFICATION">CREATE_NOTIFICATION</option>
                    <option value="CREATE_TASK">CREATE_TASK</option>
                    <option value="CREATE_FOLLOWUP">CREATE_FOLLOWUP</option>
                    <option value="REQUEST_APPROVAL">REQUEST_APPROVAL (Human Gate)</option>
                    <option value="ALERT_ADMIN_FAILURE">ALERT_ADMIN_FAILURE</option>
                  </select>
                </div>

                <button
                  onClick={async () => {
                    if (!manualName.trim()) return;
                    setSubmitting(true);
                    try {
                      await fetch("/api/v1/automations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: manualName,
                          triggerType: manualTrigger,
                          actions: [manualAction],
                          isActive: true,
                        }),
                      });
                      setManualName("");
                      loadWorkflows();
                      setActiveTab("workflows");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting || !manualName.trim()}
                  className="w-full mt-4 py-2 rounded-lg bg-[#1B222B] hover:bg-[#202833] text-emerald-400 border border-emerald-500/25 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Rule Manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXECUTION HISTORY */}
        {activeTab === "executions" && (
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1E2530] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Execution Audit Ledger</h3>
                <p className="text-xs text-[#7E8997] mt-0.5">Chronological record of automated actions with deduplication keys.</p>
              </div>
              <button
                onClick={loadExecutions}
                className="px-3 py-1.5 rounded-lg bg-[#101318] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-white border border-[#29313B] text-xs font-medium flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2530] text-[#7E8997] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Workflow / Trigger</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Dedup Key</th>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {executions.map((ex) => (
                    <tr key={ex.id} className="hover:bg-[#101318]/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{ex.automation?.name || "Direct Trigger"}</p>
                        <p className="text-[11px] text-[#7E8997] font-mono mt-0.5">{ex.triggerEvent}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            ex.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : ex.status === "SKIPPED"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {ex.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[10px] text-[#7E8997] truncate max-w-[180px] block">
                          {ex.dedupKey || "none"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#A7B0BC] text-[11px]">
                        {new Date(ex.executedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {ex.status === "FAILED" && (
                          <button
                            onClick={() => handleRetryExecution(ex.id)}
                            className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-medium"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {executions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#7E8997]">
                        No execution records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: APPROVAL QUEUE */}
        {activeTab === "approvals" && (
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1E2530] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Human Approval Queue</h3>
                <p className="text-xs text-[#7E8997] mt-0.5">High-impact actions awaiting administrator authorization.</p>
              </div>
              <button
                onClick={loadApprovals}
                className="px-3 py-1.5 rounded-lg bg-[#101318] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-white border border-[#29313B] text-xs font-medium flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2530] text-[#7E8997] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Action Type</th>
                    <th className="px-5 py-3">Workflow & Reason</th>
                    <th className="px-5 py-3">Requested By</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {approvals.map((app) => {
                    const isPending = app.status === "PENDING";
                    const isActing = approvalActionLoading === app.id;
                    return (
                      <tr key={app.id} className="hover:bg-[#101318]/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-[11px] font-semibold text-emerald-400">
                            {app.requestType}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-white text-xs font-medium">
                            {app.metadata?.workflowName || "Automated Workflow"}
                          </p>
                          <p className="text-[11px] text-[#7E8997] mt-0.5">{app.reason}</p>
                        </td>
                        <td className="px-5 py-4 text-[#A7B0BC] text-[11px]">
                          {app.requestedBy?.name || "Workflow Engine"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              app.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : app.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isPending ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleDecideApproval(app.id, "APPROVED")}
                                disabled={isActing}
                                className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-colors disabled:opacity-50"
                              >
                                {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDecideApproval(app.id, "REJECTED")}
                                disabled={isActing}
                                className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#7E8997]">
                              Decided by {app.decidedBy?.name || "Admin"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {approvals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#7E8997]">
                        No approval requests in queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: TEMPLATE BLUEPRINT GALLERY (Templates A–L) */}
        {activeTab === "templates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Verified Enterprise Blueprints (A–L)</h3>
                <p className="text-xs text-[#7E8997] mt-0.5">
                  Idempotent one-click templates pre-configured for CRM, Delivery, Workforce, and Compliance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => {
                const isInstalling = installingTemplateId === tpl.templateId;
                return (
                  <div
                    key={tpl.templateId}
                    className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#101318] text-[#D6B779] border border-[#29313B]">
                          {tpl.category}
                        </span>
                        {tpl.approvalRequired && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Gate
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">{tpl.name}</h4>
                      <p className="text-[11px] text-[#A7B0BC] line-clamp-3">{tpl.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#1E2530]">
                      <div className="flex items-center justify-between text-[11px] text-[#7E8997]">
                        <span>Trigger</span>
                        <span className="font-mono text-white text-[10px]">{tpl.triggerType}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#7E8997]">
                        <span>Action Steps</span>
                        <span className="font-mono text-emerald-400 text-[10px]">{tpl.actions.length} action(s)</span>
                      </div>

                      <button
                        onClick={() => handleInstallTemplate(tpl.templateId)}
                        disabled={isInstalling}
                        className="w-full mt-2 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isInstalling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Install Template
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
