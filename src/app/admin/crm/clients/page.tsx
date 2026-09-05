"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, X, RefreshCw, AlertCircle, CheckCircle2, Building2, User } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [addForm, setAddForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/crm/clients?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setClients(data.data || []);
        setTotalPages(data.meta?.pages || 1);
        setTotalRecords(data.meta?.total || 0);
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Failed to load clients." });
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/v1/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client.");
      setIsAddOpen(false);
      setFeedback({ type: "success", message: `Client ${data.data.clientCode} created successfully.` });
      fetchClients();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Directory</h1>
          <p className="text-gray-400 mt-1 text-sm">Converted accounts, active clients and organizational contacts ({totalRecords} total clients).</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchClients} className="p-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setAddForm({ companyName: "", contactName: "", email: "", phone: "", website: "", industry: "" });
              setFormError("");
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search clients by name, company, email, code..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Client Code</th>
                <th className="px-5 py-3.5">Company Name</th>
                <th className="px-5 py-3.5">Primary Contact</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Industry</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading clients...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No clients found.</td></tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono text-xs text-purple-400 font-bold">{c.clientCode}</td>
                    <td className="px-5 py-4 font-semibold text-white">{c.companyName}</td>
                    <td className="px-5 py-4 text-xs text-gray-300">{c.contactName}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">{c.email}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">{c.industry || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Create New Client</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {formError && <p className="text-xs text-red-400">{formError}</p>}

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Company Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={addForm.companyName} onChange={e => setAddForm({ ...addForm, companyName: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contact Person <span className="text-red-500">*</span></label>
                  <input required type="text" value={addForm.contactName} onChange={e => setAddForm({ ...addForm, contactName: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email <span className="text-red-500">*</span></label>
                  <input required type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Website</label>
                  <input type="text" value={addForm.website} onChange={e => setAddForm({ ...addForm, website: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Industry</label>
                  <input type="text" value={addForm.industry} onChange={e => setAddForm({ ...addForm, industry: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-5 py-2 bg-red-600 text-white text-xs rounded-xl font-semibold">{formLoading ? "Saving..." : "Create Client"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
