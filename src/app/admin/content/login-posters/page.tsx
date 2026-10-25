"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Edit, Trash2, Eye, EyeOff,
  Image as ImageIcon, Calendar, Clock, CheckCircle,
  XCircle, AlertCircle, ArrowUp, ArrowDown, RefreshCw,
  X, Save, Loader2, LayoutTemplate, ExternalLink, Upload
} from "lucide-react";

type PosterStatus = "DRAFT" | "ACTIVE" | "SCHEDULED" | "INACTIVE";

interface Poster {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  altText?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  displayOrder: number;
  status: PosterStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  internalNotes?: string | null;
  createdBy?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface PosterStats {
  total: number;
  active: number;
  draft: number;
  scheduled: number;
  inactive: number;
}

const STATUS_CONFIG: Record<PosterStatus, { label: string; color: string; bg: string; icon: any }> = {
  ACTIVE: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  DRAFT: { label: "Draft", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", icon: AlertCircle },
  SCHEDULED: { label: "Scheduled", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Calendar },
  INACTIVE: { label: "Inactive", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  imageUrl: "",
  altText: "",
  ctaLabel: "",
  ctaUrl: "",
  displayOrder: 0,
  status: "DRAFT" as PosterStatus,
  startsAt: "",
  endsAt: "",
  internalNotes: "",
};

export default function LoginPostersPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [stats, setStats] = useState<PosterStats>({ total: 0, active: 0, draft: 0, scheduled: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSaveError("File is too large. Maximum allowed size is 10MB.");
      return;
    }

    setUploading(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/admin/login-posters/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.url) {
        handleFormChange("imageUrl", data.url);
        setPreviewUrl(data.url);
      } else {
        // Fallback to Data URL if upload endpoint failed
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          handleFormChange("imageUrl", base64);
          setPreviewUrl(base64);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Local FileReader fallback
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        handleFormChange("imageUrl", base64);
        setPreviewUrl(base64);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fetchPosters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/login-posters", {
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Failed to load posters (${res.status})`);
      }
      setPosters(data?.posters || []);
      setStats(data?.stats || { total: 0, active: 0, draft: 0, scheduled: 0, inactive: 0 });
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred while loading posters.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosters(); }, [fetchPosters]);

  const openCreate = () => {
    setEditingPoster(null);
    setForm({ ...EMPTY_FORM });
    setSaveError(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEdit = (poster: Poster) => {
    setEditingPoster(poster);
    setForm({
      title: poster.title,
      subtitle: poster.subtitle || "",
      imageUrl: poster.imageUrl,
      altText: poster.altText || "",
      ctaLabel: poster.ctaLabel || "",
      ctaUrl: poster.ctaUrl || "",
      displayOrder: poster.displayOrder,
      status: poster.status,
      startsAt: poster.startsAt ? poster.startsAt.slice(0, 16) : "",
      endsAt: poster.endsAt ? poster.endsAt.slice(0, 16) : "",
      internalNotes: poster.internalNotes || "",
    });
    setSaveError(null);
    setPreviewUrl(poster.imageUrl || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPoster(null);
    setSaveError(null);
    setPreviewUrl(null);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "imageUrl" && typeof value === "string") {
      setPreviewUrl(value || null);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      setSaveError("Title and Image URL are required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const body = {
        ...form,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        subtitle: form.subtitle || null,
        altText: form.altText || null,
        ctaLabel: form.ctaLabel || null,
        ctaUrl: form.ctaUrl || null,
        internalNotes: form.internalNotes || null,
      };

      let res: Response;
      if (editingPoster) {
        res = await fetch(`/api/v1/admin/login-posters/${editingPoster.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/v1/admin/login-posters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
      }

      const d = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(d?.error || d?.message || `Save failed (${res.status})`);
      }

      closeModal();
      fetchPosters();
    } catch (e: any) {
      setSaveError(e.message || "Failed to save poster.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/login-posters/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error(d?.error || d?.message || "Delete failed");
      setDeleteConfirm(null);
      fetchPosters();
    } catch (e: any) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (poster: Poster, direction: "up" | "down") => {
    const newOrder = direction === "up" ? poster.displayOrder - 1 : poster.displayOrder + 1;
    await fetch(`/api/v1/admin/login-posters/${poster.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ displayOrder: newOrder }),
    });
    fetchPosters();
  };

  const handleToggleStatus = async (poster: Poster) => {
    const newStatus = poster.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/v1/admin/login-posters/${poster.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    });
    fetchPosters();
  };

  const filteredPosters = posters
    .filter((p) => statusFilter === "ALL" || p.status === statusFilter)
    .filter(
      (p) =>
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Login Page Posters</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage carousel posters displayed on the AXIVON ONE login page</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Active", value: stats.active, color: "text-emerald-400" },
            { label: "Draft", value: stats.draft, color: "text-gray-400" },
            { label: "Scheduled", value: stats.scheduled, color: "text-blue-400" },
            { label: "Inactive", value: stats.inactive, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111] border border-white/5 rounded-xl p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search posters…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-500/30 cursor-pointer"
            >
              <option value="ALL" className="bg-[#181818] text-white">All Statuses</option>
              <option value="ACTIVE" className="bg-[#181818] text-white">Active</option>
              <option value="DRAFT" className="bg-[#181818] text-white">Draft</option>
              <option value="SCHEDULED" className="bg-[#181818] text-white">Scheduled</option>
              <option value="INACTIVE" className="bg-[#181818] text-white">Inactive</option>
            </select>
            {/* Refresh */}
            <button
              onClick={fetchPosters}
              className="h-9 w-9 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-9 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Poster
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
          </div>
        ) : filteredPosters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No posters found</p>
            <p className="text-gray-600 text-xs mt-1">Create your first login page poster to get started</p>
            <button
              onClick={openCreate}
              className="mt-4 flex items-center gap-2 h-9 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Poster
            </button>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Poster</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPosters.map((poster, idx) => {
                  const statusCfg = STATUS_CONFIG[poster.status] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={poster.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Order Number */}
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{poster.displayOrder}</td>
                      {/* Poster Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 relative">
                            {poster.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={poster.imageUrl}
                                alt={poster.altText || poster.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate max-w-[200px]">{poster.title}</p>
                            {poster.subtitle && (
                              <p className="text-gray-500 text-xs truncate max-w-[200px] mt-0.5">{poster.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </td>
                      {/* Schedule */}
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {poster.startsAt || poster.endsAt ? (
                          <div className="space-y-0.5">
                            {poster.startsAt && <p>From: {new Date(poster.startsAt).toLocaleDateString()}</p>}
                            {poster.endsAt && <p>To: {new Date(poster.endsAt).toLocaleDateString()}</p>}
                          </div>
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                      {/* Order Controls */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorder(poster, "up")}
                            className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorder(poster, "down")}
                            className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(poster)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              poster.status === "ACTIVE"
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                            }`}
                            title={poster.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          >
                            {poster.status === "ACTIVE" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEdit(poster)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(poster.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
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
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-base font-semibold text-white">
                  {editingPoster ? "Edit Poster" : "Add New Poster"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {saveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {saveError}
                  </div>
                )}

                {/* Image Preview */}
                {previewUrl && (
                  <div className="w-full h-36 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="e.g. Build Tomorrow's Solutions"
                    className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => handleFormChange("subtitle", e.target.value)}
                    placeholder="Supporting description"
                    className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                  />
                </div>

                {/* Image URL, File Upload & Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <label className="block text-xs font-medium text-gray-400">
                      Poster Image <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        {uploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        {uploading ? "Uploading Image…" : "Upload from PC"}
                      </button>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => handleFormChange("imageUrl", e.target.value)}
                      placeholder="https://... or click 'Upload from PC'"
                      className="w-full h-10 px-3 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                    />
                    {form.imageUrl && (
                      <a
                        href={form.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        title="Open image in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Presets and Guidance */}
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2 text-[11px] text-gray-500">
                    <span>Direct URL, relative path, or uploaded image file.</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600">Sample Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleFormChange("title", "Engineering Tomorrow's Infrastructure");
                          handleFormChange("subtitle", "Autonomous AI Agents, Next-Gen Cloud, & Enterprise Security");
                          handleFormChange("imageUrl", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80");
                          handleFormChange("altText", "Global digital infrastructure network");
                          handleFormChange("ctaLabel", "Explore Solutions");
                          handleFormChange("ctaUrl", "/services");
                          handleFormChange("status", "ACTIVE");
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        Global Tech
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleFormChange("title", "Applied Artificial Intelligence");
                          handleFormChange("subtitle", "Transforming Enterprise Operations with Autonomous Intelligence");
                          handleFormChange("imageUrl", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80");
                          handleFormChange("altText", "Neural network AI visualization");
                          handleFormChange("ctaLabel", "Discover AI");
                          handleFormChange("ctaUrl", "/services/ai-solutions");
                          handleFormChange("status", "ACTIVE");
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        AI Neural
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleFormChange("title", "Mission-Critical Software Engineering");
                          handleFormChange("subtitle", "Scalable, resilient architectures engineered for modern business");
                          handleFormChange("imageUrl", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80");
                          handleFormChange("altText", "Cybersecurity and enterprise systems visualization");
                          handleFormChange("ctaLabel", "View Portfolio");
                          handleFormChange("ctaUrl", "/portfolio");
                          handleFormChange("status", "ACTIVE");
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        Cybersecurity
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Alt Text</label>
                  <input
                    type="text"
                    value={form.altText}
                    onChange={(e) => handleFormChange("altText", e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                  />
                </div>

                {/* CTA */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">CTA Button Label</label>
                    <input
                      type="text"
                      value={form.ctaLabel}
                      onChange={(e) => handleFormChange("ctaLabel", e.target.value)}
                      placeholder="e.g. Learn More"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">CTA URL</label>
                    <input
                      type="url"
                      value={form.ctaUrl}
                      onChange={(e) => handleFormChange("ctaUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                {/* Status + Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleFormChange("status", e.target.value)}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-500/30 cursor-pointer"
                    >
                      <option value="DRAFT" className="bg-[#181818] text-white">Draft</option>
                      <option value="ACTIVE" className="bg-[#181818] text-white">Active</option>
                      <option value="SCHEDULED" className="bg-[#181818] text-white">Scheduled</option>
                      <option value="INACTIVE" className="bg-[#181818] text-white">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      value={form.displayOrder}
                      onChange={(e) => handleFormChange("displayOrder", parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Starts At</label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => handleFormChange("startsAt", e.target.value)}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-500/30 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Ends At</label>
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => handleFormChange("endsAt", e.target.value)}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-500/30 [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Internal Notes</label>
                  <textarea
                    value={form.internalNotes}
                    onChange={(e) => handleFormChange("internalNotes", e.target.value)}
                    placeholder="Private notes, not shown to users"
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="h-9 px-4 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-9 px-5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : (editingPoster ? "Save Changes" : "Create Poster")}
                </button>
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Delete Poster</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-6">Are you sure you want to permanently delete this poster?</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 h-9 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 h-9 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
