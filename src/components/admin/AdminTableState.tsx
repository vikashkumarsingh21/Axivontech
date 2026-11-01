"use client";

import React from "react";
import { AlertCircle, RefreshCw, Search, X, Plus } from "lucide-react";

export interface AdminTableStateProps {
  loading: boolean;
  error?: string | null;
  isEmpty: boolean;
  hasActiveFilters?: boolean;
  colSpan: number;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchEmptyTitle?: string;
  searchEmptyDescription?: string;
  addLabel?: string;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onAdd?: () => void;
}

export function AdminTableState({
  loading,
  error,
  isEmpty,
  hasActiveFilters = false,
  colSpan,
  loadingMessage = "Loading data...",
  emptyTitle = "No records yet",
  emptyDescription = "There are no records found in the system.",
  searchEmptyTitle = "No results found",
  searchEmptyDescription = "No records matched your search terms or active filters.",
  addLabel = "Add New",
  onRetry,
  onClearFilters,
  onAdd,
}: AdminTableStateProps) {
  // 1. Loading State (Skeletons + Spinner)
  if (loading) {
    return (
      <>
        {[...Array(4)].map((_, idx) => (
          <tr key={`skeleton-${idx}`} className="animate-pulse border-b border-white/5">
            <td colSpan={colSpan} className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-3.5 bg-white/10 rounded" />
                    <div className="w-24 h-2.5 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="hidden sm:block w-20 h-3 bg-white/5 rounded" />
                <div className="hidden sm:block w-16 h-4 bg-white/5 rounded-full" />
                <div className="w-16 h-7 bg-white/5 rounded-lg" />
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  // 2. Error State with Retry Button
  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-white font-medium text-sm">Failed to load data</p>
            <p className="text-gray-400 text-xs leading-relaxed">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#1a1a1a] hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // 3. Search / Filter Empty State
  if (isEmpty && hasActiveFilters) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-10 text-center">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-1">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-white font-semibold text-sm">{searchEmptyTitle}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{searchEmptyDescription}</p>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#1a1a1a] hover:bg-white/10 text-white text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // 4. Truly Empty State
  if (isEmpty) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-2">
              <Search className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-white font-semibold text-base">{emptyTitle}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{emptyDescription}</p>
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="mt-4 inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-red-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>{addLabel}</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return null;
}
