"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/documents")
      .then(r => r.json())
      .then(d => { setDocs(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Documents</h1>
      <p className="text-gray-400">Manage company documents and policies.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Uploaded By</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : docs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No documents found.</td></tr>
            ) : (
              docs.map(d => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" /> {d.title}
                  </td>
                  <td className="px-4 py-3">{d.category}</td>
                  <td className="px-4 py-3">{d.uploadedBy?.name || "-"}</td>
                  <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
