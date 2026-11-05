"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface CardListItem {
  id: string;
  title: ReactNode;
  subtitle?: string;
  status?: {
    label: string;
    variant?: "success" | "warning" | "error" | "neutral" | "accent";
  };
  fields?: Array<{ label: string; value: ReactNode }>;
  onClick?: () => void;
  href?: string;
  action?: ReactNode;
}

interface CardListProps {
  items: CardListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

const STATUS_VARIANT_STYLES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  accent: "bg-teal-50 text-teal-700 border-teal-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
};

export function CardList({
  items,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no items to display.",
  className = "",
}: CardListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const statusStyle = item.status?.variant
          ? STATUS_VARIANT_STYLES[item.status.variant] || STATUS_VARIANT_STYLES.neutral
          : STATUS_VARIANT_STYLES.neutral;

        const content = (
          <div className="flex flex-col gap-2.5 p-4">
            {/* Header row: Title + Status chip */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  {item.title}
                </div>
                {Boolean(item.subtitle) && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</div>
                )}
              </div>

              {Boolean(item.status) && (
                <span
                  className={`inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle}`}
                >
                  {item.status?.label}
                </span>
              )}
            </div>

            {/* Key fields (2-3 items) */}
            {Boolean(item.fields && item.fields.length > 0) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {item.fields?.map((field, idx) => (
                  <div key={idx} className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block truncate">
                      {field.label}
                    </span>
                    <span className="text-xs text-slate-700 font-medium truncate block tabular-nums">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action / Chevron */}
            <div className="flex items-center justify-between pt-1">
              {item.action ? (
                <div className="w-full">{item.action}</div>
              ) : item.onClick || item.href ? (
                <div className="flex items-center justify-end w-full text-xs font-semibold text-teal-600 gap-1 hover:text-teal-700">
                  <span>View Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              ) : null}
            </div>
          </div>
        );

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm active:scale-[0.99] transition-all overflow-hidden"
            >
              {content}
            </Link>
          );
        }

        if (item.onClick) {
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              role="button"
              tabIndex={0}
              className="block cursor-pointer rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm active:scale-[0.99] transition-all overflow-hidden"
            >
              {content}
            </div>
          );
        }

        return (
          <div
            key={item.id}
            className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
