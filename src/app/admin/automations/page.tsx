"use client";

import { useEffect, useState } from "react";
import { Zap, Plus, Play, CheckCircle2, XCircle, Clock, Loader2, X } from "lucide-react";

export default function AdminAutomationsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("TASK_ASSIGNED");
  const [actions, setActions] = useState<string[]>(["CREATE_NOTIFICATION"]);
  const [emailTemplateKey, setEmailTemplateKey] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/v1/automations")
      .then((r) => r.json())
      .then((d) => {
        setWorkflows(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" /> Automation Workflows
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Safe trigger-action automation engine with loop protection and rate-limiting.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Create Automation Workflow</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
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
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="TASK_ASSIGNED">TASK_ASSIGNED — When a task is assigned</option>
                <option value="TASK_UPDATED">TASK_UPDATED — When task status changes</option>
                <option value="LEAVE_SUBMITTED">LEAVE_SUBMITTED — When employee requests leave</option>
                <option value="LEAVE_UPDATED">LEAVE_UPDATED — When leave is approved/rejected</option>
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
                  placeholder="e.g. TASK_ASSIGNED or WELCOME_EMAIL"
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

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Workflow Name</th>
              <th className="px-5 py-3.5">Trigger Event</th>
              <th className="px-5 py-3.5">Configured Actions</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading automations...
                  </div>
                </td>
              </tr>
            ) : workflows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  No active workflows configured. Click &quot;New Workflow&quot; to configure one.
                </td>
              </tr>
            ) : (
              workflows.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-medium text-white">{w.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                      {w.triggerType}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.isArray(w.actions) &&
                        w.actions.map((act: string, idx: number) => (
                          <span key={idx} className="text-[11px] bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-full">
                            {act}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        w.isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {w.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
