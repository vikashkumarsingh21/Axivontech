"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Loader2,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";

interface SupportIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  partnerProject: {
    id: string;
    projectCode: string;
    projectName: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  } | null;
}

interface ProjectSummary {
  id: string;
  projectCode: string;
  projectName: string;
}

export default function ClientSupportPage() {
  const [issues, setIssues] = useState<SupportIssue[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      const [issuesRes, projectsRes] = await Promise.all([
        fetch("/api/v1/client/support"),
        fetch("/api/v1/client/projects"),
      ]);

      if (issuesRes.ok) {
        const json = await issuesRes.json();
        setIssues(json.data || []);
      }
      if (projectsRes.ok) {
        const json = await projectsRes.json();
        setProjects(json.data || []);
        if (json.data?.length > 0 && !selectedProjectId) {
          setSelectedProjectId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.warning("Please provide a subject and detailed message.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/client/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          subject,
          message,
          priority,
        }),
      });

      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        const msg = parsed.errorMessage || "Failed to submit support inquiry";
        toast.error(msg);
        return;
      }

      setSubmitSuccess(true);
      toast.success("Support ticket submitted successfully. Our engineering team has been notified.");
      setSubject("");
      setMessage("");
      setShowCreateForm(false);
      fetchSupportData();
    } catch (err: unknown) {
      const cleanErr = getErrorMessage(err);
      toast.error(cleanErr);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CLOSED":
      case "PASSED":
      case "FIXED":
        return <Badge variant="success">Resolved</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="brand">In Progress</Badge>;
      case "OPEN":
      default:
        return <Badge variant="warning">Open</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
            Client Support & Technical Helpdesk
          </h1>
          <p className="text-sm text-[#7E8997] mt-0.5">
            Submit inquiries, report observations, or request technical clarification from your assigned engineers.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setSubmitSuccess(false);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{showCreateForm ? "Close Form" : "New Support Ticket"}</span>
        </Button>
      </div>

      {submitSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Your support ticket was dispatched to the technical management team. Reference logged.</span>
        </div>
      )}

      {/* New Support Ticket Modal / Form */}
      {showCreateForm && (
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardHeader className="border-b border-[#1E2530] pb-4">
            <CardTitle className="text-[#F3F5F7]">Create Support Ticket</CardTitle>
            <CardDescription className="text-[#7E8997]">
              Provide details regarding your requirement or technical observation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateTicket} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                  Associated Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#29313B] bg-[#10151B] text-xs font-medium text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} — {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                  Subject / Summary
                </label>
                <Input
                  placeholder="e.g. Issue testing payment gateway callback in staging"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#29313B] bg-[#10151B] text-xs font-medium text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="LOW">Low (Minor observation)</option>
                  <option value="MEDIUM">Medium (General question)</option>
                  <option value="HIGH">High (Urgent milestone requirement)</option>
                  <option value="CRITICAL">Critical (Blocker)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide complete steps, URLs, or reproduction observations..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-[#29313B] bg-[#10151B] text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 placeholder:text-[#566171]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                  <span>{submitting ? "Submitting..." : "Submit Ticket"}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Support History List */}
      <Card className="bg-[#151A21] border-[#29313B]">
        <CardHeader className="border-b border-[#1E2530] pb-4">
          <CardTitle className="text-[#F3F5F7]">Support Inquiries & Resolutions</CardTitle>
          <CardDescription className="text-[#7E8997]">
            History of support requests, responses, and technical resolutions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-sm text-[#7E8997]">
              Loading support requests...
            </div>
          ) : issues.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={LifeBuoy}
                title="No Support Tickets"
                description="You currently have zero active support tickets. Click 'New Support Ticket' if you require assistance."
              />
            </div>
          ) : (
            <div className="divide-y divide-[#1E2530]">
              {issues.map((issue) => (
                <div key={issue.id} className="p-5 hover:bg-[#202833]/40 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {issue.partnerProject.projectCode}
                      </span>
                      <span className="text-[#29313B]">•</span>
                      <h4 className="text-sm font-bold text-[#F3F5F7]">{issue.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          issue.severity === "CRITICAL"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : issue.severity === "HIGH"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-[#1B222B] text-[#7E8997] border-[#29313B]"
                        }`}
                      >
                        {issue.severity}
                      </span>
                      {getStatusBadge(issue.status)}
                    </div>
                  </div>

                  <p className="text-xs text-[#7E8997] leading-relaxed">
                    {issue.description}
                  </p>

                  {/* Resolution Notes if available */}
                  {issue.resolutionNotes && (
                    <div className="bg-[#101318] border border-emerald-500/20 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolution Provided by Engineering</span>
                      </div>
                      <p className="text-xs text-[#F3F5F7] leading-relaxed">{issue.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#566171] pt-2 border-t border-[#1E2530]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Submitted: {new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                    {issue.assignedTo && (
                      <span>Assigned Engineer: {issue.assignedTo.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
