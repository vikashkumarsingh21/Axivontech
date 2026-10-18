"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  Save,
  Loader2,
  AlertCircle,
  LayoutGrid,
  FileCode2,
  Star,
  Layers,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { DEMO_CATEGORIES } from "@/data/demo-projects";

interface DemoProjectItem {
  id: string;
  name: string;
  slug?: string;
  category: string;
  shortDescription: string;
  targetAudience: string;
  features: string[];
  isFeatured: boolean;
  status: "Live Demo" | "Coming Soon";
  demoUrl?: string;
  image?: string;
  problemStatement?: string;
  solutionOverview?: string;
  techStack?: string[];
  displayOrder?: number;
}

interface DemoStats {
  total: number;
  live: number;
  comingSoon: number;
  featured: number;
}

export default function AdminDemoProjectsPage() {
  const [projects, setProjects] = useState<DemoProjectItem[]>([]);
  const [stats, setStats] = useState<DemoStats>({ total: 0, live: 0, comingSoon: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<DemoProjectItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "Business & Corporate",
    shortDescription: "",
    targetAudience: "",
    status: "Coming Soon" as "Live Demo" | "Coming Soon",
    demoUrl: "",
    isFeatured: false,
    problemStatement: "",
    solutionOverview: "",
    featuresStr: "",
    techStackStr: "",
    image: "",
  });

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/demo-projects", {
        headers: { "x-user-id": "admin-session" },
      });
      if (!res.ok) throw new Error("Failed to load demo projects.");
      const data = await res.json();
      setProjects(data.projects || []);
      setStats(data.stats || { total: 0, live: 0, comingSoon: 0, featured: 0 });
    } catch (e: any) {
      setError(e.message || "Failed to load demo projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openEdit = (p: DemoProjectItem) => {
    setEditingProject(p);
    setFormData({
      name: p.name,
      slug: p.slug || p.id,
      category: p.category,
      shortDescription: p.shortDescription,
      targetAudience: p.targetAudience || "",
      status: p.status,
      demoUrl: p.demoUrl || "",
      isFeatured: p.isFeatured,
      problemStatement: p.problemStatement || "",
      solutionOverview: p.solutionOverview || "",
      featuresStr: p.features ? p.features.join(", ") : "",
      techStackStr: p.techStack ? p.techStack.join(", ") : "",
      image: p.image || "",
    });
    setSaveError(null);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      slug: "",
      category: "Business & Corporate",
      shortDescription: "",
      targetAudience: "",
      status: "Coming Soon",
      demoUrl: "",
      isFeatured: false,
      problemStatement: "",
      solutionOverview: "",
      featuresStr: "",
      techStackStr: "Next.js 15, TypeScript, Tailwind CSS",
      image: "",
    });
    setSaveError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.shortDescription.trim()) {
      setSaveError("Project name and short description are required.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      shortDescription: formData.shortDescription.trim(),
      targetAudience: formData.targetAudience.trim(),
      status: formData.status,
      demoUrl: formData.demoUrl.trim() || undefined,
      isFeatured: formData.isFeatured,
      problemStatement: formData.problemStatement.trim(),
      solutionOverview: formData.solutionOverview.trim(),
      features: formData.featuresStr
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      techStack: formData.techStackStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: formData.image.trim() || undefined,
    };

    try {
      let res: Response;
      if (editingProject) {
        res = await fetch(`/api/v1/admin/demo-projects/${editingProject.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "admin-session",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/v1/admin/demo-projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "admin-session",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save project.");
      }

      closeModal();
      fetchProjects();
    } catch (e: any) {
      setSaveError(e.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (p: DemoProjectItem) => {
    const nextStatus = p.status === "Live Demo" ? "Coming Soon" : "Live Demo";
    await fetch(`/api/v1/admin/demo-projects/${p.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "admin-session",
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchProjects();
  };

  const handleToggleFeatured = async (p: DemoProjectItem) => {
    await fetch(`/api/v1/admin/demo-projects/${p.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "admin-session",
      },
      body: JSON.stringify({ isFeatured: !p.isFeatured }),
    });
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/v1/admin/demo-projects/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": "admin-session" },
    });
    setDeleteConfirm(null);
    fetchProjects();
  };

  // Filtered list
  const filteredList = projects
    .filter((p) => categoryFilter === "ALL" || p.category === categoryFilter)
    .filter((p) => {
      if (statusFilter === "LIVE") return p.status === "Live Demo";
      if (statusFilter === "COMING_SOON") return p.status === "Coming Soon";
      return true;
    })
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
      );
    });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Demo Portfolio Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Curate live demonstrations, concept prototypes, and architectural metadata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProjects}
              className="h-9 px-3 flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Refresh projects list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={openCreate}
              className="h-9 px-4 flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Demo Project</span>
            </button>
          </div>
        </div>

        {/* Statistics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111] border border-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Total Catalogue Projects</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400">{stats.live}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Live Interactive Demos</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-400">{stats.featured}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Featured Flagships</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-400">{stats.comingSoon}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Coming Soon Concepts</p>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search demo name, sector, features..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none focus:border-red-500/30 cursor-pointer"
            >
              <option value="ALL">All Categories ({DEMO_CATEGORIES.length - 1})</option>
              {DEMO_CATEGORIES.filter((c) => c !== "All Projects").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none focus:border-red-500/30 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="LIVE">Live Demos Only</option>
              <option value="COMING_SOON">Coming Soon Only</option>
            </select>
          </div>

          <div className="text-xs text-gray-500 shrink-0 self-center">
            Showing <span className="font-semibold text-white">{filteredList.length}</span> projects
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111] border border-white/5 rounded-2xl p-8">
            <LayoutGrid className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-white">No demo projects found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              No projects matched your search or category filter. Try clearing your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="mt-4 h-8 px-4 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Demo Showcase
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Links & Preview
                    </th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredList.map((project) => {
                    const isLive = project.status === "Live Demo";
                    const slug = project.slug || project.id;
                    return (
                      <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Demo Showcase */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-9 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 relative">
                              {project.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={project.image}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/assets/images/services/web-development.jpg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <LayoutGrid className="w-4 h-4 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate max-w-[220px]">
                                {project.name}
                              </p>
                              <p className="text-gray-500 text-[11px] truncate max-w-[240px] mt-0.5">
                                {project.shortDescription}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Sector */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 text-[11px] text-gray-300">
                            {project.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleStatus(project)}
                            title="Click to toggle status"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer"
                            style={{
                              backgroundColor: isLive ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.05)",
                              borderColor: isLive ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                              color: isLive ? "#34d399" : "#9ca3af",
                            }}
                          >
                            {isLive ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{project.status}</span>
                          </button>
                        </td>

                        {/* Featured */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(project)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              project.isFeatured
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                            }`}
                            title={project.isFeatured ? "Unfeature project" : "Feature on spotlight"}
                          >
                            <Star className={`w-4 h-4 ${project.isFeatured ? "fill-amber-400" : ""}`} />
                          </button>
                        </td>

                        {/* Links & Preview */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 text-xs">
                            {isLive && project.demoUrl && (
                              <Link
                                href={project.demoUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                              >
                                <span>Demo</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                            <Link
                              href={`/demo-projects/${slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[#e8a064] hover:underline"
                            >
                              <FileCode2 className="w-3 h-3" />
                              <span>Specs</span>
                            </Link>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(project)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Edit metadata"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(project.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Archive project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-base font-semibold text-white">
                  {editingProject ? `Edit Demo: ${editingProject.name}` : "Create New Demo Project"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs">
                {saveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Name & Slug */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-400 mb-1">
                      Project Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. NexusHealth"
                      className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. nexushealth"
                      className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 font-mono"
                    />
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-400 mb-1">Industry Sector</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-300 focus:outline-none focus:border-red-500/30"
                    >
                      {DEMO_CATEGORIES.filter((c) => c !== "All Projects").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 mb-1">Presentation Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "Live Demo" | "Coming Soon",
                        })
                      }
                      className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-300 focus:outline-none focus:border-red-500/30"
                    >
                      <option value="Live Demo">Live Demo (Interactive)</option>
                      <option value="Coming Soon">Coming Soon (Concept)</option>
                    </select>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-medium text-gray-400 mb-1">
                    Short Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief 1-2 sentence overview shown on cards..."
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 resize-none"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block font-medium text-gray-400 mb-1">Ideal Target Audience</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g. Private clinics, specialized diagnostic centers"
                    className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30"
                  />
                </div>

                {/* Demo URL & Image */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-400 mb-1">Demo Internal Route</label>
                    <input
                      type="text"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                      placeholder="/demo-projects/healthcare/..."
                      className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 mb-1">Preview Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/images/demo-projects/..."
                      className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 font-mono"
                    />
                  </div>
                </div>

                {/* Features (Comma-separated) */}
                <div>
                  <label className="block font-medium text-gray-400 mb-1">
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.featuresStr}
                    onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                    placeholder="e.g. Doctor Directory, OPD Telemetry, Online Booking"
                    className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30"
                  />
                </div>

                {/* Tech Stack (Comma-separated) */}
                <div>
                  <label className="block font-medium text-gray-400 mb-1">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.techStackStr}
                    onChange={(e) => setFormData({ ...formData, techStackStr: e.target.value })}
                    placeholder="e.g. Next.js 15, TypeScript, Tailwind CSS, Framer Motion"
                    className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 font-mono"
                  />
                </div>

                {/* Problem & Solution */}
                <div>
                  <label className="block font-medium text-gray-400 mb-1">Business Problem Addressed</label>
                  <textarea
                    rows={2}
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    placeholder="Operational friction or user barrier..."
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-400 mb-1">Architectural Solution</label>
                  <textarea
                    rows={2}
                    value={formData.solutionOverview}
                    onChange={(e) => setFormData({ ...formData, solutionOverview: e.target.value })}
                    placeholder="How this frontend architecture solves the problem..."
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-red-500/30 resize-none"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="feat-checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="feat-checkbox" className="text-gray-300 font-medium cursor-pointer">
                    Display as Featured Flagship Showcase
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="h-9 px-4 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-9 px-5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? "Saving..." : editingProject ? "Save Changes" : "Create Project"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ───────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Archive Demo Project</h3>
                  <p className="text-[11px] text-gray-500">Hide from public portfolio listings</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Are you sure you want to archive this demo project? It will be excluded from the public catalogue.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 h-9 text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 h-9 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
