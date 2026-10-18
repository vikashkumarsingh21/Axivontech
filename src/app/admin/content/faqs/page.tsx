"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import { FaqItem } from "@/lib/content/content-db";

const CATEGORIES = ["ALL", "GENERAL", "SERVICES", "DELIVERY", "PRICING", "SUPPORT", "PARTNERS", "CAREERS"];
const PAGES = ["GLOBAL", "HOME", "SERVICES", "ABOUT"];

const EMPTY_FAQ: FaqItem = {
  id: "",
  question: "",
  answer: "",
  category: "GENERAL",
  page: "HOME",
  displayOrder: 0,
  status: "PUBLISHED",
};

export default function FaqsManagementPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqItem>({ ...EMPTY_FAQ });
  const [saving, setSaving] = useState(false);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/content/faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
        setStats(data.stats || { total: 0, published: 0, draft: 0, archived: 0 });
      }
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreate = () => {
    setEditingFaq(null);
    setForm({ ...EMPTY_FAQ, displayOrder: faqs.length + 1 });
    setShowModal(true);
  };

  const openEdit = (faq: FaqItem) => {
    setEditingFaq(faq);
    setForm({ ...faq });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      alert("Question and Answer are required.");
      return;
    }
    setSaving(true);
    try {
      let res: Response;
      if (editingFaq?.id && !editingFaq.id.startsWith("faq-")) {
        res = await fetch(`/api/v1/admin/content/faqs/${editingFaq.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/v1/admin/content/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save FAQ");
      }

      setShowModal(false);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (faq: FaqItem) => {
    const newStatus = faq.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await fetch(`/api/v1/admin/content/faqs/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchFaqs();
    } catch {
      // safe
    }
  };

  const handleReorder = async (faq: FaqItem, direction: "up" | "down") => {
    const newOrder = direction === "up" ? faq.displayOrder - 1 : faq.displayOrder + 1;
    try {
      await fetch(`/api/v1/admin/content/faqs/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
      fetchFaqs();
    } catch {
      // safe
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await fetch(`/api/v1/admin/content/faqs/${id}`, { method: "DELETE" });
      fetchFaqs();
    } catch {
      // safe
    }
  };

  const filtered = faqs
    .filter((f) => categoryFilter === "ALL" || f.category === categoryFilter)
    .filter((f) => statusFilter === "ALL" || f.status === statusFilter)
    .filter(
      (f) =>
        !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">FAQ Directory Management</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {stats.total} Questions
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage frequently asked questions across Homepage, Services, Delivery, and Support modules.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/40"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            <button
              onClick={fetchFaqs}
              className="h-9 w-9 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : (
          <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                  <th className="px-5 py-3.5 w-12">#</th>
                  <th className="px-5 py-3.5">Question & Answer</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Page</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((faq, idx) => (
                  <tr key={faq.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-gray-600 font-mono">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white">{faq.question}</p>
                        <p className="text-[11px] text-gray-500 truncate max-w-md mt-0.5">{faq.answer}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 font-mono text-[11px]">{faq.page}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(faq, "up")}
                          className="p-1 text-gray-500 hover:text-white"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleReorder(faq, "down")}
                          className="p-1 text-gray-500 hover:text-white"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          faq.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {faq.status === "PUBLISHED" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {faq.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(faq)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
                          title="Toggle Status"
                        >
                          {faq.status === "PUBLISHED" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(faq)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-purple-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete"
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

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowModal(false);
              }}
            >
              <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-white">
                    {editingFaq ? "Edit Question" : "Add FAQ Question"}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Question Text *</label>
                    <input
                      type="text"
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                      placeholder="e.g. What is the typical development timeline?"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Answer Text *</label>
                    <textarea
                      rows={4}
                      value={form.answer}
                      onChange={(e) => setForm({ ...form, answer: e.target.value })}
                      placeholder="Detailed explanation with real policies and timelines"
                      className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none"
                      >
                        {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Page Target</label>
                      <select
                        value={form.page}
                        onChange={(e) => setForm({ ...form, page: e.target.value })}
                        className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none"
                      >
                        {PAGES.map((pg) => (
                          <option key={pg} value={pg}>
                            {pg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Order</label>
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                        className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setShowModal(false)}
                    className="h-9 px-4 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Question</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
