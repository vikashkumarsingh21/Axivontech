"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, RefreshCw, AlertCircle, Loader2,
  ExternalLink, FileText, CheckCircle2, Clock, Star,
  X, MessageSquare, ArrowLeft, Trash2, Mail, Phone,
  MapPin, Globe, Link2, ChevronRight, Save
} from "lucide-react";

interface Application {
  id: string;
  jobId?: string | null;
  jobTitle: string;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  experience?: string | null;
  currentRole?: string | null;
  resumeUrl: string;
  resumeFileName?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  coverLetter?: string | null;
  status: "NEW" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED";
  adminNotes?: string | null;
  rating?: number | null;
  reviewedAt?: string | null;
  reviewedBy?: { id: string; name: string; email: string } | null;
  createdAt: string;
  job?: { id: string; title: string; slug: string; department: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: "New Application", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  SHORTLISTED: { label: "Shortlisted", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  INTERVIEW: { label: "Interview", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  SELECTED: { label: "Offer / Selected", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  REJECTED: { label: "Archived / Rejected", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [jobsList, setJobsList] = useState<{ id: string; title: string }[]>([]);

  // Review Drawer state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("NEW");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/v1/admin/careers/applications", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (jobFilter !== "ALL") url.searchParams.set("jobId", jobFilter);
      if (search.trim()) url.searchParams.set("search", search.trim());
      url.searchParams.set("limit", "100");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, jobFilter, search]);

  // Load distinct jobs for filtering
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/v1/admin/careers/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobsList(data.jobs || []);
        }
      } catch (e) {
        // Ignore
      }
    }
    loadJobs();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchApplications();
    }, 200);
    return () => clearTimeout(t);
  }, [fetchApplications]);

  const openReviewDrawer = (app: Application) => {
    setSelectedApp(app);
    setReviewStatus(app.status);
    setReviewNotes(app.adminNotes || "");
    setReviewRating(app.rating || 0);
    setNotesSavedSuccess(false);
  };

  const handleUpdateReview = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    setNotesSavedSuccess(false);
    try {
      const res = await fetch(`/api/v1/admin/careers/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          adminNotes: reviewNotes,
          rating: reviewRating || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data) || "Failed to update review.");

      // Update state
      setSelectedApp(data.application);
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? data.application : a))
      );
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 3000);
    } catch (e: any) {
      toast.error("Failed: " + getErrorMessage(e));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/careers/applications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        if (selectedApp?.id === id) setSelectedApp(null);
        fetchApplications();
      }
    } catch (e: any) {
      toast.error("Failed to delete application: " + getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === "NEW").length,
    underReview: applications.filter((a) => a.status === "UNDER_REVIEW").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/careers"
                className="p-1 rounded-lg text-[#7E8997] hover:text-white hover:bg-[#1B222B] transition-colors"
                title="Back to Job Postings"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Candidate Applications</h1>
            </div>
            <p className="text-xs text-[#7E8997]">
              Review submitted candidate resumes, screen applicants, and record internal evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/careers"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-all shadow-xs"
            >
              Job Postings Manager
            </Link>
            <button
              onClick={fetchApplications}
              className="p-2 bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white rounded-xl text-xs transition-colors"
              title="Refresh applications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Applications", val: stats.total, color: "text-white" },
            { label: "New (Unreviewed)", val: stats.new, color: "text-cyan-400" },
            { label: "Under Review", val: stats.underReview, color: "text-amber-400" },
            { label: "Shortlisted", val: stats.shortlisted, color: "text-emerald-400" },
            { label: "Interviewing", val: stats.interview, color: "text-purple-400" },
          ].map((st) => (
            <div key={st.label} className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4 shadow-xs">
              <p className={`text-2xl font-bold font-mono ${st.color}`}>{st.val}</p>
              <p className="text-[11px] text-[#7E8997] font-medium mt-1">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-[#151A21] border border-[#29313B] rounded-2xl p-3 shadow-xs">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#566171] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, email, or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500/50 max-w-xs truncate"
            >
              <option value="ALL">All Job Roles</option>
              {jobsList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Applications Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#151A21] border border-[#29313B] rounded-2xl">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mb-3" />
            <p className="text-xs text-[#7E8997]">Loading candidate applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#151A21] border border-[#29313B] rounded-2xl text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#566171]" />
            </div>
            <p className="text-sm font-semibold text-white">No applications found</p>
            <p className="text-xs text-[#7E8997] max-w-sm mt-1">
              Applications submitted by candidates on the public careers portal will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#29313B] bg-[#101318]/50 text-[#7E8997] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3.5">Candidate Details</th>
                    <th className="px-4 py-3.5">Position Applied</th>
                    <th className="px-4 py-3.5">Location & Exp</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date Submitted</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {applications.map((app) => {
                    const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => openReviewDrawer(app)}
                        className="hover:bg-[#1B222B]/50 transition-colors cursor-pointer group"
                      >
                        {/* Candidate Details */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {app.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {app.fullName}
                              </p>
                              <p className="text-[#7E8997] text-[11px] font-mono">{app.email}</p>
                              {app.phone && (
                                <p className="text-[#566171] text-[10px]">{app.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Applied Job */}
                        <td className="px-4 py-4">
                          <span className="font-medium text-white text-xs block">
                            {app.job?.title || app.jobTitle}
                          </span>
                          {app.job?.department && (
                            <span className="text-[10px] text-[#7E8997]">
                              {app.job.department}
                            </span>
                          )}
                        </td>

                        {/* Location & Experience */}
                        <td className="px-4 py-4 text-[#A7B0BC]">
                          <p>{app.location || "Remote"}</p>
                          {app.experience && (
                            <p className="text-[10px] text-[#566171]">{app.experience}</p>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.color}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-[#7E8997] font-mono text-[11px]">
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-5 py-4 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Resume"
                              className="p-1.5 rounded-lg text-[#7E8997] hover:text-white hover:bg-[#202833] transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => openReviewDrawer(app)}
                              title="Review Application"
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1"
                            >
                              Review <ChevronRight className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => setDeleteId(app.id)}
                              title="Delete record"
                              className="p-1.5 rounded-lg text-[#7E8997] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidate Review Drawer Modal */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-end"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedApp(null);
              }}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-[#151A21] border-l border-[#29313B] w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#1E2530] flex items-start justify-between bg-[#101318]/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedApp.fullName}</h2>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          STATUS_CONFIG[selectedApp.status]?.bg
                        } ${STATUS_CONFIG[selectedApp.status]?.color}`}
                      >
                        {STATUS_CONFIG[selectedApp.status]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">
                      Applied for: {selectedApp.job?.title || selectedApp.jobTitle}
                    </p>
                    <p className="text-[10px] text-[#566171] mt-1">
                      Submitted on{" "}
                      {new Date(selectedApp.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-1.5 rounded-lg text-[#7E8997] hover:text-white hover:bg-[#202833]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                  {/* Candidate Quick Contact Strip */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#101318] border border-[#29313B] rounded-2xl">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[#A7B0BC]">
                        <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <a href={`mailto:${selectedApp.email}`} className="hover:underline truncate">
                          {selectedApp.email}
                        </a>
                      </div>
                      {selectedApp.phone && (
                        <div className="flex items-center gap-2 text-[#A7B0BC]">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <a href={`tel:${selectedApp.phone}`} className="hover:underline">
                            {selectedApp.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[#A7B0BC]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{selectedApp.location || "Remote"}</span>
                      </div>
                      {selectedApp.experience && (
                        <div className="flex items-center gap-2 text-[#A7B0BC]">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Exp: {selectedApp.experience}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resume Action Bar */}
                  <div className="p-4 bg-[#1B222B]/60 border border-[#29313B] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">Candidate Resume / CV</p>
                        <p className="text-[10px] text-[#7E8997]">
                          {selectedApp.resumeFileName || "Uploaded Document"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      View Resume <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Portfolio & External Profile Links */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-[#A7B0BC] uppercase tracking-wider">
                      Professional Profiles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.linkedinUrl && (
                        <a
                          href={selectedApp.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101318] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn Profile
                        </a>
                      )}
                      {selectedApp.githubUrl && (
                        <a
                          href={selectedApp.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101318] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5 text-white" /> GitHub Repositories
                        </a>
                      )}
                      {selectedApp.portfolioUrl && (
                        <a
                          href={selectedApp.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101318] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-400" /> Portfolio Site
                        </a>
                      )}
                      {!selectedApp.linkedinUrl && !selectedApp.githubUrl && !selectedApp.portfolioUrl && (
                        <span className="text-[#566171] italic text-xs">No external links supplied.</span>
                      )}
                    </div>
                  </div>

                  {/* Cover Note */}
                  {selectedApp.coverLetter && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-[#A7B0BC] uppercase tracking-wider">
                        Cover Note / Motivation
                      </p>
                      <div className="p-4 bg-[#101318] border border-[#29313B] rounded-2xl text-[#A7B0BC] leading-relaxed whitespace-pre-wrap">
                        {selectedApp.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* Screening Workflow Section */}
                  <div className="pt-4 border-t border-[#1E2530] space-y-4">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Hiring Evaluation & Status
                    </p>

                    <div>
                      <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                        Application Status
                      </label>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="NEW">New</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="SHORTLISTED">Shortlisted for Technical Assessment</option>
                        <option value="INTERVIEW">Interview Scheduled</option>
                        <option value="SELECTED">Offer Extended / Selected</option>
                        <option value="REJECTED">Archived / Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                        Candidate Rating (1–5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              reviewRating >= star
                                ? "bg-[#D6B779]/15 border-[#D6B779]/30 text-[#D6B779]"
                                : "bg-[#101318] border-[#29313B] text-[#566171] hover:text-[#A7B0BC]"
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                        Internal Admin Review Notes (Private)
                      </label>
                      <textarea
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add private technical feedback, interview notes, or evaluation details..."
                        className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    {selectedApp.reviewedBy && (
                      <p className="text-[10px] text-[#566171]">
                        Last reviewed by {selectedApp.reviewedBy.name} on{" "}
                        {selectedApp.reviewedAt
                          ? new Date(selectedApp.reviewedAt).toLocaleDateString()
                          : "recent"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-[#1E2530] bg-[#101318]/50 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">
                    {notesSavedSuccess ? "✓ Review updated successfully!" : ""}
                  </span>

                  <button
                    onClick={handleUpdateReview}
                    disabled={savingNotes}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {savingNotes ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Evaluation
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-white">Delete Candidate Application?</h3>
                <p className="text-xs text-[#7E8997] mt-1 mb-5">
                  Are you sure you want to delete this applicant record? This action cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-white bg-[#101318] border border-[#29313B] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    disabled={deleting}
                    className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-all"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
