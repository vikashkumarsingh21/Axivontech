"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Search, Download, Trash2, Shield, Loader2, X, ExternalLink } from "lucide-react";

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formCategory, setFormCategory] = useState("COMPANY_POLICY");
  const [fileUrl, setFileUrl] = useState("");
  const [visibility, setVisibility] = useState("COMPANY");
  const [visibilityScope, setVisibilityScope] = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);

    fetch(`/api/v1/admin/documents?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setDocs(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          category: formCategory,
          fileUrl,
          visibility,
          visibilityScope: visibilityScope || undefined,
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setFileUrl("");
        setVisibilityScope("");
        setShowUploadModal(false);
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this document?")) return;
    await fetch(`/api/v1/documents/${id}/archive`, { method: "POST" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" /> Document Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage company policies, forms, and department documents with version control.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title or description..."
              className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium">
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-auto bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="COMPANY_POLICY">Company Policy</option>
          <option value="GUIDELINE">Guideline</option>
          <option value="FORM">Form</option>
          <option value="HR_DOCUMENT">HR Document</option>
          <option value="PROJECT_DOCUMENT">Project Document</option>
          <option value="CLIENT_DOCUMENT">Client Document</option>
          <option value="TEMPLATE">Template</option>
          <option value="INTERNAL_RESOURCE">Internal Resource</option>
        </select>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleUpload} className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Upload New Document</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Document Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Axivon Employee Handbook 2026"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="COMPANY_POLICY">Company Policy</option>
                <option value="GUIDELINE">Guideline</option>
                <option value="FORM">Form</option>
                <option value="HR_DOCUMENT">HR Document</option>
                <option value="PROJECT_DOCUMENT">Project Document</option>
                <option value="CLIENT_DOCUMENT">Client Document</option>
                <option value="TEMPLATE">Template</option>
                <option value="INTERNAL_RESOURCE">Internal Resource</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">File URL *</label>
              <input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://... or /documents/..."
                type="url"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Visibility Scope</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="COMPANY">Company-Wide</option>
                  <option value="DEPARTMENT">Specific Department</option>
                  <option value="ROLE">Specific Role</option>
                  <option value="PRIVATE">Private (Only Me)</option>
                </select>
              </div>

              {visibility !== "COMPANY" && visibility !== "PRIVATE" && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Target Department/Role</label>
                  <input
                    value={visibilityScope}
                    onChange={(e) => setVisibilityScope(e.target.value)}
                    placeholder="e.g. Engineering or ADMIN"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this document covers..."
                rows={3}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Document</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Visibility</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Uploaded By</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading documents...
                    </div>
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{d.title}</p>
                          {d.description && <p className="text-xs text-gray-500 line-clamp-1">{d.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-gray-300 font-mono">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Shield className="w-3.5 h-3.5 text-gray-500" />
                        <span>{d.visibility}</span>
                        {d.visibilityScope && <span className="text-gray-500">({d.visibilityScope})</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-medium text-blue-400">v{d.currentVersion || 1}</span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {d.uploadedBy?.name || "System"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Open Document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleArchive(d.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Archive Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
