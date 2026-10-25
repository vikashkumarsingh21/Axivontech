"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { EpButton } from "@/components/employee/EpButton";

interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  category: string;
  fileSize?: number | null;
  fileType?: string | null;
  createdAt: string;
  isAcknowledged?: boolean;
  acknowledgedAt?: string | null;
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
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = () => {
    fetch("/api/v1/employee/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.documents)) {
          setDocs(data.documents);
        }
      })
      .catch(() => {
        setActionError("Failed to fetch documents.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledge = async (docId: string) => {
    try {
      setAcknowledgingId(docId);
      setActionError(null);
      const res = await fetch("/api/v1/employee/documents/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to acknowledge document");
      }
      setDocs((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isAcknowledged: true } : d))
      );
      setActionSuccess("Document acknowledgment recorded successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to acknowledge document");
    } finally {
      setAcknowledgingId(null);
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl pb-12"
    >
      {/* Header */}
      <PageHeader
        title="Documents & Resources"
        subtitle="Access company handbooks, compliance policies, standard templates, and department guidelines."
      />

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3 bg-[#4F9D83]/10 border border-[#4F9D83]/25 rounded-xl text-[#4F9D83] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-[#C46A62]/10 border border-[#C46A62]/25 rounded-xl text-[#C46A62] text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A867E] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search documents by name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                selectedCategory === cat
                  ? "bg-[#4F9D83]/15 text-[#4F9D83] border border-[#4F9D83]/30 font-semibold"
                  : "bg-[#232324] text-[#8A867E] hover:text-[#EDEBE6] border border-[#2E2E30]"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-52" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2">
          <FolderOpen className="w-10 h-10 text-[#8A867E] mx-auto" />
          <h3 className="text-base font-semibold text-[#EDEBE6]">No documents available</h3>
          <p className="text-xs text-[#8A867E]">
            {searchQuery || selectedCategory !== "ALL"
              ? "No files matched your criteria."
              : "No organization documents are currently assigned to your department."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((d) => (
            <div
              key={d.id}
              className="p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl hover:border-[#3A3A3D] transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {d.isAcknowledged ? (
                      <StatusBadge variant="success">
                        Acknowledged
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="warning">
                        Pending Ack
                      </StatusBadge>
                    )}
                    <span className="text-[10px] font-medium text-[#B3AFA6] bg-[#232324] border border-[#2E2E30] px-2 py-0.5 rounded uppercase">
                      {d.category.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-[#EDEBE6] line-clamp-1">
                    {d.title}
                  </h3>
                  {d.description && (
                    <p className="text-xs text-[#8A867E] line-clamp-2 mt-1">{d.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#2E2E30] flex items-center justify-between text-[11px] text-[#8A867E]">
                  <span>{formatFileSize(d.fileSize)}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <EpButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    View
                  </EpButton>
                </a>

                {!d.isAcknowledged && (
                  <EpButton
                    variant="primary"
                    size="sm"
                    loading={acknowledgingId === d.id}
                    onClick={() => handleAcknowledge(d.id)}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Acknowledge
                  </EpButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
