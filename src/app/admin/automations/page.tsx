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
  History,
  Server,
  Layers,
  AlertTriangle,
  Send,
  Bell,
  Activity,
  ArrowRight,
} from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  triggerType: string;
  actions: string[];
  conditions?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  createdBy?: { name: string; email: string } | null;
}

interface Execution {
  id: string;
  automationId: string;
  automation?: { id: string; name: string; triggerType: string };
  triggerEvent: string;
  status: "SUCCESS" | "FAILED" | string;
  dedupKey?: string;
  result?: any;
  executedAt: string;
}

interface BackgroundJob {
  id: string;
  jobType: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | string;
  payload?: any;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string;
  completedAt?: string;
  error?: string;
}

export default function AdminAutomationsPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "executions" | "jobs">("workflows");

  // Workflows state
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("TASK_ASSIGNED");
  const [actions, setActions] = useState<string[]>(["CREATE_NOTIFICATION"]);
  const [emailTemplateKey, setEmailTemplateKey] = useState("");

  // Executions state
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(false);

  // Background jobs state
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({
    PENDING: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    FAILED: 0,
  });
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [runningJobType, setRunningJobType] = useState<string | null>(null);
  const [processBanner, setProcessBanner] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load Workflows
  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true);
    try {
      const res = await fetch("/api/v1/automations");
      const d = await res.json();
      setWorkflows(d.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingWorkflows(false);
    }
  }, []);

  // Load Executions
  const loadExecutions = useCallback(async () => {
    setLoadingExecutions(true);
    try {
      const res = await fetch("/api/v1/automations/executions");
      const d = await res.json();
      setExecutions(d.executions || []);
    } catch {
      // ignore
    } finally {
      setLoadingExecutions(false);
    }
  }, []);

  // Load Background Jobs
  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/v1/jobs");
      const d = await res.json();
      setJobs(d.jobs || []);
      if (d.counts) setJobCounts(d.counts);
    } catch {
      // ignore
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  useEffect(() => {
    if (activeTab === "executions") loadExecutions();
    if (activeTab === "jobs") loadJobs();
  }, [activeTab, loadExecutions, loadJobs]);

  const handleActionToggle = (actionName: string) => {
    setActions((prev) =>
      prev.includes(actionName) ? prev.filter((a) => a !== actionName) : [...prev, actionName]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          triggerType,
          actions,
          emailTemplateKey: emailTemplateKey || undefined,
          isActive: true,
        }),
      });
      if (res.ok) {
        setName("");
        setEmailTemplateKey("");
        setShowModal(false);
        loadWorkflows();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleWorkflow = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v1/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        loadWorkflows();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation workflow?")) return;
    try {
      const res = await fetch(`/api/v1/automations/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadWorkflows();
      }
    } catch {
      // ignore
    }
  };

  // Run pending jobs manually
  const handleRunPendingJobs = async () => {
    setRunningJobType("ALL");
    setProcessBanner(null);
    try {
      const res = await fetch("/api/v1/jobs/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setProcessBanner({
          message: `Successfully processed ${data.processedCount || 0} background job(s).`,
          type: "success",
        });
        if (activeTab === "jobs") loadJobs();
        if (activeTab === "executions") loadExecutions();
      } else {
        setProcessBanner({
          message: data.error || "Failed to process jobs",
          type: "error",
        });
      }
    } catch (e: any) {
      setProcessBanner({ message: e.message || "Failed to trigger jobs", type: "error" });
    } finally {
      setRunningJobType(null);
    }
  };

  // Enqueue a specific job type manually
  const handleEnqueueJob = async (jobType: string) => {
    setRunningJobType(jobType);
    setProcessBanner(null);
    try {
      const res = await fetch("/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType }),
      });
      const data = await res.json();
      if (res.ok) {
        setProcessBanner({
          message: `Job ${jobType} enqueued. Executing runner...`,
          type: "success",
        });
        // Auto process it immediately
        await fetch("/api/v1/jobs/process", { method: "POST" });
        loadJobs();
      } else {
        setProcessBanner({ message: data.error || "Failed to enqueue job", type: "error" });
      }
    } catch (e: any) {
      setProcessBanner({ message: e.message || "Error enqueuing job", type: "error" });
    } finally {
      setRunningJobType(null);
    }
  };

  return (
    <div className="space-y-6 text-white min-h-[85vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" /> Business Automation & Notification Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Safe trigger-action workflow engine with idempotent deduplication, rate limiting, and background job worker.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRunPendingJobs}
            disabled={runningJobType === "ALL"}
            className="flex items-center gap-2 bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            title="Trigger immediate execution of all scheduled background jobs"
          >
            {runningJobType === "ALL" ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            )}
            Run Pending Jobs
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        </div>
      </div>

      {/* Process feedback notification */}
      {processBanner && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between ${
            processBanner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {processBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{processBanner.message}</span>
          </div>
          <button onClick={() => setProcessBanner(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("workflows")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "workflows"
              ? "bg-[#151A21] text-amber-400 border border-[#29313B]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Workflows</span>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
            {workflows.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("executions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "executions"
              ? "bg-[#151A21] text-amber-400 border border-[#29313B]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Execution History</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "jobs"
              ? "bg-[#151A21] text-amber-400 border border-[#29313B]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Background Jobs</span>
          {jobCounts.PENDING > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              {jobCounts.PENDING} pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: WORKFLOWS */}
      {activeTab === "workflows" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Configured Automated Triggers & Actions
            </span>
            <button
              onClick={loadWorkflows}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Workflow Name</th>
                <th className="px-5 py-3.5">Trigger Event</th>
                <th className="px-5 py-3.5">Configured Actions</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingWorkflows ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading workflows...
                    </div>
                  </td>
                </tr>
              ) : workflows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No active workflows configured. Click &quot;New Workflow&quot; to configure one.
                  </td>
                </tr>
              ) : (
                workflows.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{w.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Created {new Date(w.createdAt).toLocaleDateString()}
                        {w.createdBy?.name ? ` by ${w.createdBy.name}` : ""}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded">
                        {w.triggerType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {Array.isArray(w.actions) &&
                          w.actions.map((act: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              {act === "CREATE_NOTIFICATION" && <Bell className="w-3 h-3 text-cyan-400" />}
                              {act === "SEND_EMAIL" && <Send className="w-3 h-3 text-amber-400" />}
                              {act === "CREATE_ACTIVITY" && <Activity className="w-3 h-3 text-emerald-400" />}
                              {act === "CREATE_FOLLOWUP" && <Clock className="w-3 h-3 text-purple-400" />}
                              {act}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleWorkflow(w.id, w.isActive)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          w.isActive
                            ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-gray-500/20"
                        }`}
                        title="Click to toggle status"
                      >
                        {w.isActive ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteWorkflow(w.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: EXECUTION HISTORY */}
      {activeTab === "executions" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Recent Automation Executions & Deduplication Audit Log
            </span>
            <button
              onClick={loadExecutions}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Workflow / Event</th>
                <th className="px-5 py-3.5">Trigger</th>
                <th className="px-5 py-3.5">Dedup Key</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingExecutions ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading execution log...
                    </div>
                  </td>
                </tr>
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No execution records recorded yet. Executions are logged whenever platform events trigger workflows.
                  </td>
                </tr>
              ) : (
                executions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-medium text-white">
                      {ex.automation?.name || `Workflow ${ex.automationId.slice(0, 8)}`}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-amber-400">
                      {ex.triggerEvent}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500 truncate max-w-xs">
                      {ex.dedupKey || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          ex.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {ex.status === "SUCCESS" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(ex.executedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BACKGROUND JOBS */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          {/* Quick Enqueue Strip */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Quick Scheduled Job Enqueue & Run</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: "TASK_DEADLINE_CHECK", label: "Check Task Deadlines", desc: "Alert tasks due in 24h" },
                { type: "MILESTONE_DEADLINE_CHECK", label: "Check Milestone Due", desc: "Alert milestones in 48h" },
                { type: "REMINDER_CHECK", label: "Process Reminders", desc: "Check upcoming reminders" },
                { type: "ANNOUNCEMENT_PUBLISH", label: "Publish Announcements", desc: "Publish / expire posts" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleEnqueueJob(item.type)}
                  disabled={runningJobType === item.type}
                  className="flex flex-col items-start p-3.5 bg-[#161618] hover:bg-[#1f1f23] border border-white/5 hover:border-amber-500/30 rounded-xl transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-white">{item.label}</span>
                    {runningJobType === item.type ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161618]">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Background Job Queue & Execution Status
              </span>
              <button
                onClick={loadJobs}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Job Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Attempts</th>
                  <th className="px-5 py-3.5">Scheduled At</th>
                  <th className="px-5 py-3.5">Result / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingJobs ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading background jobs...
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      No background jobs queued. Use the quick triggers above or let automated cron schedule them.
                    </td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-white">
                        {j.jobType}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            j.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : j.status === "PROCESSING"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : j.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {j.attempts} / {j.maxAttempts}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(j.scheduledAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 truncate max-w-xs">
                        {j.error ? (
                          <span className="text-red-400 font-mono">{j.error}</span>
                        ) : j.completedAt ? (
                          <span className="text-emerald-400">Completed {new Date(j.completedAt).toLocaleTimeString()}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE WORKFLOW MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Create Automation Workflow</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Workflow Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Task Assigned Notification & Activity Log"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Trigger Event *</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="TASK_ASSIGNED">TASK_ASSIGNED — When a task is assigned</option>
                <option value="TASK_UPDATED">TASK_UPDATED — When task status changes</option>
                <option value="LEAVE_SUBMITTED">LEAVE_SUBMITTED — When employee requests leave</option>
                <option value="LEAVE_UPDATED">LEAVE_UPDATED — When leave is approved/rejected</option>
                <option value="WORK_REPORT_SUBMITTED">WORK_REPORT_SUBMITTED — When employee submits work report</option>
                <option value="NEW_LEAD">NEW_LEAD — When a CRM lead is created</option>
                <option value="FOLLOW_UP_DUE">FOLLOW_UP_DUE — When CRM follow-up is due</option>
                <option value="ANNOUNCEMENT_PUBLISHED">ANNOUNCEMENT_PUBLISHED — When announcement goes live</option>
                <option value="DOCUMENT_SHARED">DOCUMENT_SHARED — When a new document is uploaded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Automated Actions</label>
              <div className="space-y-2">
                {[
                  { id: "CREATE_NOTIFICATION", label: "Create In-App Notification" },
                  { id: "CREATE_ACTIVITY", label: "Log to Operational Activity Feed" },
                  { id: "SEND_EMAIL", label: "Send Automated Email" },
                  { id: "CREATE_FOLLOWUP", label: "Schedule CRM Follow-Up" },
                ].map((act) => (
                  <label key={act.id} className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={actions.includes(act.id)}
                      onChange={() => handleActionToggle(act.id)}
                      className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0"
                    />
                    <span>{act.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {actions.includes("SEND_EMAIL") && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email Template Key</label>
                <input
                  value={emailTemplateKey}
                  onChange={(e) => setEmailTemplateKey(e.target.value)}
                  placeholder="e.g. TASK_ASSIGNED, WELCOME_EMAIL, or NEW_WEBSITE_LEAD"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || actions.length === 0}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Workflow
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
