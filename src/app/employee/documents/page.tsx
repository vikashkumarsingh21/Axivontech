"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FileText,
  Search,
  ExternalLink,
  Download,
  Loader2,
  Calendar,
  User,
  Shield,
  FileCheck,
  FolderOpen,
} from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  category: string;
  fileSize?: number | null;
  fileType?: string | null;
  createdAt: string;
  uploadedBy?: {
    name: string;
    email: string;
  } | null;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/v1/employee/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.documents)) {
          setDocs(data.documents);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => {
      if (d.category) set.add(d.category.toUpperCase());
    });
    return ["ALL", ...Array.from(set)];
  }, [docs]);

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      const matchesSearch =
        searchQuery === "" ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory !== "ALL") {
        if (d.category.toUpperCase() !== selectedCategory) return false;
      }

      return true;
    });
  }, [docs, searchQuery, selectedCategory]);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Standard PDF";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
          Documents & Resources
        </h1>
        <p className="text-sm text-[#A7B0BC] mt-1">
          Access verified employee handbooks, onboarding guides, compliance documents, and standard templates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#566171] absolute left-3 top-3 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search documents by name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </Card>

      {/* Document Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#7E8997] gap-3">
          <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
          <span>Loading documents...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="p-12 text-center bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <FolderOpen className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F5F7]">No documents available</h3>
          <p className="text-xs text-[#7E8997]">
            {searchQuery || selectedCategory !== "ALL"
              ? "No files matched your criteria."
              : "No organization documents are currently assigned to your department."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((d) => (
            <Card
              key={d.id}
              className="p-5 bg-[#151A21] border-[#29313B] rounded-xl hover:border-[#364152] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#D6B779] bg-[#D6B779]/10 border border-[#D6B779]/20 px-2 py-0.5 rounded uppercase">
                    {d.category.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#F3F5F7] line-clamp-1">
                    {d.title}
                  </h3>
                  {d.description && (
                    <p className="text-xs text-[#7E8997] line-clamp-2 mt-1">{d.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#1E2530] flex items-center justify-between text-[11px] text-[#7E8997]">
                  <span>{formatFileSize(d.fileSize)}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Document</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
