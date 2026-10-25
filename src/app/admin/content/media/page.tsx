"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  Save,
  X,
  Folder,
  FileImage,
  Shield,
  Edit,
  Upload,
} from "lucide-react";

interface MediaAssetItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fileType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  folder: string;
  createdAt: string;
}

const FOLDERS = ["ALL", "hero", "demos", "team", "branding", "general"];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [stats, setStats] = useState({ total: 0, totalBytes: 0, totalMB: "0.00" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MediaAssetItem | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    filename: "",
    url: "",
    fileType: "image/jpeg",
    fileSize: 150000,
    width: 1200,
    height: 800,
    altText: "",
    caption: "",
    folder: "general",
  });
  const [saving, setSaving] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/content/media");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        setStats(data.stats || { total: 0, totalBytes: 0, totalMB: "0.00" });
      }
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegisterAsset = async () => {
    if (!uploadForm.filename.trim() || !uploadForm.url.trim()) {
      toast.warning("Filename and URL are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/content/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to register asset");
      }

      setShowUploadModal(false);
      setUploadForm({
        filename: "",
        url: "",
        fileType: "image/jpeg",
        fileSize: 150000,
        width: 1200,
        height: 800,
        altText: "",
        caption: "",
        folder: "general",
      });
      fetchAssets();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", uploadForm.folder || "general");
      formData.append("altText", uploadForm.altText || "");
      formData.append("caption", uploadForm.caption || "");

      const res = await fetch("/api/v1/admin/content/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to upload file");
      }

      setShowUploadModal(false);
      fetchAssets();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateAltText = async () => {
    if (!editingAsset) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/content/media/${editingAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: editingAsset.altText,
          caption: editingAsset.caption,
          folder: editingAsset.folder,
        }),
      });

      if (!res.ok) throw new Error("Failed to update asset");
      setEditingAsset(null);
      fetchAssets();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this asset?")) return;
    try {
      await fetch(`/api/v1/admin/content/media/${id}`, { method: "DELETE" });
      fetchAssets();
    } catch {
      // safe
    }
  };

  const filtered = assets
    .filter((a) => folderFilter === "ALL" || a.folder === folderFilter)
    .filter(
      (a) =>
        !search ||
        a.filename.toLowerCase().includes(search.toLowerCase()) ||
        (a.altText && a.altText.toLowerCase().includes(search.toLowerCase())) ||
        (a.caption && a.caption.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Media Library</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {stats.total} Assets ({stats.totalMB} MB)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Browse verified images, manage accessibility alt-text, and register new assets securely.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search assets by name or alt-text…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/40"
              />
            </div>
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              {FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {f === "ALL" ? "All Folders" : `Folder: ${f}`}
                </option>
              ))}
            </select>
            <button
              onClick={fetchAssets}
              className="h-9 w-9 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#111111] border border-white/5 rounded-2xl">
            <FileImage className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No media assets found matching the filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 w-full bg-white/[0.02] relative overflow-hidden border-b border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(asset.url, asset.id)}
                        className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white hover:bg-black transition-colors"
                        title="Copy Public URL"
                      >
                        {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white hover:bg-black transition-colors"
                        title="Edit Metadata"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-red-400 hover:bg-black transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold text-white truncate" title={asset.filename}>
                      {asset.filename}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5" title={asset.altText || "No alt text"}>
                      {asset.altText ? `Alt: ${asset.altText}` : "Missing Alt Text"}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>{(asset.fileSize / 1024).toFixed(0)} KB</span>
                  <span className="uppercase">{asset.folder}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowUploadModal(false);
              }}
            >
              <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-white">Upload / Register Media Asset</h2>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-6 pt-4">
                  <div className="flex items-center gap-2 p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        uploadMode === "file"
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Direct File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        uploadMode === "url"
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      URL / External Path
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {uploadMode === "file" ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">Select Image File</label>
                      <div className="border-2 border-dashed border-white/10 hover:border-red-500/40 rounded-xl p-8 text-center transition-colors bg-white/[0.01]">
                        <input
                          type="file"
                          id="media-file-input"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <label htmlFor="media-file-input" className="cursor-pointer flex flex-col items-center">
                          {uploading ? (
                            <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-500 hover:text-red-400 mb-3 transition-colors" />
                          )}
                          <span className="text-sm font-semibold text-white">
                            {uploading ? "Uploading media file..." : "Click or drag image file here"}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, SVG, GIF up to 10MB</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Asset Filename *</label>
                        <input
                          type="text"
                          value={uploadForm.filename}
                          onChange={(e) => setUploadForm({ ...uploadForm, filename: e.target.value })}
                          placeholder="e.g. client-project-hero.jpg"
                          className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Public Asset URL or Path *</label>
                        <input
                          type="text"
                          value={uploadForm.url}
                          onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                          placeholder="e.g. /assets/images/... or https://..."
                          className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40 font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {uploadMode === "url" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">File Format</label>
                        <select
                          value={uploadForm.fileType}
                          onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                          className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none"
                        >
                          <option value="image/jpeg">JPEG (.jpg, .jpeg)</option>
                          <option value="image/png">PNG (.png)</option>
                          <option value="image/webp">WebP (.webp)</option>
                          <option value="image/svg+xml">SVG (.svg)</option>
                        </select>
                      </div>
                    )}
                    <div className={uploadMode === "file" ? "col-span-2" : ""}>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Category Folder</label>
                      <select
                        value={uploadForm.folder}
                        onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                        className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none"
                      >
                        {FOLDERS.filter((f) => f !== "ALL").map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Accessible Alt Text</label>
                    <input
                      type="text"
                      value={uploadForm.altText}
                      onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                      placeholder="Descriptive alt text for screen readers and SEO"
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="h-9 px-4 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  {uploadMode === "url" && (
                    <button
                      onClick={handleRegisterAsset}
                      disabled={saving}
                      className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Register Asset</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Alt-Text Modal */}
        <AnimatePresence>
          {editingAsset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setEditingAsset(null);
              }}
            >
              <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-white">Edit Asset Metadata</h2>
                  <button onClick={() => setEditingAsset(null)} className="text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Accessible Alt Text</label>
                    <input
                      type="text"
                      value={editingAsset.altText || ""}
                      onChange={(e) => setEditingAsset({ ...editingAsset, altText: e.target.value })}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Caption / Notes</label>
                    <input
                      type="text"
                      value={editingAsset.caption || ""}
                      onChange={(e) => setEditingAsset({ ...editingAsset, caption: e.target.value })}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Folder</label>
                    <select
                      value={editingAsset.folder}
                      onChange={(e) => setEditingAsset({ ...editingAsset, folder: e.target.value })}
                      className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 focus:outline-none"
                    >
                      {FOLDERS.filter((f) => f !== "ALL").map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setEditingAsset(null)}
                    className="h-9 px-4 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateAltText}
                    disabled={saving}
                    className="flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-500 text-xs font-semibold text-white rounded-lg transition-colors"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Update</span>
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
