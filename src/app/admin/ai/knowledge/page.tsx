"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, Plus, X, RefreshCw, BookOpen, CheckCircle2, Edit2 } from "lucide-react";

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

const CATEGORIES = [
  "COMPANY", "SERVICES", "PROCESS", "PRICING", "FAQ",
  "PORTFOLIO", "TECHNOLOGY", "CONTACT", "INDUSTRIES",
];

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-green-500/10 text-green-400 border-green-500/20",
  DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    category: "COMPANY",
    content: "",
    sourceType: "MANUAL",
    sourceReference: "",
    tags: "",
    status: "DRAFT",
  });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "20");
      const res = await fetch(`/api/v1/admin/ai/knowledge?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDocs(data.data || []);
        setTotalPages(data.meta?.pages || 1);
        setTotalRecords(data.meta?.total || 0);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load knowledge base." });
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (!res.ok) throw new Error(data.error || "Failed to save document.");
      
      setFeedback({
        type: "success",
        message: isEdit ? "Document updated." : "Document created.",
      });
      setIsAddOpen(false);
      setEditDoc(null);
      setForm({
        title: "",
        category: "COMPANY",
        content: "",
        sourceType: "MANUAL",
        sourceReference: "",
        tags: "",
        status: "DRAFT",
      });
      fetchDocs();
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch(`/api/v1/admin/ai/knowledge/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchDocs();
  };

  const openEdit = (doc: KnowledgeDoc) => {
    setEditDoc(doc);
    setForm({
      title: doc.title,
      category: doc.category,
      content: doc.content,
      sourceType: doc.sourceType,
      sourceReference: doc.sourceReference || "",
      tags: doc.tags.join(", "),
      status: doc.status,
    });
    setIsAddOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f4f4f5]">AI Knowledge Base</h1>
          <p className="mt-1 text-sm text-[#71717a]">
            {totalRecords} documents · Manage verified Axivon content
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddOpen(true);
            setEditDoc(null);
            setForm({
              title: "",
              category: "COMPANY",
              content: "",
              sourceType: "MANUAL",
              sourceReference: "",
              tags: "",
              status: "DRAFT",
            });
          }}
          className="flex items-center gap-2 rounded-xl bg-[#e8a064] px-4 py-2 text-sm font-semibold text-[#0f0f0f] transition-colors hover:bg-[#d4915c]"
        >
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[#262626] bg-[#141414] py-2.5 pl-9 pr-4 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none focus:border-[#e8a064]/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[#262626] bg-[#141414] px-3 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
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
          className="rounded-xl border border-[#262626] bg-[#141414] px-3 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
        >
          <option value="">All Status</option>
          {["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={fetchDocs}
          className="rounded-xl border border-[#262626] bg-[#141414] p-2.5 text-[#71717a] transition-colors hover:text-[#f4f4f5]"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#262626] bg-[#141414]">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-[#71717a]">
            Loading...
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#71717a]">
            <BookOpen className="mb-2 h-8 w-8" />
            <p className="text-sm">No knowledge documents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#1c1c1e]">
                  {["Title", "Category", "Status", "Version", "Updated", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#71717a]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, i) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-[#262626] transition-colors hover:bg-[#1c1c1e] ${
                      i % 2 === 0 ? "" : "bg-[#0f0f0f]/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-[280px] truncate font-medium text-[#f4f4f5]">
                        {doc.title}
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-[#262626] px-2 py-0.5 text-[10px] text-[#a1a1aa]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#262626] bg-[#1c1c1e] px-2.5 py-0.5 text-[11px] font-medium text-[#a1a1aa]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          STATUS_COLORS[doc.status] ||
                          "border-gray-500/20 bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#a1a1aa]">v{doc.version}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#71717a]">
                      {new Date(doc.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(doc)}
                          className="rounded-lg p-1.5 text-[#71717a] transition-colors hover:bg-[#262626] hover:text-[#f4f4f5]"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handlePublish(doc.id, doc.status)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            doc.status === "PUBLISHED"
                              ? "text-green-400 hover:bg-green-500/10"
                              : "text-[#71717a] hover:bg-[#262626] hover:text-[#f4f4f5]"
                          }`}
                          title={doc.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[#71717a]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-1.5 transition-colors hover:border-[#e8a064]/40 disabled:opacity-40"
            >
              &larr; Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-1.5 transition-colors hover:border-[#e8a064]/40 disabled:opacity-40"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#262626] bg-[#141414] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] px-6 py-4">
              <h3 className="text-base font-semibold text-[#f4f4f5]">
                {editDoc ? "Edit Document" : "Add Knowledge Document"}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditDoc(null);
                  setFormError("");
                }}
                className="text-[#71717a] hover:text-[#f4f4f5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
                  >
                    {["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">
                  Content *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  required
                  rows={6}
                  className="w-full resize-none rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">
                  Source Reference (URL or description)
                </label>
                <input
                  type="text"
                  value={form.sourceReference}
                  onChange={(e) => setForm((f) => ({ ...f, sourceReference: e.target.value }))}
                  className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa]">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. mobile, ios, android"
                  className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#f4f4f5] outline-none focus:border-[#e8a064]/50"
                />
              </div>
              {formError && <div className="text-xs text-red-400">{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditDoc(null);
                    setFormError("");
                  }}
                  className="flex-1 rounded-xl border border-[#262626] py-2.5 text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-xl bg-[#e8a064] py-2.5 text-sm font-semibold text-[#0f0f0f] transition-colors hover:bg-[#d4915c] disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editDoc ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
