"use client";

import { useEffect, useState } from "react";
import { Plus, Megaphone, Trash2, Calendar, Users, Eye, X, Loader2 } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [status, setStatus] = useState("PUBLISHED");
  const [audienceType, setAudienceType] = useState("ALL");
  const [audienceScope, setAudienceScope] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/v1/admin/announcements")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          priority,
          status,
          audienceType,
          audienceScope: audienceScope || undefined,
          publishAt: publishAt || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setAudienceScope("");
        setPublishAt("");
        setExpiresAt("");
        setShowForm(false);
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    await fetch(`/api/v1/admin/announcements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-500" /> Announcements Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Publish company-wide and department-targeted announcements.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in">
          <h3 className="text-base font-semibold text-white">Create Announcement</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Annual Strategy Meeting 2026"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Announcement Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement text here..."
              required
              rows={4}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="PUBLISHED">Published (Immediate)</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Audience Type</label>
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="ALL">All Company</option>
                <option value="DEPARTMENT">Specific Department</option>
                <option value="ROLE">Specific Role</option>
              </select>
            </div>

            {audienceType !== "ALL" && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Target Scope (Department/Role Name)</label>
                <input
                  value={audienceScope}
                  onChange={(e) => setAudienceScope(e.target.value)}
                  placeholder="e.g. Engineering, Sales, ADMIN"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Publish Date (optional)</label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Expiry Date (optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === "PUBLISHED" ? "Publish Announcement" : "Save Announcement"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading announcements...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center bg-[#111111] border border-white/10 rounded-2xl text-gray-400">
            No announcements found. Click &quot;New Announcement&quot; to publish your first one.
          </div>
        ) : (
          items.map((a) => (
            <div key={a.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-white font-semibold text-lg">{a.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        a.priority === "URGENT"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : a.priority === "HIGH"
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                      }`}
                    >
                      {a.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-300 font-mono">
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Audience: {a.audienceType} {a.audienceScope ? `(${a.audienceScope})` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Published: {new Date(a.publishAt || a.createdAt).toLocaleDateString()}
                    </span>
                    {a.createdBy && <span>By: {a.createdBy.name}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-300 text-sm mt-4 whitespace-pre-wrap leading-relaxed">{a.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
