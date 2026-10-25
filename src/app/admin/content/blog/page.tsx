"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  Loader2,
  Save,
  X,
  Calendar,
  User,
} from "lucide-react";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  authorName: string;
  authorRole: string;
  readingTime: string;
  featuredImage: string;
  featured: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  publishedAt?: string | null;
  createdAt: string;
}

const CATEGORIES = [
  "ALL",
  "Web & Custom Software",
  "AI & Automation",
  "Robotics & Embedded Systems",
];

const EMPTY_ARTICLE: Partial<ArticleItem> = {
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "",
  category: "Web & Custom Software",
  authorName: "Axivon Engineering Team",
  authorRole: "Core Engineering",
  readingTime: "5 min read",
  featuredImage: "/assets/images/placeholder.jpg",
  featured: false,
  status: "DRAFT",
};

export default function BlogManagementPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [form, setForm] = useState<Partial<ArticleItem>>({ ...EMPTY_ARTICLE });
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/content/blog");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setStats(data.stats || { total: 0, published: 0, draft: 0, featured: 0 });
      }
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const openCreate = () => {
    setEditingArticle(null);
    setForm({ ...EMPTY_ARTICLE });
    setShowModal(true);
  };

  const openEdit = (art: ArticleItem) => {
    setEditingArticle(art);
    setForm({ ...art });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim() || !form.contentHtml?.trim()) {
      toast.warning("Title and Article Content are required.");
      return;
    }
    setSaving(true);
    try {
      let res: Response;
      if (editingArticle?.id && !editingArticle.id.startsWith("art-")) {
        res = await fetch(`/api/v1/admin/content/blog/${editingArticle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/v1/admin/content/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save article");
      }

      setShowModal(false);
      fetchArticles();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (art: ArticleItem) => {
    const newStatus = art.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await fetch(`/api/v1/admin/content/blog/${art.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchArticles();
    } catch {
      // safe
    }
  };

  const handleToggleFeatured = async (art: ArticleItem) => {
    try {
      await fetch(`/api/v1/admin/content/blog/${art.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !art.featured }),
      });
      fetchArticles();
    } catch {
      // safe
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await fetch(`/api/v1/admin/content/blog/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch {
      // safe
    }
  };

  const filtered = articles
    .filter((a) => categoryFilter === "ALL" || a.category === categoryFilter)
    .filter((a) => statusFilter === "ALL" || a.status === statusFilter)
    .filter(
      (a) =>
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.slug.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Blog & Articles Management</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {stats.total} Articles
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Draft, edit, publish, and feature engineering articles, architecture blueprints, and technology guides.
              </p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search articles…"
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
              onClick={fetchArticles}
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
                  <th className="px-5 py-3.5">Article</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((art, idx) => (
                  <tr key={art.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-gray-600 font-mono">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.featuredImage}
                            alt={art.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-sm">{art.title}</p>
                          <p className="text-[11px] text-gray-500 font-mono truncate max-w-xs mt-0.5">/blog/{art.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-300">
                        {art.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-[11px]">{art.authorName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            art.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                          }`}
                        >
                          {art.status}
                        </span>
                        {art.featured && (
                          <span className="p-1 rounded bg-amber-500/10 text-amber-400" title="Featured Article">
                            <Star className="w-3 h-3 fill-amber-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
                          title="View Live Article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(art)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            art.featured ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(art)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
                          title="Toggle Status"
                        >
                          {art.status === "PUBLISHED" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEdit(art)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
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
              <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-white">
                    {editingArticle ? "Edit Article" : "Create New Article"}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Article Title *</label>
                    <input
                      type="text"
                      value={form.title || ""}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Modern Full-Stack Architecture Guide for 2026"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">URL Slug</label>
                      <input
                        type="text"
                        value={form.slug || ""}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="e.g. modern-architecture-guide"
                        className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                      />
                    </div>
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
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Featured Image URL *</label>
                    <input
                      type="text"
                      value={form.featuredImage || ""}
                      onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                      placeholder="/assets/images/... or https://..."
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Summary Excerpt</label>
                    <textarea
                      rows={2}
                      value={form.excerpt || ""}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Brief overview displayed on the blog card and search previews"
                      className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Article Content (HTML/Markdown) *</label>
                    <textarea
                      rows={6}
                      value={form.contentHtml || ""}
                      onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                      placeholder="<p>Article body content...</p>"
                      className="w-full p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40 font-mono"
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
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Estimated Reading Time</label>
                      <input
                        type="text"
                        value={form.readingTime || "5 min read"}
                        onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
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
                    <span>Save Article</span>
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
