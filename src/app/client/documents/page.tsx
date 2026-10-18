"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Download,
  Search,
  ShieldCheck,
  Briefcase,
  Loader2,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface DocumentRecord {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  category: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  isImportant?: boolean;
  createdAt: string;
  partnerProject: {
    id: string;
    projectCode: string;
    projectName: string;
  };
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (categoryFilter !== "ALL") queryParams.set("category", categoryFilter);
      if (search) queryParams.set("search", search);

      const res = await fetch(`/api/v1/client/documents?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
      }
    } catch (err) {
      console.error("Error loading client documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
          Client Document Vault
        </h1>
        <p className="text-sm text-[#7E8997] mt-0.5">
          Access verified technical specifications, signed contracts, architectural blueprints, and milestone deliverables.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80">
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-[#29313B] bg-[#151A21] text-xs font-medium text-[#A7B0BC] focus:outline-none focus:border-emerald-500 shadow-2xs w-full sm:w-auto"
        >
          <option value="ALL">All Classifications</option>
          <option value="CLIENT_DELIVERABLE">Deliverables</option>
          <option value="PROJECT_DOCS">Technical Documentation</option>
          <option value="CONTRACT">Legal & Contracts</option>
          <option value="GENERAL">General Briefs</option>
        </select>
      </div>

      {/* Documents Table */}
      <Card className="bg-[#151A21] border-[#29313B]">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-sm text-[#7E8997]">
              Loading authorized documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FolderOpen}
                title="No Documents Found"
                description={
                  search || categoryFilter !== "ALL"
                    ? "No documents matched your criteria."
                    : "No client-visible documents have been published yet for your projects."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A7B0BC]">
                <thead className="bg-[#101318]/80 text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
                  <tr>
                    <th className="px-6 py-3.5">Document Title</th>
                    <th className="px-6 py-3.5">Project</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Size</th>
                    <th className="px-6 py-3.5">Published Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#202833] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#F3F5F7]">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span>{doc.title}</span>
                            {doc.description && (
                              <p className="text-[11px] text-[#566171] font-normal line-clamp-1 mt-0.5">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/client/projects/${doc.partnerProject.id}`}
                          className="font-mono text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          {doc.partnerProject.projectCode}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]">
                          {doc.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#7E8997] whitespace-nowrap">
                        {formatFileSize(doc.sizeBytes)}
                      </td>
                      <td className="px-6 py-4 text-[#7E8997] whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/api/v1/client/projects/${doc.partnerProject.id}/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="w-3.5 h-3.5 mr-1" />
                            <span>Download</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
