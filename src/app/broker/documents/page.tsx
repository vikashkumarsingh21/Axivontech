"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Star,
  Check,
  ShieldCheck,
  FolderOpen,
  Filter,
  FileCode,
  FileSpreadsheet,
  File,
  Eye,
  Sparkles,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerSkeletonTable } from "@/components/broker/BrokerSkeleton";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";
import { formatDateIN } from "@/components/broker/BrokerFormatters";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  isImportant: boolean;
  isRead: boolean;
  readAt: string | null;
  isBroadcast: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  AGREEMENTS: "Agreements & Contracts",
  POLICIES: "Commercial Policies",
  MARKETING: "Marketing & Pitch Decks",
  COMPLIANCE: "Tax & Compliance (TDS)",
  REPORTS: "Financial Statements",
  GENERAL: "General Resources",
};

export default function BrokerDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);

      const res = await fetch(`/api/v1/broker/documents?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load documents catalog.");
      const json = await res.json();
      const data = json.data;
      setDocuments(data.documents || []);
      setCategories(data.categories || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Mark document as read
  const handleMarkAsRead = async (docId: string) => {
    // Optimistic UI update
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isRead: true, readAt: new Date().toISOString() } : d))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await fetch(`/api/v1/broker/documents/${docId}/read`, { method: "POST" });
    } catch (e) {
      console.error("Failed to mark document as read", e);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (unreadOnly && doc.isRead) return false;
      return true;
    });
  }, [documents, unreadOnly]);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "PDF Document";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <BrokerPageHeader
        title="Document & Resource Center"
        subtitle="Access official master agreements, statutory Section 194H declarations, referral guidelines, and marketing collateral."
        badge={
          unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30">
              <span className="w-2 h-2 rounded-full bg-[#C2A878] animate-pulse" />
              {unreadCount} Unread {unreadCount === 1 ? "Notice" : "Notices"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Documents Acknowledged
            </span>
          )
        }
      />

      {/* Featured Master Partner Agreement Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#C2A878]/15 via-[#171A1F] to-[#111317] border border-[#C2A878]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C2A878] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Commercial Instrument
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0E1013] text-[#E6E8EB] border border-[#22262D]">
              v2.1
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#E6E8EB]">
            Axivon Master Business Partner Commercial Agreement
          </h3>
          <p className="text-xs text-[#8B94A1]">
            Defines the 10% fee schedule, 48-hour SLA disbursement terms, and Section 194H non-circumvention
            protection.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/business-partner/policy" target="_blank">
            <BrokerButton variant="secondary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
              Read Policy
            </BrokerButton>
          </Link>
          <Link href="/broker/onboarding">
            <BrokerButton variant="primary" size="sm" icon={<Check className="w-3.5 h-3.5" />}>
              Agreement Status
            </BrokerButton>
          </Link>
        </div>
      </div>

      {/* Category Tabs & Toolbar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "ALL"
                ? "bg-[#C2A878] text-[#0A0B0D]"
                : "bg-[#171A1F] text-[#8B94A1] hover:text-[#E6E8EB] border border-[#22262D]"
            }`}
          >
            All Resources ({documents.length})
          </button>

          {categories.map((cat) => {
            const count = documents.filter((d) => d.category === cat).length;
            const label = CATEGORY_LABELS[cat] || cat.replace(/_/g, " ");
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#C2A878] text-[#0A0B0D]"
                    : "bg-[#171A1F] text-[#8B94A1] hover:text-[#E6E8EB] border border-[#22262D]"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Filter Strip */}
        <div className="p-3.5 rounded-xl border border-[#22262D] bg-[#111317] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566171]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by keyword..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
            />
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors self-start sm:self-auto ${
              unreadOnly
                ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                : "bg-[#171A1F] border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                unreadOnly ? "bg-[#C2A878]" : "bg-[#566171]"
              }`}
            />
            <span>Unread Only</span>
          </button>
        </div>
      </div>

      {/* Documents Grid / List */}
      {loading ? (
        <BrokerSkeletonTable rows={4} cols={4} />
      ) : filteredDocuments.length === 0 ? (
        <BrokerEmptyState
          type="documents"
          title="No Documents Available"
          description={
            search || unreadOnly
              ? "No documents matched your search criteria. Try resetting the filters."
              : "All official resources and agreements will be published here as they become available."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const isImportant = doc.isImportant;
            const isUnread = !doc.isRead;

            return (
              <BrokerCard
                key={doc.id}
                className={`relative transition-all hover:border-[#C2A878]/40 ${
                  isUnread ? "border-l-4 border-l-[#C2A878]" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* File Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isImportant
                        ? "bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30"
                        : "bg-[#171A1F] text-[#8B94A1] border border-[#22262D]"
                    }`}
                  >
                    {isImportant ? <Star className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0E1013] text-[#C2A878] border border-[#22262D]">
                        {CATEGORY_LABELS[doc.category] || doc.category.replace(/_/g, " ")}
                      </span>
                      {isUnread && (
                        <span className="text-[10px] font-semibold text-[#C2A878] bg-[#C2A878]/15 px-2 py-0.5 rounded-full border border-[#C2A878]/25">
                          New Notice
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#E6E8EB] leading-snug">{doc.title}</h4>
                    <p className="text-xs text-[#8B94A1] leading-relaxed line-clamp-2">
                      {doc.description || "Official Axivon Technologies partner documentation."}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#566171] font-mono">
                      <span>{formatDateIN(doc.createdAt)}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.sizeBytes)}</span>
                      {doc.readAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Acknowledged</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="mt-4 pt-3 border-t border-[#1E232B] flex items-center justify-between gap-3">
                  <div>
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(doc.id)}
                        className="text-xs text-[#8B94A1] hover:text-[#C2A878] inline-flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge Read</span>
                      </button>
                    )}
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(doc.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C2A878] hover:bg-[#D4BC8B] text-[#0A0B0D] font-bold text-xs transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </BrokerCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
