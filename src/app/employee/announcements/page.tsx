"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Calendar,
  User,
  Search,
  ChevronRight,
  X,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { EpButton } from "@/components/employee/EpButton";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  priority?: "NORMAL" | "HIGH" | "URGENT" | null;
  publishAt: string;
  expiresAt?: string | null;
  isRead?: boolean;
  readAt?: string | null;
  createdBy?: {
    name: string;
    email: string;
  } | null;
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementItem | null>(null);

  const loadData = () => {
    fetch("/api/v1/employee/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.announcements)) {
          setItems(data.announcements);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAnnouncement = async (a: AnnouncementItem) => {
    setActiveAnnouncement(a);
    if (!a.isRead) {
      try {
        setItems((prev) =>
          prev.map((item) => (item.id === a.id ? { ...item, isRead: true } : item))
        );
        await fetch("/api/v1/employee/announcements/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ announcementId: a.id }),
        });
      } catch (err) {
        console.error("Failed to mark announcement as read:", err);
      }
    }
  };

  const unreadCount = useMemo(() => {
    return items.filter((a) => !a.isRead).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedPriority !== "ALL") {
        if (selectedPriority === "UNREAD") {
          if (a.isRead) return false;
        } else if (a.priority !== selectedPriority) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedPriority]);

  const getPriorityVariant = (priority?: string | null): "error" | "warning" | "neutral" => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      default:
        return "neutral";
    }
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
        title="Company Announcements"
        subtitle="Official company broadcasts, organizational updates, and policy memorandums."
        action={
          unreadCount > 0 ? (
            <StatusBadge variant="info">
              {unreadCount} Unread Broadcast{unreadCount > 1 ? "s" : ""}
            </StatusBadge>
          ) : (
            <StatusBadge variant="neutral">
              All Caught Up
            </StatusBadge>
          )
        }
      />

      {/* Search & Priority Filter Bar */}
      <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A867E] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search announcements by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
          />
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "All Broadcasts" },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "URGENT", label: "Urgent" },
            { id: "HIGH", label: "High Priority" },
            { id: "NORMAL", label: "Normal" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPriority(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                selectedPriority === tab.id
                  ? "bg-[#4F9D83]/15 text-[#4F9D83] border border-[#4F9D83]/30 font-semibold"
                  : "bg-[#232324] text-[#8A867E] hover:text-[#EDEBE6] border border-[#2E2E30]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2">
          <Megaphone className="w-10 h-10 text-[#8A867E] mx-auto" />
          <h3 className="text-base font-semibold text-[#EDEBE6]">No announcements found</h3>
          <p className="text-xs text-[#8A867E]">
            {searchQuery || selectedPriority !== "ALL"
              ? "No broadcasts match your query."
              : "There are no active company broadcasts at this time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((a) => (
            <div
              key={a.id}
              onClick={() => handleOpenAnnouncement(a)}
              className="p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl hover:border-[#3A3A3D] transition-colors cursor-pointer space-y-3 relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Unread indicator dot */}
                    {!a.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#4F9D83] ring-4 ring-[#4F9D83]/20 shrink-0" />
                    )}

                    {a.priority && a.priority !== "NORMAL" && (
                      <StatusBadge variant={getPriorityVariant(a.priority)}>
                        {a.priority}
                      </StatusBadge>
                    )}
                    {a.category && (
                      <span className="text-[11px] text-[#B3AFA6] bg-[#232324] border border-[#2E2E30] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Tag className="w-3 h-3 text-[#4F9D83]" />
                        {a.category}
                      </span>
                    )}
                    <span className="text-[11px] text-[#8A867E] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8A867E]" />
                      {new Date(a.publishAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className={`text-base font-medium transition-colors ${!a.isRead ? "text-[#EDEBE6] font-semibold" : "text-[#B3AFA6]"} group-hover:text-[#4F9D83]`}>
                    {a.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#8A867E] group-hover:text-[#4F9D83] transition-colors shrink-0">
                  <span>Read details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#8A867E] line-clamp-3 leading-relaxed">
                {a.content}
              </p>

              {a.createdBy && (
                <div className="pt-2 border-t border-[#2E2E30] flex items-center gap-2 text-[11px] text-[#8A867E]">
                  <User className="w-3.5 h-3.5 text-[#8A867E]" />
                  <span>Published by {a.createdBy.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1A1A1B] border border-[#2E2E30] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#2E2E30] bg-[#121212] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {activeAnnouncement.priority && (
                    <StatusBadge variant={getPriorityVariant(activeAnnouncement.priority)}>
                      {activeAnnouncement.priority}
                    </StatusBadge>
                  )}
                  {activeAnnouncement.category && (
                    <span className="text-[10px] text-[#B3AFA6] bg-[#232324] border border-[#2E2E30] px-2 py-0.5 rounded font-medium">
                      {activeAnnouncement.category}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-[#EDEBE6] mt-1">
                  {activeAnnouncement.title}
                </h2>
                <div className="text-xs text-[#8A867E] flex items-center gap-3 pt-0.5">
                  <span>
                    Published: {new Date(activeAnnouncement.publishAt).toLocaleDateString()}
                  </span>
                  {activeAnnouncement.createdBy && (
                    <span>By: {activeAnnouncement.createdBy.name}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="p-1.5 rounded-lg text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#232324] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm text-[#EDEBE6] leading-relaxed whitespace-pre-wrap">
              {activeAnnouncement.content}
            </div>

            <div className="p-4 border-t border-[#2E2E30] bg-[#121212] flex justify-end">
              <EpButton
                variant="secondary"
                size="sm"
                onClick={() => setActiveAnnouncement(null)}
              >
                Close
              </EpButton>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
