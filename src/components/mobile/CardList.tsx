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
  success: "bg-[#162721] text-[#A2D9C7] border-[#27483C]",
  accent: "bg-[#162721] text-[#A2D9C7] border-[#27483C]",
  warning: "bg-[#2B2113] text-[#F5D59E] border-[#523E1F]",
  error: "bg-[#2A1515] text-[#F5A3A3] border-[#5A2424]",
  neutral: "bg-[#232324] text-[#B3AFA6] border-[#2E2E30]",
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
                <div className="text-sm font-semibold text-[#EDEBE6] leading-snug">
                  {item.title}
                </div>
                {Boolean(item.subtitle) && (
                  <div className="text-xs text-[#B3AFA6] mt-0.5 truncate">{item.subtitle}</div>
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
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#242426]">
                {item.fields?.map((field, idx) => (
                  <div key={idx} className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#827E76] font-medium block truncate">
                      {field.label}
                    </span>
                    <span className="text-xs text-[#EDEBE6] font-medium truncate block tabular-nums">
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
                <div className="flex items-center justify-end w-full text-xs font-medium text-[#4F9D83] gap-1">
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
              className="block rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] hover:border-[#4F9D83]/40 active:scale-[0.99] transition-all shadow-sm"
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
              className="cursor-pointer rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] hover:border-[#4F9D83]/40 active:scale-[0.99] transition-all shadow-sm"
            >
              {content}
            </div>
          );
        }

        return (
          <div
            key={item.id}
            className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] shadow-sm"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
