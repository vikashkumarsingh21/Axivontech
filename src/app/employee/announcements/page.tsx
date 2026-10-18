"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Megaphone,
  Calendar,
  User,
  Search,
  Loader2,
  AlertTriangle,
  ChevronRight,
  X,
  Tag,
} from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  priority?: "NORMAL" | "HIGH" | "URGENT" | null;
  publishAt: string;
  expiresAt?: string | null;
  createdBy?: {
    name: string;
    email: string;
  } | null;
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementItem | null>(null);

  useEffect(() => {
    fetch("/api/v1/employee/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.announcements)) {
          setItems(data.announcements);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((a) => {
      if (a.category) set.add(a.category.toUpperCase());
    });
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory !== "ALL") {
        if (!a.category || a.category.toUpperCase() !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory]);

  const getPriorityBadge = (priority?: string | null) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
          Company Announcements
        </h1>
        <p className="text-sm text-[#A7B0BC] mt-1">
          Official company broadcasts, organizational updates, and policy memorandums.
        </p>
      </div>

      {/* Search & Categories Bar */}
      <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#566171] absolute left-3 top-3 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search announcements by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
          />
        </div>

        {/* Categories */}
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
              {cat === "ALL" ? "All Broadcasts" : cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#7E8997] gap-3">
          <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
          <span>Loading announcements...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <Megaphone className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F5F7]">No announcements</h3>
          <p className="text-xs text-[#7E8997]">
            {searchQuery || selectedCategory !== "ALL"
              ? "No broadcasts match your query."
              : "There are no active company broadcasts at this time."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((a) => (
            <Card
              key={a.id}
              onClick={() => setActiveAnnouncement(a)}
              className="p-5 bg-[#151A21] border-[#29313B] rounded-xl hover:border-[#364152] transition-all cursor-pointer space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.priority && a.priority !== "NORMAL" && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                          a.priority
                        )}`}
                      >
                        {a.priority}
                      </span>
                    )}
                    {a.category && (
                      <span className="text-[11px] text-[#A7B0BC] bg-[#10151B] border border-[#29313B] px-2 py-0.5 rounded flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#D6B779]" />
                        {a.category}
                      </span>
                    )}
                    <span className="text-[11px] text-[#7E8997] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.publishAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F3F5F7] hover:text-emerald-400 transition-colors">
                    {a.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#7E8997] shrink-0">
                  <span>Read details</span>
                  <ChevronRight className="w-4 h-4 text-[#A7B0BC]" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#A7B0BC] line-clamp-3 leading-relaxed">
                {a.content}
              </p>

              {a.createdBy && (
                <div className="pt-2 border-t border-[#1E2530] flex items-center gap-2 text-[11px] text-[#7E8997]">
                  <User className="w-3.5 h-3.5 text-[#566171]" />
                  <span>Published by {a.createdBy.name}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1E2530] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {activeAnnouncement.priority && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        activeAnnouncement.priority
                      )}`}
                    >
                      {activeAnnouncement.priority}
                    </span>
                  )}
                  {activeAnnouncement.category && (
                    <span className="text-[10px] text-[#A7B0BC] bg-[#10151B] border border-[#29313B] px-2 py-0.5 rounded">
                      {activeAnnouncement.category}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#F3F5F7] mt-1">
                  {activeAnnouncement.title}
                </h2>
                <div className="text-xs text-[#7E8997] flex items-center gap-3 pt-0.5">
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
                className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm text-[#F3F5F7] leading-relaxed whitespace-pre-wrap">
              {activeAnnouncement.content}
            </div>

            <div className="p-4 border-t border-[#1E2530] bg-[#10151B]/50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveAnnouncement(null)}
                className="border-[#29313B] text-[#A7B0BC]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
