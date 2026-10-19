"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  X,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Edit2,
  Trash2,
  Upload,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Sparkles,
  FileText,
  AlertCircle,
  Eye,
  Check,
  Ban,
  ArrowRight,
  Database,
} from "lucide-react";

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  status: string;
  version: number;
  sourceType: string;
  sourceReference?: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeGap {
  id: string;
  question: string;
  intent: string;
  frequency: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

interface ChatFeedbackItem {
  id: string;
  conversationId: string;
  rating: "HELPFUL" | "NOT_HELPFUL";
  comment?: string | null;
  messageContent?: string | null;
  createdAt: string;
}

interface ChatbotSettings {
  enabled: boolean;
  botName: string;
  welcomeHeading: string;
  welcomeSubtitle: string;
  suggestedQuestions: string[];
}

const CATEGORIES = [
  "COMPANY",
  "SERVICES",
  "PROCESS",
  "PRICING",
  "FAQ",
  "PORTFOLIO",
  "TECHNOLOGY",
  "CONTACT",
  "INDUSTRIES",
];

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function KnowledgeConsolePage() {
  const [activeTab, setActiveTab] = useState<"docs" | "gaps" | "feedback" | "settings">("docs");

  // Feedback banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── TAB 1: KNOWLEDGE BASE STATE ──────────────────────────────────────────
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // CRUD & Upload modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("COMPANY");
  const [uploadStatus, setUploadStatus] = useState("DRAFT");
  const [uploadPreview, setUploadPreview] = useState<any | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: "COMPANY",
    content: "",
    sourceType: "MANUAL",
    sourceReference: "",
    tags: "",
    status: "DRAFT",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // ── TAB 2: KNOWLEDGE GAPS STATE ──────────────────────────────────────────
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [gapStatusFilter, setGapStatusFilter] = useState("OPEN");
  const [gapSearch, setGapSearch] = useState("");

  // ── TAB 3: VISITOR FEEDBACK STATE ────────────────────────────────────────
  const [feedbacks, setFeedbacks] = useState<ChatFeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState({
    totalRatings: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    satisfactionRate: 100,
  });

  // ── TAB 4: CHATBOT SETTINGS STATE ────────────────────────────────────────
  const [settingsData, setSettingsData] = useState<ChatbotSettings>({
    enabled: true,
    botName: "Axivon AI",
    welcomeHeading: "How can we help you build something better?",
    welcomeSubtitle: "I can help you explore Axivon's services, portfolio, and technology solutions.",
    suggestedQuestions: [
      "Explore Services",
      "Build a Web Application",
      "Mobile App Development",
      "AI Solutions & Automation",
    ],
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Show banner alert
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // ── FETCH KNOWLEDGE DOCUMENTS ────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/admin/ai/knowledge?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDocs(data.data || []);
        setTotalPages(data.meta?.pages || 1);
        setTotalRecords(data.meta?.total || 0);
      } else {
        showToast("error", data.error || "Failed to load knowledge documents.");
      }
    } catch {
      showToast("error", "Network error while loading knowledge documents.");
    } finally {
      setDocsLoading(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  // ── FETCH KNOWLEDGE GAPS ─────────────────────────────────────────────────
  const fetchGaps = useCallback(async () => {
    setGapsLoading(true);
    try {
      const params = new URLSearchParams();
      if (gapStatusFilter) params.set("status", gapStatusFilter);
      if (gapSearch) params.set("search", gapSearch);

      const res = await fetch(`/api/v1/admin/ai/knowledge/gaps?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setGaps(data.data || []);
      }
    } catch {
      showToast("error", "Failed to load knowledge gaps.");
    } finally {
      setGapsLoading(false);
    }
  }, [gapStatusFilter, gapSearch]);

  // ── FETCH VISITOR FEEDBACK ───────────────────────────────────────────────
  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/ai/knowledge/feedback`);
      const data = await res.json();
      if (res.ok) {
        setFeedbacks(data.data || []);
        if (data.analytics) setFeedbackAnalytics(data.analytics);
      }
    } catch {
      showToast("error", "Failed to load feedback analytics.");
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  // ── FETCH CHATBOT SETTINGS ───────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/ai/knowledge/settings`);
      const data = await res.json();
      if (res.ok && data.data) {
        setSettingsData(data.data);
      }
    } catch {
      showToast("error", "Failed to load chatbot settings.");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "docs") fetchDocs();
    if (activeTab === "gaps") fetchGaps();
    if (activeTab === "feedback") fetchFeedback();
    if (activeTab === "settings") fetchSettings();
  }, [activeTab, fetchDocs, fetchGaps, fetchFeedback, fetchSettings]);

  // ── KNOWLEDGE CRUD HANDLERS ──────────────────────────────────────────────
  const handleEditorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const isEdit = !!editDoc;
      const url = isEdit
        ? `/api/v1/admin/ai/knowledge/${editDoc!.id}`
        : "/api/v1/admin/ai/knowledge";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", isEdit ? "Document updated successfully." : "Document created successfully.");
        setIsEditorOpen(false);
        setEditDoc(null);
        fetchDocs();
      } else {
        setFormError(data.error || "Failed to save document.");
      }
    } catch {
      setFormError("Network error while saving document.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (doc: KnowledgeDoc) => {
    setEditDoc(doc);
    setForm({
      title: doc.title,
      category: doc.category,
      content: doc.content,
      sourceType: doc.sourceType,
      sourceReference: doc.sourceReference || "",
      tags: (doc.tags || []).join(", "),
      status: doc.status,
    });
    setFormError("");
    setIsEditorOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/admin/ai/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast("success", `Document status changed to ${newStatus}.`);
        fetchDocs();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to update status.");
      }
    } catch {
      showToast("error", "Network error updating document status.");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this knowledge document?")) return;
    try {
      const res = await fetch(`/api/v1/admin/ai/knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Document archived from active retrieval.");
        fetchDocs();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to archive document.");
      }
    } catch {
      showToast("error", "Network error archiving document.");
    }
  };

  // ── SEED VERIFIED KNOWLEDGE ──────────────────────────────────────────────
  const handleSeed = async () => {
    if (!window.confirm("Seed verified company knowledge into the database? Existing administrator records will be preserved.")) return;
    setSeedLoading(true);
    try {
      const res = await fetch("/api/v1/admin/ai/knowledge/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("success", data.message || "Seeding complete.");
        fetchDocs();
      } else {
        showToast("error", data.error || "Seeding failed.");
      }
    } catch {
      showToast("error", "Network error during seeding.");
    } finally {
      setSeedLoading(false);
    }
  };

  // ── DOCUMENT UPLOAD HANDLERS ─────────────────────────────────────────────
  const handleUploadFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadLoading(true);
    setUploadPreview(null);

    // Request text extraction preview
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);
      formData.append("preview", "true");

      const res = await fetch("/api/v1/admin/ai/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.preview) {
        setUploadPreview(data.data);
      } else {
        showToast("error", data.error || "Failed to extract preview from file.");
      }
    } catch {
      showToast("error", "Error extracting text preview.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("category", uploadCategory);
      formData.append("status", uploadStatus);

      const res = await fetch("/api/v1/admin/ai/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", data.message || "Document uploaded and processed successfully.");
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadPreview(null);
        fetchDocs();
      } else {
        showToast("error", data.error || "Upload failed.");
      }
    } catch {
      showToast("error", "Network error uploading document.");
    } finally {
      setUploadLoading(false);
    }
  };

  // ── GAP ACTIONS ──────────────────────────────────────────────────────────
  const handleResolveGap = async (id: string, status: "ADDRESSED" | "IGNORED") => {
    try {
      const res = await fetch(`/api/v1/admin/ai/knowledge/gaps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast("success", `Gap marked as ${status}.`);
        fetchGaps();
      }
    } catch {
      showToast("error", "Failed to update gap status.");
    }
  };

  const handleConvertGapToDoc = (gap: KnowledgeGap) => {
    setEditDoc(null);
    setForm({
      title: `Answer: ${gap.question.slice(0, 60)}...`,
      category: gap.intent === "PRICING" ? "PRICING" : gap.intent === "SERVICES" ? "SERVICES" : "FAQ",
      content: `Question: ${gap.question}\n\nAnswer: `,
      sourceType: "MANUAL",
      sourceReference: `Knowledge Gap ID: ${gap.id}`,
      tags: "gap-resolution, faq",
      status: "DRAFT",
    });
    setIsEditorOpen(true);
  };

  // ── SETTINGS SAVE ────────────────────────────────────────────────────────
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/ai/knowledge/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Chatbot settings saved successfully.");
      } else {
        showToast("error", data.error || "Failed to save settings.");
      }
    } catch {
      showToast("error", "Network error saving settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f4f4f5] p-6 lg:p-10 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl animate-in slide-in-from-top-3 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90 border-red-500/30 text-red-300"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#22252a] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2a1f14] to-[#141414] border border-[#e8a064]/30 text-[#e8a064] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI Assistant & Knowledge Management</h1>
              <p className="text-xs text-[#8c94a0] mt-0.5">Authoritative grounded knowledge, document extraction, gaps, and assistant controls.</p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeed}
            disabled={seedLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161a20] border border-[#262c36] text-xs font-semibold text-[#c5cdd8] hover:text-white hover:border-[#e8a064]/50 transition-colors disabled:opacity-50"
            title="Populate verified company knowledge from code repository without overwriting existing edits"
          >
            <Database className="w-3.5 h-3.5 text-[#e8a064]" />
            {seedLoading ? "Seeding..." : "Seed Verified Knowledge"}
          </button>
          <button
            onClick={() => {
              setUploadFile(null);
              setUploadPreview(null);
              setIsUploadOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161a20] border border-[#262c36] text-xs font-semibold text-[#c5cdd8] hover:text-white hover:border-[#e8a064]/50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            Upload Document
          </button>
          <button
            onClick={() => {
              setEditDoc(null);
              setForm({
                title: "",
                category: "COMPANY",
                content: "",
                sourceType: "MANUAL",
                sourceReference: "",
                tags: "",
                status: "PUBLISHED",
              });
              setFormError("");
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e8a064] text-[#0f0f0f] text-xs font-bold hover:bg-[#d4915c] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#22252a] mb-6 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === "docs"
              ? "border-[#e8a064] text-[#e8a064] bg-[#161a20]/60"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Documents
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 ml-1">{totalRecords}</span>
        </button>

        <button
          onClick={() => setActiveTab("gaps")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === "gaps"
              ? "border-[#e8a064] text-[#e8a064] bg-[#161a20]/60"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Knowledge Gaps
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === "feedback"
              ? "border-[#e8a064] text-[#e8a064] bg-[#161a20]/60"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Visitor Feedback
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] ml-1">
            {feedbackAnalytics.satisfactionRate}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === "settings"
              ? "border-[#e8a064] text-[#e8a064] bg-[#161a20]/60"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          Chatbot Settings
        </button>
      </div>

      {/* ── TAB 1: KNOWLEDGE BASE ────────────────────────────────────────── */}
      {activeTab === "docs" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search knowledge by title or content keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151a] border border-[#222730] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#e8a064]/50 focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#12151a] border border-[#222730] rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#12151a] border border-[#222730] rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Review</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button
              onClick={fetchDocs}
              className="p-2.5 bg-[#12151a] border border-[#222730] rounded-xl hover:text-white text-zinc-400"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${docsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#12151a] border border-[#222730] rounded-2xl overflow-hidden shadow-xl">
            {docsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#e8a064]" />
                <span className="text-xs">Loading knowledge documents...</span>
              </div>
            ) : docs.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <FileText className="w-10 h-10 mb-3 text-zinc-600" />
                <h4 className="text-sm font-semibold text-zinc-300">No knowledge documents found</h4>
                <p className="text-xs text-zinc-500 max-w-sm text-center mt-1">
                  Click "Seed Verified Knowledge" to populate standard company information, or create custom documents manually.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161a22] text-zinc-400 uppercase tracking-wider font-semibold border-b border-[#222730]">
                    <tr>
                      <th className="py-3.5 px-4">Title & Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Source</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Version</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e232c] text-zinc-300">
                    {docs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#161a20] transition-colors">
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-white truncate">{doc.title}</div>
                          <div className="text-zinc-500 text-[11px] line-clamp-1 mt-0.5">{doc.content}</div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {doc.tags.slice(0, 3).map((t) => (
                                <span key={t} className="px-1.5 py-0.2 bg-[#1b2029] rounded text-[10px] text-zinc-400">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[11px] text-zinc-400">
                          <div>{doc.sourceType}</div>
                          {doc.sourceReference && <div className="text-zinc-600 truncate max-w-[120px]">{doc.sourceReference}</div>}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_COLORS[doc.status] || STATUS_COLORS.DRAFT}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">v{doc.version}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {doc.status !== "PUBLISHED" ? (
                              <button
                                onClick={() => handleStatusChange(doc.id, "PUBLISHED")}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-950/50 rounded-lg transition-colors"
                                title="Publish"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(doc.id, "DRAFT")}
                                className="p-1.5 text-amber-400 hover:bg-amber-950/50 rounded-lg transition-colors"
                                title="Unpublish to Draft"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditClick(doc)}
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1.5 text-red-400/80 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-[#161a22] border-t border-[#222730] text-xs text-zinc-400">
                <span>Page {page} of {totalPages} ({totalRecords} records)</span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-zinc-800 rounded hover:text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-zinc-800 rounded hover:text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: KNOWLEDGE GAPS ────────────────────────────────────────── */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={gapSearch}
                onChange={(e) => setGapSearch(e.target.value)}
                placeholder="Search visitor questions..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151a] border border-[#222730] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <select
              value={gapStatusFilter}
              onChange={(e) => setGapStatusFilter(e.target.value)}
              className="bg-[#12151a] border border-[#222730] rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="">All Gaps</option>
              <option value="OPEN">Open (Unresolved)</option>
              <option value="ADDRESSED">Addressed</option>
              <option value="IGNORED">Ignored</option>
            </select>
            <button onClick={fetchGaps} className="p-2.5 bg-[#12151a] border border-[#222730] rounded-xl hover:text-white text-zinc-400">
              <RefreshCw className={`w-4 h-4 ${gapsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="bg-[#12151a] border border-[#222730] rounded-2xl overflow-hidden shadow-xl">
            {gapsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#e8a064]" />
                <span className="text-xs">Loading knowledge gaps...</span>
              </div>
            ) : gaps.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-500/50" />
                <h4 className="text-sm font-semibold text-zinc-300">No unanswered questions logged</h4>
                <p className="text-xs text-zinc-500 mt-1">When visitors ask questions that fall outside published knowledge, they appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161a22] text-zinc-400 uppercase tracking-wider font-semibold border-b border-[#222730]">
                    <tr>
                      <th className="py-3.5 px-4">Visitor Question</th>
                      <th className="py-3.5 px-4">Intent</th>
                      <th className="py-3.5 px-4">Frequency</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Seen</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e232c] text-zinc-300">
                    {gaps.map((gap) => (
                      <tr key={gap.id} className="hover:bg-[#161a20] transition-colors">
                        <td className="py-4 px-4 max-w-md font-medium text-white">{gap.question}</td>
                        <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">{gap.intent}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                            {gap.frequency}x
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            gap.status === "OPEN" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {gap.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-zinc-500 text-[11px]">{new Date(gap.updatedAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {gap.status === "OPEN" && (
                              <>
                                <button
                                  onClick={() => handleConvertGapToDoc(gap)}
                                  className="px-2.5 py-1 bg-[#e8a064]/20 border border-[#e8a064]/40 text-[#e8a064] hover:bg-[#e8a064] hover:text-black rounded text-[11px] font-semibold transition-colors"
                                >
                                  Answer & Publish
                                </button>
                                <button
                                  onClick={() => handleResolveGap(gap.id, "ADDRESSED")}
                                  className="px-2 py-1 bg-zinc-800 hover:bg-emerald-950 text-zinc-300 hover:text-emerald-300 rounded text-[11px] transition-colors"
                                >
                                  Resolve
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: VISITOR FEEDBACK ──────────────────────────────────────── */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#12151a] border border-[#222730] rounded-xl p-4">
              <span className="text-zinc-500 text-xs font-medium">Total Feedback Ratings</span>
              <div className="text-2xl font-bold text-white mt-1">{feedbackAnalytics.totalRatings}</div>
            </div>
            <div className="bg-[#12151a] border border-[#222730] rounded-xl p-4">
              <span className="text-zinc-500 text-xs font-medium">Helpful Ratings</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{feedbackAnalytics.helpfulCount}</div>
            </div>
            <div className="bg-[#12151a] border border-[#222730] rounded-xl p-4">
              <span className="text-zinc-500 text-xs font-medium">Not Helpful</span>
              <div className="text-2xl font-bold text-red-400 mt-1">{feedbackAnalytics.notHelpfulCount}</div>
            </div>
            <div className="bg-[#12151a] border border-[#222730] rounded-xl p-4">
              <span className="text-zinc-500 text-xs font-medium">Satisfaction Rate</span>
              <div className="text-2xl font-bold text-[#e8a064] mt-1">{feedbackAnalytics.satisfactionRate}%</div>
            </div>
          </div>

          {/* Feedback Table */}
          <div className="bg-[#12151a] border border-[#222730] rounded-2xl overflow-hidden shadow-xl">
            {feedbackLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#e8a064]" />
                <span className="text-xs">Loading feedback records...</span>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <ThumbsUp className="w-10 h-10 mb-3 text-zinc-600" />
                <h4 className="text-sm font-semibold text-zinc-300">No visitor feedback submitted yet</h4>
                <p className="text-xs text-zinc-500 mt-1">When visitors rate assistant replies, their feedback appears here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161a22] text-zinc-400 uppercase tracking-wider font-semibold border-b border-[#222730]">
                    <tr>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Visitor Comment</th>
                      <th className="py-3.5 px-4">Assistant Message Snippet</th>
                      <th className="py-3.5 px-4">Conversation ID</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e232c] text-zinc-300">
                    {feedbacks.map((f) => (
                      <tr key={f.id} className="hover:bg-[#161a20] transition-colors">
                        <td className="py-4 px-4">
                          {f.rating === "HELPFUL" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                              <ThumbsUp className="w-3 h-3" /> Helpful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold">
                              <ThumbsDown className="w-3 h-3" /> Needs Improvement
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-white font-medium">{f.comment || <span className="text-zinc-600">No comment provided</span>}</td>
                        <td className="py-4 px-4 text-zinc-400 max-w-xs truncate">{f.messageContent || "N/A"}</td>
                        <td className="py-4 px-4 font-mono text-[11px] text-zinc-500">{f.conversationId.slice(0, 16)}...</td>
                        <td className="py-4 px-4 text-zinc-500 text-[11px]">{new Date(f.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: CHATBOT SETTINGS ──────────────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="max-w-3xl bg-[#12151a] border border-[#222730] rounded-2xl p-6 lg:p-8 shadow-xl">
          <form onSubmit={handleSettingsSave} className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#222730] pb-6">
              <div>
                <h3 className="text-base font-bold text-white">Assistant Activation</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Toggle public AI chatbot availability on the website.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsData.enabled}
                  onChange={(e) => setSettingsData({ ...settingsData, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e8a064]"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Display Name</label>
              <input
                type="text"
                value={settingsData.botName}
                onChange={(e) => setSettingsData({ ...settingsData, botName: e.target.value })}
                className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8a064]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Welcome Screen Heading</label>
              <input
                type="text"
                value={settingsData.welcomeHeading}
                onChange={(e) => setSettingsData({ ...settingsData, welcomeHeading: e.target.value })}
                className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8a064]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Welcome Screen Subtitle</label>
              <input
                type="text"
                value={settingsData.welcomeSubtitle}
                onChange={(e) => setSettingsData({ ...settingsData, welcomeSubtitle: e.target.value })}
                className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8a064]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Suggested Quick Questions (One per line)</label>
              <textarea
                rows={4}
                value={settingsData.suggestedQuestions.join("\n")}
                onChange={(e) =>
                  setSettingsData({
                    ...settingsData,
                    suggestedQuestions: e.target.value.split("\n").filter((q) => q.trim()),
                  })
                }
                className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8a064]/50 resize-none font-mono"
              />
            </div>

            <div className="pt-4 border-t border-[#222730] flex justify-end">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-5 py-2.5 bg-[#e8a064] text-black rounded-xl font-bold text-xs hover:bg-[#d4915c] transition-colors disabled:opacity-50"
              >
                {settingsSaving ? "Saving Settings..." : "Save Chatbot Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: DOCUMENT UPLOAD & EXTRACTION ───────────────────────────── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#12151a] border border-[#222730] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222730] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Upload Knowledge Document</h3>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Select Supported File (.txt, .md, .json, .csv, .pdf, .docx)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json,.csv,.pdf,.docx"
                  onChange={handleUploadFileChange}
                  className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1f242e] file:text-white hover:file:bg-[#2a303d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Target Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Initial Publication Status</label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value)}
                    className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="DRAFT">Draft (Requires Review)</option>
                    <option value="REVIEW">Ready for Review</option>
                    <option value="PUBLISHED">Published (Immediately Active)</option>
                  </select>
                </div>
              </div>

              {/* Extraction Preview */}
              {uploadLoading && (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#e8a064]" />
                  <span>Extracting document text & generating semantic chunks...</span>
                </div>
              )}

              {uploadPreview && (
                <div className="bg-[#181c24] border border-[#262c36] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Text Extracted Successfully
                    </span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      {uploadPreview.metadata.wordCount} words | {uploadPreview.chunks.length} chunks
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-300 bg-[#0e1014] p-3 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                    {uploadPreview.content.slice(0, 1000)}...
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-[#222730]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#262c36] text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadConfirm}
                  disabled={!uploadFile || uploadLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#e8a064] text-black font-bold text-xs hover:bg-[#d4915c] transition-colors disabled:opacity-50"
                >
                  Confirm & Save Knowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DOCUMENT EDITOR (CREATE / EDIT) ───────────────────────── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#12151a] border border-[#222730] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222730] pb-4 mb-5">
              <h3 className="text-sm font-bold text-white">
                {editDoc ? `Edit Document (v${editDoc.version})` : "Create Knowledge Document"}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Document Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Web Development Capabilities & Scope"
                  className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8a064]/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Publication Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="PUBLISHED">Published (Available to Chatbot)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">Review</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Knowledge Content *</label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter verified company facts, specifications, procedures, or answers..."
                  className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8a064]/50 resize-none font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Source Reference (Optional)</label>
                  <input
                    type="text"
                    value={form.sourceReference}
                    onChange={(e) => setForm({ ...form, sourceReference: e.target.value })}
                    placeholder="e.g. /services/web-development"
                    className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="e.g. nextjs, react, frontend"
                    className="w-full bg-[#181c24] border border-[#262c36] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {formError && <div className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">{formError}</div>}

              <div className="flex gap-3 pt-3 border-t border-[#222730]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#262c36] text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#e8a064] text-black font-bold text-xs hover:bg-[#d4915c] transition-colors disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editDoc ? "Update Document" : "Create Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
