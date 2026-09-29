"use client";

import { useState, useEffect } from "react";
import { FileText, Download, CheckCircle, Clock, ExternalLink, ShieldAlert, Star } from "lucide-react";

export default function BrokerDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/v1/broker/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/broker/documents/${id}/read`, { method: "POST" });
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, isRead: true } : d));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading documents...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Document Center</h1>
        <p className="text-gray-400 text-sm">Access important guidelines, contracts, and company resources.</p>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-sm">{error}</div>}

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <div className="bg-[#111] p-10 rounded-xl border border-white/10 text-center text-gray-500">
            No documents shared with you yet.
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-white/20 transition-colors">
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-lg ${doc.isImportant ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {doc.isImportant ? <Star size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${!doc.isRead ? 'text-white' : 'text-gray-300'}`}>{doc.title}</h3>
                    {!doc.isRead && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{doc.description}</p>
                  <div className="flex gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded uppercase">{doc.category.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                {!doc.isRead && (
                  <button onClick={() => markAsRead(doc.id)} className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-md transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Mark Read
                  </button>
                )}
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" onClick={() => !doc.isRead && markAsRead(doc.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center justify-center gap-2">
                  <Download size={15} /> Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
