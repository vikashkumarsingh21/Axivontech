"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff,
  Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, X,
  Save, Loader2, ExternalLink, Users, FileText, ChevronRight,
  Sparkles, Check, ArrowUpDown
} from "lucide-react";

interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: string;
  employmentType: string;
  workArrangement: string;
  location: string;
  experienceLevel: string;
  stipend?: string | null;
  salaryRange?: string | null;
  summary: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  preferredSkills: string[];
  benefits: string[];
  deadline?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  isFeatured: boolean;
  displayOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  _count?: { applications: number };
}

interface StatsData {
  jobs: {
    total: number;
    published: number;
    draft: number;
    closed: number;
    archived: number;
  };
  applications: {
    total: number;
    new: number;
    underReview: number;
    shortlisted: number;
    interview: number;
    rejected: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label: "Published", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  DRAFT: { label: "Draft", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  CLOSED: { label: "Closed", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  ARCHIVED: { label: "Archived", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
};

const EMPTY_JOB_FORM = {
  title: "",
  slug: "",
  department: "Engineering",
  employmentType: "Internship",
  workArrangement: "Remote",
  location: "Remote (India)",
  experienceLevel: "0–1 Years / Freshers Welcome",
  stipend: "Performance-Based / Competitive for Interns",
  salaryRange: "",
  summary: "",
  description: "",
  responsibilities: [""],
  qualifications: [""],
  skills: "",
  benefits: [
    "100% Remote flexibility",
    "Direct mentorship from founding engineers",
    "Work on live client & internal platforms",
  ],
  deadline: "",
  status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED",
  isFeatured: false,
  displayOrder: 0,
  seoTitle: "",
  seoDescription: "",
};

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [careersPageEnabled, setCareersPageEnabled] = useState<boolean | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(EMPTY_JOB_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Active form tab in modal
  const [formTab, setFormTab] = useState<"basics" | "content" | "settings">("basics");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, statsRes, settingsRes] = await Promise.all([
        fetch("/api/v1/admin/careers/jobs"),
        fetch("/api/v1/admin/careers/stats"),
        fetch("/api/v1/admin/careers/settings"),
      ]);

      if (!jobsRes.ok) throw new Error("Failed to load jobs");
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCareersPageEnabled(Boolean(settingsData?.settings?.careersPageEnabled));
      }
    } catch (e: any) {
      setError(e.message || "An error occurred fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingJob(null);
    setForm(EMPTY_JOB_FORM);
    setFormTab("basics");
    setSaveError(null);
    setShowModal(true);
  };

  const openEditModal = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      slug: job.slug,
      department: job.department,
      employmentType: job.employmentType,
      workArrangement: job.workArrangement,
      location: job.location,
      experienceLevel: job.experienceLevel,
      stipend: job.stipend || "",
      salaryRange: job.salaryRange || "",
      summary: job.summary,
      description: job.description,
      responsibilities: job.responsibilities.length ? job.responsibilities : [""],
      qualifications: job.qualifications.length ? job.qualifications : [""],
      skills: job.skills.join(", "),
      benefits: job.benefits.length ? job.benefits : [""],
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      status: job.status,
      isFeatured: job.isFeatured,
      displayOrder: job.displayOrder,
      seoTitle: job.seoTitle || "",
      seoDescription: job.seoDescription || "",
    });
    setFormTab("basics");
    setSaveError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.department.trim() || !form.summary.trim()) {
      setSaveError("Title, Department, and Summary are required fields.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      skills: skillsArray,
      responsibilities: form.responsibilities.filter((r) => r.trim().length > 0),
      qualifications: form.qualifications.filter((q) => q.trim().length > 0),
      benefits: form.benefits.filter((b) => b.trim().length > 0),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };

    try {
      const url = editingJob
        ? `/api/v1/admin/careers/jobs/${editingJob.id}`
        : "/api/v1/admin/careers/jobs";
      const method = editingJob ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to save job posting.");
      }

      setShowModal(false);
      fetchData();
    } catch (e: any) {
      setSaveError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job: JobPosting) => {
    const nextStatus = job.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED";
    try {
      const res = await fetch(`/api/v1/admin/careers/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/careers/jobs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchData();
      }
    } catch (e: any) {
      toast.error("Delete failed: " + getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  // Dynamic list manipulation
  const updateListItem = (field: "responsibilities" | "qualifications" | "benefits", index: number, val: string) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = val;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field: "responsibilities" | "qualifications" | "benefits") => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeListItem = (field: "responsibilities" | "qualifications" | "benefits", index: number) => {
    setForm((prev) => {
      const list = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: list.length ? list : [""] };
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
    const matchesDept = deptFilter === "ALL" || job.department === deptFilter;
    const matchesSearch =
      !search.trim() ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Careers & Recruitment</h1>
              {careersPageEnabled !== null && (
                <Link
                  href="/admin/careers/settings"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                    careersPageEnabled
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-rose-500/20"
                  }`}
                  title={
                    careersPageEnabled
                      ? "Public Careers page is LIVE (/careers). Click to manage settings."
                      : "Public Careers page is DISABLED (returns 404). Click to enable."
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${careersPageEnabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  {careersPageEnabled ? "Public: LIVE (ON)" : "Public: HIDDEN (OFF)"}
                </Link>
              )}
            </div>
            <p className="text-xs text-[#7E8997]">
              Manage job postings, review live openings, and track candidate applications.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/careers/applications"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              View Applications
              {stats?.applications.new ? (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                  {stats.applications.new}
                </span>
              ) : null}
            </Link>

            <Link
              href="/admin/careers/settings"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-all shadow-xs"
            >
              <span>Page Settings</span>
              {careersPageEnabled !== null && (
                <span
                  className={`w-2 h-2 rounded-full ${careersPageEnabled ? "bg-emerald-400" : "bg-rose-400"}`}
                  title={careersPageEnabled ? "Public: ON" : "Public: OFF"}
                />
              )}
            </Link>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-[#04130E] rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Job Posting
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Positions", val: stats?.jobs.total ?? jobs.length, color: "text-white" },
            { label: "Published (Live)", val: stats?.jobs.published ?? 0, color: "text-emerald-400" },
            { label: "Drafts", val: stats?.jobs.draft ?? 0, color: "text-amber-400" },
            { label: "Closed", val: stats?.jobs.closed ?? 0, color: "text-rose-400" },
            { label: "Total Applications", val: stats?.applications.total ?? 0, color: "text-cyan-400" },
          ].map((st) => (
            <div key={st.label} className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4 shadow-xs">
              <p className={`text-2xl font-bold font-mono ${st.color}`}>{st.val}</p>
              <p className="text-[11px] text-[#7E8997] font-medium mt-1">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-[#151A21] border border-[#29313B] rounded-2xl p-3 shadow-xs">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#566171] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, department, or skill…"
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
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="AI & Automation">AI & Automation</option>
              <option value="Design">Design</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={fetchData}
              title="Refresh listings"
              className="p-2 bg-[#101318] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white rounded-xl text-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Jobs Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#151A21] border border-[#29313B] rounded-2xl">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mb-3" />
            <p className="text-xs text-[#7E8997]">Loading job vacancies...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#151A21] border border-[#29313B] rounded-2xl text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5 text-[#566171]" />
            </div>
            <p className="text-sm font-semibold text-white">No job postings found</p>
            <p className="text-xs text-[#7E8997] max-w-sm mt-1">
              {search || statusFilter !== "ALL" || deptFilter !== "ALL"
                ? "No positions matched your selected filters. Try resetting search parameters."
                : "Get started by creating your first job posting for the careers page."}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#04130E] rounded-xl text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Create First Job
            </button>
          </div>
        ) : (
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#29313B] bg-[#101318]/50 text-[#7E8997] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3.5">Position & Role</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Experience</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Applicants</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {filteredJobs.map((job) => {
                    const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <tr key={job.id} className="hover:bg-[#1B222B]/40 transition-colors group">
                        {/* Title & summary */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1B222B] border border-[#29313B] flex items-center justify-center shrink-0 mt-0.5">
                              <Briefcase className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">
                                  {job.title}
                                </span>
                                {job.isFeatured && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-[#7E8997] line-clamp-1 mt-0.5 max-w-md">{job.summary}</p>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#566171]">
                                <span>{job.workArrangement}</span>
                                <span>•</span>
                                <span>{job.employmentType}</span>
                                <span>•</span>
                                <span className="font-mono">/careers/{job.slug}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#101318] border border-[#29313B] text-[#A7B0BC] font-medium text-[11px]">
                            {job.department}
                          </span>
                        </td>

                        {/* Experience */}
                        <td className="px-4 py-4 text-[#A7B0BC] font-medium">
                          {job.experienceLevel}
                        </td>

                        {/* Status with quick toggle */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleStatus(job)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${statusCfg.bg} ${statusCfg.color} hover:brightness-125`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {statusCfg.label}
                          </button>
                        </td>

                        {/* Applicants */}
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/careers/applications?jobId=${job.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101318] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-mono font-bold text-white">
                              {job._count?.applications ?? 0}
                            </span>
                          </Link>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {job.status === "PUBLISHED" && (
                              <Link
                                href={`/careers/${job.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="View public listing"
                                className="p-1.5 rounded-lg text-[#7E8997] hover:text-white hover:bg-[#202833] transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}

                            <button
                              onClick={() => openEditModal(job)}
                              title="Edit job"
                              className="p-1.5 rounded-lg text-[#7E8997] hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirm(job.id)}
                              title="Delete job"
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

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowModal(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-[#1E2530] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
                      </h3>
                      <p className="text-xs text-[#7E8997]">
                        Fill in role specifications, requirements, and publication details.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 text-[#7E8997] hover:text-white rounded-lg hover:bg-[#202833] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Navigation Tabs */}
                <div className="flex border-b border-[#1E2530] px-6 bg-[#101318]/50">
                  {[
                    { id: "basics", label: "1. Role Details" },
                    { id: "content", label: "2. Responsibilities & Skills" },
                    { id: "settings", label: "3. Status & SEO" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormTab(t.id as any)}
                      className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                        formTab === t.id
                          ? "border-emerald-500 text-emerald-400"
                          : "border-transparent text-[#7E8997] hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  {saveError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {saveError}
                    </div>
                  )}

                  {formTab === "basics" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Job Title <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Frontend Developer Intern"
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Department <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="AI & Automation">AI & Automation</option>
                            <option value="Design">Design</option>
                            <option value="Operations">Operations</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Employment Type
                          </label>
                          <select
                            value={form.employmentType}
                            onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="Internship">Internship</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Work Arrangement
                          </label>
                          <select
                            value={form.workArrangement}
                            onChange={(e) => setForm({ ...form, workArrangement: e.target.value })}
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="Remote">100% Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-site">On-site</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Location
                          </label>
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="Remote (India)"
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Experience Requirement
                          </label>
                          <input
                            type="text"
                            value={form.experienceLevel}
                            onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                            placeholder="0–1 Years / Freshers Welcome"
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Stipend / Compensation Note
                          </label>
                          <input
                            type="text"
                            value={form.stipend}
                            onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                            placeholder="Performance-Based / Competitive for Interns"
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                          Short Summary (Card Preview) <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={form.summary}
                          onChange={(e) => setForm({ ...form, summary: e.target.value })}
                          placeholder="Brief 1-2 sentence overview for job cards and previews..."
                          className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                          Full Role Overview & Description
                        </label>
                        <textarea
                          rows={4}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Comprehensive role overview shown on the detail page..."
                          className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {formTab === "content" && (
                    <div className="space-y-6">
                      {/* Skills */}
                      <div>
                        <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                          Key Skills & Technologies (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={form.skills}
                          onChange={(e) => setForm({ ...form, skills: e.target.value })}
                          placeholder="Next.js, React, TypeScript, Tailwind CSS, PostgreSQL"
                          className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                        />
                        <p className="text-[10px] text-[#566171] mt-1">
                          Separate multiple skills with commas. These appear as tags on the public card.
                        </p>
                      </div>

                      {/* Responsibilities */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-[#A7B0BC]">
                            Key Responsibilities (Bullet points)
                          </label>
                          <button
                            type="button"
                            onClick={() => addListItem("responsibilities")}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>
                        <div className="space-y-2">
                          {form.responsibilities.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => updateListItem("responsibilities", idx, e.target.value)}
                                placeholder={`Responsibility ${idx + 1}`}
                                className="flex-1 px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                              />
                              <button
                                type="button"
                                onClick={() => removeListItem("responsibilities", idx)}
                                className="p-2 text-[#7E8997] hover:text-rose-400 rounded-lg hover:bg-[#202833]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Qualifications */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-[#A7B0BC]">
                            Requirements & Qualifications
                          </label>
                          <button
                            type="button"
                            onClick={() => addListItem("qualifications")}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>
                        <div className="space-y-2">
                          {form.qualifications.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => updateListItem("qualifications", idx, e.target.value)}
                                placeholder={`Requirement ${idx + 1}`}
                                className="flex-1 px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                              />
                              <button
                                type="button"
                                onClick={() => removeListItem("qualifications", idx)}
                                className="p-2 text-[#7E8997] hover:text-rose-400 rounded-lg hover:bg-[#202833]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {formTab === "settings" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Status
                          </label>
                          <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="PUBLISHED">Published (Visible on careers page)</option>
                            <option value="DRAFT">Draft (Admin only)</option>
                            <option value="CLOSED">Closed (Applications blocked)</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                            Application Deadline (Optional)
                          </label>
                          <input
                            type="date"
                            value={form.deadline}
                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 bg-[#101318] border border-[#29313B] rounded-xl">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={form.isFeatured}
                          onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-500 bg-[#151A21] border-[#29313B] focus:ring-emerald-500/30"
                        />
                        <label htmlFor="isFeatured" className="text-xs text-white font-medium cursor-pointer">
                          Mark as Featured Opportunity (pinned with gold accent at top of public listings)
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                          Custom URL Slug (Leave blank for auto-generation)
                        </label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value })}
                          placeholder="e.g. frontend-developer-intern"
                          className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                          SEO Meta Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={form.seoTitle}
                          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                          placeholder="Defaults to '[Title] | Axivon Technologies Careers'"
                          className="w-full px-3 py-2 bg-[#101318] border border-[#29313B] rounded-xl text-xs text-white placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-[#1E2530] bg-[#101318]/50 flex items-center justify-between">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A7B0BC] hover:text-white hover:bg-[#1B222B] transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    {formTab !== "settings" ? (
                      <button
                        onClick={() =>
                          setFormTab(formTab === "basics" ? "content" : "settings")
                        }
                        className="px-4 py-2 bg-[#1B222B] hover:bg-[#202833] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        Next Step <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#04130E] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          {editingJob ? "Save Changes" : "Create Posting"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
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
                <h3 className="text-base font-bold text-white">Delete Job Posting?</h3>
                <p className="text-xs text-[#7E8997] mt-1 mb-5">
                  If this position has candidate applications, it will be moved to ARCHIVED to preserve applicant records safely.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-white bg-[#101318] border border-[#29313B] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-all"
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
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
