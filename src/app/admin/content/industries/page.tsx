"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Save,
  X,
  School,
  Store,
  Hospital,
  Hotel,
  HeartPulse,
  Lightbulb,
} from "lucide-react";
import { IndustryItem, DEFAULT_INDUSTRIES } from "@/lib/content/content-db";

const EMPTY_INDUSTRY: IndustryItem = {
  id: "",
  slug: "",
  title: "",
  description: "",
  tags: [],
  icon: "Building2",
  displayOrder: 0,
  status: "PUBLISHED",
  relatedService: "web-development",
};

export default function IndustriesManagementPage() {
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<IndustryItem | null>(null);
  const [form, setForm] = useState<IndustryItem>({ ...EMPTY_INDUSTRY });
  const [saving, setSaving] = useState(false);

  const fetchIndustries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/content/industries");
      if (res.ok) {
        const data = await res.json();
        setIndustries(data.industries || []);
        setStats(data.stats || { total: 0, published: 0, draft: 0 });
      }
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  const openCreate = () => {
    setEditingIndustry(null);
    setForm({ ...EMPTY_INDUSTRY, displayOrder: industries.length + 1 });
    setShowModal(true);
  };

  const openEdit = (ind: IndustryItem) => {
    setEditingIndustry(ind);
    setForm({ ...ind });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      alert("Title and Description are required.");
      return;
    }
    setSaving(true);
    try {
      let res: Response;
      if (editingIndustry?.id && !editingIndustry.id.startsWith("ind-")) {
        res = await fetch(`/api/v1/admin/content/industries/${editingIndustry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/v1/admin/content/industries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save industry");
      }

      setShowModal(false);
      fetchIndustries();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (ind: IndustryItem) => {
    const newStatus = ind.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await fetch(`/api/v1/admin/content/industries/${ind.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchIndustries();
    } catch {
      // safe
    }
  };

  const filtered = industries
    .filter((i) => statusFilter === "ALL" || i.status === statusFilter)
    .filter(
      (i) =>
        !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase()) ||
        i.slug.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Industry Sectors Management</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {stats.total} Sectors
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage industry use cases, capability tags, and related service mappings.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sector</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search industries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/40"
              />
            </div>
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
              onClick={fetchIndustries}
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
                  <th className="px-5 py-3.5">Industry Sector</th>
                  <th className="px-5 py-3.5">Tags</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((ind, idx) => (
                  <tr key={ind.id || ind.slug} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-gray-600 font-mono">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white">{ind.title}</p>
                        <p className="text-[11px] text-gray-500 truncate max-w-sm mt-0.5">{ind.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {ind.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] text-gray-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          ind.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {ind.status === "PUBLISHED" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {ind.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href="/industries"
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
                          title="View on Public Site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(ind)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
                          title="Toggle Status"
                        >
                          {ind.status === "PUBLISHED" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(ind)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
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
                    {editingIndustry ? "Edit Industry Sector" : "Add Industry Sector"}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Sector Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Healthcare & Telemedicine"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">URL Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="e.g. healthcare"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Core solutions and deliverables for this sector"
                      className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Capability Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.tags.join(", ")}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="e.g. Telemed, Security, EMR"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
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
                    <span>Save Sector</span>
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
