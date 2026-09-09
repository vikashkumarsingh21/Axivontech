"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, Loader2, ArrowRight, FileText, CheckSquare, Megaphone, Users, Briefcase, UserCheck, Building2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  link: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // If parent is listening, it will open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "Task": return <CheckSquare className="w-4 h-4 text-blue-400" />;
      case "Announcement": return <Megaphone className="w-4 h-4 text-amber-400" />;
      case "Employee": case "User": return <Users className="w-4 h-4 text-purple-400" />;
      case "Project": return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "Lead": return <UserCheck className="w-4 h-4 text-orange-400" />;
      case "Client": return <Building2 className="w-4 h-4 text-cyan-400" />;
      case "Opportunity": return <TrendingUp className="w-4 h-4 text-rose-400" />;
      case "Document": return <FileText className="w-4 h-4 text-yellow-400" />;
      default: return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSelect = (item: SearchResult) => {
    onClose();
    router.push(item.link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#161a23]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, documents, leads, projects, announcements... (ESC to close)"
            className="flex-1 bg-transparent border-none text-white text-sm placeholder:text-gray-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
          {query.trim().length >= 2 && results.length === 0 && !loading && (
            <div className="p-8 text-center text-sm text-gray-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="p-6 text-center text-xs text-gray-500 space-y-1">
              <p>Type at least 2 characters to search across all platform entities.</p>
              <p className="text-[11px] text-gray-600">Supports Tasks, Announcements, Employees, Projects, Leads, Clients, Opportunities, and Documents.</p>
            </div>
          )}

          {results.map((item, idx) => (
            <div
              key={`${item.type}-${item.id}-${idx}`}
              onClick={() => handleSelect(item)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                      {item.type}
                    </span>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          ))}
        </div>

        <div className="px-4 py-2 bg-[#12151c] border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
          <span>Axivon Global Search</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
}
