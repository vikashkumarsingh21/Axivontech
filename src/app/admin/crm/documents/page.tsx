"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, FileText, Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["GENERAL", "COMPANY_INFO", "PARTNER_GUIDELINES", "MARKETING", "PRICING", "SERVICE_INFO", "CONTRACT", "PROJECT_DOCS", "IMPORTANT_NOTICE"];

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", category: "GENERAL", isImportant: false, expiresAt: "", recipientType: "ALL", brokerProfileId: "" });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter) params.set("category", catFilter);
    params.set("page", page.toString());
    const res = await fetch(`/api/v1/admin/partner-documents?${params}`);
    if (res.ok) { const d = await res.json(); setDocs(d.data || []); setMeta(d.meta || { total: 0, pages: 1 }); }
    setLoading(false);
  }, [search, catFilter, page]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const openModal = async () => {
    setShowModal(true);
    setError("");
    if (brokers.length === 0) {
      const res = await fetch("/api/v1/admin/brokers?limit=100");
      if (res.ok) { const d = await res.json(); setBrokers(d.data || []); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { title: form.title, description: form.description, fileUrl: form.fileUrl, category: form.category, isImportant: form.isImportant, expiresAt: form.expiresAt || null };
      if (form.recipientType === "SPECIFIC" && form.brokerProfileId) payload.brokerProfileId = form.brokerProfileId;
      const res = await fetch("/api/v1/admin/partner-documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload document.");
      setShowModal(false);
      setForm({ title: "", description: "", fileUrl: "", category: "GENERAL", isImportant: false, expiresAt: "", recipientType: "ALL", brokerProfileId: "" });
      fetchDocs();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/v1/admin/partner-documents/${id}`, { method: "DELETE" });
    fetchDocs();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner Documents</h1>
          <p className="text-sm text-gray-400">Upload and share documents with brokers.</p>
        </div>
        <button onClick={openModal} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 flex items-center gap-2 rounded-md transition-colors text-sm"><Plus size={16} /> Upload Document</button>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-[#0d0d0d] border border-white/10 rounded-md py-2 px-3 text-sm text-gray-400 focus:outline-none">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Recipient</th>
                <th className="px-6 py-3">Uploaded By</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">Loading...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">No documents found.</td></tr>
              ) : docs.map(doc => (
                <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {doc.isImportant && <Star size={14} className="text-amber-400 fill-amber-400" />}
                      <div>
                        <div className="font-medium text-white">{doc.title}</div>
                        {doc.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{doc.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase">{doc.category.replace(/_/g, " ")}</span></td>
                  <td className="px-6 py-4 text-xs">{doc.brokerProfile ? doc.brokerProfile.user?.name : <span className="text-emerald-400">All Brokers</span>}</td>
                  <td className="px-6 py-4 text-xs">{doc.uploadedBy?.name || "—"}</td>
                  <td className="px-6 py-4 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Download"><FileText size={16} /></a>
                      <button onClick={() => handleDelete(doc.id)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.pages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-gray-500">{meta.total} documents</span>
            <div className="flex gap-2 items-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-gray-400">Page {page} / {meta.pages}</span>
              <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Upload Document</h2>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Document Title *</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">File URL *</label>
                <input required type="url" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="important" checked={form.isImportant} onChange={e => setForm({ ...form, isImportant: e.target.checked })} className="rounded bg-[#1a1a1a] border-white/20" />
                <label htmlFor="important" className="text-sm text-gray-300">Mark as Important</label>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Recipient</label>
                <select value={form.recipientType} onChange={e => setForm({ ...form, recipientType: e.target.value, brokerProfileId: "" })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none">
                  <option value="ALL">All Brokers</option>
                  <option value="SPECIFIC">Specific Broker</option>
                </select>
              </div>
              {form.recipientType === "SPECIFIC" && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Select Broker</label>
                  <select required value={form.brokerProfileId} onChange={e => setForm({ ...form, brokerProfileId: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none">
                    <option value="">-- Select --</option>
                    {brokers.map((b: any) => <option key={b.id} value={b.brokerProfile?.id}>{b.name} ({b.email})</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-md text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm disabled:opacity-50">{submitting ? "Uploading..." : "Upload & Share"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
