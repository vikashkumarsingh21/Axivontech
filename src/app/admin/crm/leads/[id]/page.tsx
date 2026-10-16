"use client";

import { useEffect, useState, use } from "react";
import { 
  Building2, Mail, Phone, Globe, Calendar, UserCheck, CheckCircle2, 
  Clock, Plus, ArrowLeft, RefreshCw, AlertCircle, Award, UserPlus, FileText, Send, MessageSquare 
} from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [lead, setLead] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Status and Notes state
  const [noteContent, setNoteContent] = useState("");
  const [noteVisibility, setNoteVisibility] = useState("INTERNAL");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Qualification form state
  const [qualForm, setQualForm] = useState({
    budget: "",
    timeline: "",
    businessNeed: "",
    decisionMakerKnown: false,
    qualificationNotes: "",
    qualificationStatus: "QUALIFIED",
  });

  // Follow-up modal state
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({
    dueAt: "",
    type: "CALL",
    notes: "",
  });

  // Convert modal state
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({
    createOpportunity: true,
    opportunityValue: "",
    opportunityName: "",
  });

  const loadLead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${id}`);
      const data = await res.json();
      if (res.ok) {
        setLead(data.data);
        if (data.data) {
          setQualForm({
            budget: data.data.budget || "",
            timeline: data.data.timeline || "",
            businessNeed: data.data.businessNeed || "",
            decisionMakerKnown: data.data.decisionMakerKnown || false,
            qualificationNotes: data.data.qualificationNotes || "",
            qualificationStatus: data.data.qualificationStatus || "QUALIFIED",
          });
        }
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Failed to load lead details." });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    const res = await fetch("/api/v1/admin/employees?limit=100").catch(() => null);
    if (res) {
      const d = await res.json();
      setEmployees(d.data || []);
    }
  };

  useEffect(() => {
    loadLead();
    loadEmployees();
  }, [id]);

  const handleAssign = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/v1/crm/leads/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Assignment failed");
      setFeedback({ type: "success", message: "Lead assigned successfully." });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/crm/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to update lead status");
      setFeedback({ type: "success", message: `Lead status updated to ${newStatus}` });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/v1/crm/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent, visibility: noteVisibility }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to add note");
      setNoteContent("");
      setFeedback({ type: "success", message: "Internal note added successfully." });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    try {
      const res = await fetch(`/api/v1/crm/follow-ups/${followUpId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionNotes: "Completed from lead details view" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to complete follow-up");
      setFeedback({ type: "success", message: "Follow-up marked as completed." });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleQualifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/crm/leads/${id}/qualify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qualForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Qualification failed");
      setFeedback({ type: "success", message: `Lead qualification updated to ${qualForm.qualificationStatus}` });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: id,
          dueAt: followUpForm.dueAt,
          type: followUpForm.type,
          notes: followUpForm.notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Follow-up scheduling failed");
      setIsFollowUpOpen(false);
      setFeedback({ type: "success", message: "Follow-up scheduled successfully." });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/crm/leads/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Conversion failed");
      setIsConvertOpen(false);
      setFeedback({ type: "success", message: `🎉 Lead converted to Client ${d.data.client.clientCode}!` });
      loadLead();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
        Loading lead details...
      </div>
    );
  }

  if (!lead) {
    return <div className="p-8 text-center text-red-400">Lead not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/crm/leads" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Lead Inbox
        </Link>

        {lead.status !== "CONVERTED" && (
          <button
            onClick={() => setIsConvertOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all shadow-lg shadow-purple-600/20"
          >
            <Award className="w-4 h-4" /> Convert to Client
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {lead.isDuplicate && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Possible duplicate lead flagged during intake. ({lead.duplicateReason})</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-red-400 font-bold px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                {lead.leadCode}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white">
                {lead.status}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Qual: {lead.qualificationStatus}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">{lead.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{lead.companyName || "Independent Lead"}</p>
          </div>

          {/* Status & Owner Assignment Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-3 min-w-[170px]">
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Lead Status
              </label>
              <select
                value={lead.status}
                disabled={lead.status === "CONVERTED"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="MEETING">MEETING</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="NOT_QUALIFIED">NOT QUALIFIED</option>
                <option value="LOST">LOST</option>
                <option value="NURTURE">NURTURE</option>
                {lead.status === "CONVERTED" && <option value="CONVERTED">CONVERTED</option>}
              </select>
            </div>

            <div className="bg-[#18181b] border border-white/10 rounded-xl p-3 min-w-[200px]">
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Assigned Lead Owner
              </label>
              <select
                value={lead.ownerId || ""}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {employees.filter(e => e.status === "ACTIVE").map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.department || "No dept"})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Email</span>
            <a href={`mailto:${lead.email}`} className="text-white hover:underline flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> {lead.email}
            </a>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Phone & Chat</span>
            {lead.phone ? (
              <div className="flex items-center gap-2">
                <a href={`tel:${lead.phone}`} className="text-white hover:underline flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
                </a>
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                >
                  WhatsApp
                </a>
              </div>
            ) : (
              <span className="text-gray-500">—</span>
            )}
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Source</span>
            <span className="text-white">{lead.source}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Service Interest</span>
            <span className="text-white">{lead.serviceInterest || "General Inquiry"}</span>
          </div>
        </div>

        {lead.message && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#18181b] border border-white/5 text-xs">
            <span className="text-gray-400 font-semibold block mb-1">Inquiry / Message:</span>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
          </div>
        )}
      </div>

      {/* Main Grid: Qualification Form + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Qualification & Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Qualification Form */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white">Lead Qualification</h2>

            <form onSubmit={handleQualifySubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Qualification Decision</label>
                <select
                  value={qualForm.qualificationStatus}
                  onChange={(e) => setQualForm({ ...qualForm, qualificationStatus: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2"
                >
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="UNQUALIFIED">UNQUALIFIED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Estimated Budget (INR)</label>
                <input
                  type="number"
                  value={qualForm.budget}
                  onChange={(e) => setQualForm({ ...qualForm, budget: e.target.value })}
                  placeholder="e.g. 500000"
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Timeline</label>
                <input
                  type="text"
                  value={qualForm.timeline}
                  onChange={(e) => setQualForm({ ...qualForm, timeline: e.target.value })}
                  placeholder="e.g. 2-3 months"
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Business Need</label>
                <textarea
                  value={qualForm.businessNeed}
                  onChange={(e) => setQualForm({ ...qualForm, businessNeed: e.target.value })}
                  rows={2}
                  placeholder="Client business requirement..."
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  id="decisionMaker"
                  checked={qualForm.decisionMakerKnown}
                  onChange={(e) => setQualForm({ ...qualForm, decisionMakerKnown: e.target.checked })}
                  className="rounded border-white/10"
                />
                <label htmlFor="decisionMaker">Decision maker identified</label>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-600/20"
              >
                Save Qualification
              </button>
            </form>
          </div>

          {/* Quick Schedule Follow-up */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Follow-ups</h2>
              <button
                onClick={() => setIsFollowUpOpen(true)}
                className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule
              </button>
            </div>

            {lead.followUps?.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">No follow-ups scheduled.</p>
            ) : (
              <div className="space-y-2">
                {lead.followUps?.map((f: any) => (
                  <div key={f.id} className="p-3 rounded-xl bg-[#18181b] border border-white/5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{f.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${f.status === "COMPLETED" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                        {f.status}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">{new Date(f.dueAt).toLocaleString("en-IN")}</p>
                    {f.notes && <p className="text-gray-500 mt-1 italic">{f.notes}</p>}
                    {f.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleCompleteFollowUp(f.id)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-green-400 hover:text-green-300 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Timeline & Activity History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunities created from this lead */}
          {lead.opportunities?.length > 0 && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">Linked Opportunities</h2>
              <div className="space-y-2">
                {lead.opportunities.map((opp: any) => (
                  <div key={opp.id} className="p-3 rounded-xl bg-[#18181b] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-red-400 font-bold">{opp.opportunityCode}</span>
                      <p className="text-white font-semibold mt-0.5">{opp.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold font-mono">₹{opp.value}</span>
                      <span className="block text-gray-400 text-[10px] mt-0.5">{opp.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes Section */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" /> Internal Notes & Collaboration
            </h2>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log internal discussions, lead background, call outcomes..."
                rows={3}
                className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-red-500/50 resize-none"
              />
              <div className="flex items-center justify-between">
                <select
                  value={noteVisibility}
                  onChange={(e) => setNoteVisibility(e.target.value)}
                  className="bg-[#1e1e1e] border border-white/10 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="INTERNAL">Internal Only (Staff)</option>
                  <option value="PARTNER_VISIBLE">Partner Visible</option>
                </select>
                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-red-600/20"
                >
                  {submittingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>

            <div className="space-y-2.5 mt-3 pt-3 border-t border-white/5">
              {!lead.notes || lead.notes.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No internal notes logged yet.</p>
              ) : (
                lead.notes.map((n: any) => (
                  <div key={n.id} className="p-3 bg-[#18181b] border border-white/5 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{n.author?.name || "Staff"}</span>
                      <span className="text-[10px] text-gray-500">{new Date(n.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{n.content}</p>
                    <span className="inline-block text-[9px] uppercase tracking-wider text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                      {n.visibility}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-6">Activity Timeline</h2>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
              {lead.activities?.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No recorded activity history.</p>
              ) : (
                lead.activities?.map((act: any) => (
                  <div key={act.id} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{act.title}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(act.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                      {act.notes && <p className="text-gray-400 mt-1">{act.notes}</p>}
                      {act.actor && <p className="text-gray-500 text-[10px] mt-2">By: {act.actor.name}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {isFollowUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Schedule Follow-up</h2>
            <form onSubmit={handleFollowUpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={followUpForm.type}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2"
                >
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                  <option value="DEMO">Demo</option>
                  <option value="PROPOSAL_FOLLOWUP">Proposal Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Due Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={followUpForm.dueAt}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, dueAt: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes / Agenda</label>
                <textarea
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFollowUpOpen(false)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white text-xs rounded-xl">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Client Modal */}
      {isConvertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Convert Lead to Client</h2>
            <p className="text-xs text-gray-400">This will convert lead <b>{lead.leadCode}</b> into a Client profile.</p>

            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  id="createOpp"
                  checked={convertForm.createOpportunity}
                  onChange={(e) => setConvertForm({ ...convertForm, createOpportunity: e.target.checked })}
                />
                <label htmlFor="createOpp">Create initial opportunity in pipeline</label>
              </div>

              {convertForm.createOpportunity && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Opportunity Value (INR)</label>
                    <input
                      type="number"
                      value={convertForm.opportunityValue}
                      onChange={(e) => setConvertForm({ ...convertForm, opportunityValue: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl px-3 py-2"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsConvertOpen(false)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl font-semibold">Convert Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
