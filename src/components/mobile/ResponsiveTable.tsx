"use client";

import type { ReactNode } from "react";
import { useAppMode } from "@/features/app-mode/useAppMode";
import { CardList, type CardListItem } from "./CardList";

interface ResponsiveTableProps {
  cardItems?: CardListItem[];
  children: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function ResponsiveTable({
  cardItems,
  children,
  emptyTitle,
  emptyDescription,
  className = "",
}: ResponsiveTableProps) {
  const { isAppMode } = useAppMode();

  // If in App Mode and cardItems mapping is supplied, render the mobile CardList
  if (isAppMode && cardItems) {
    return (
      <CardList
        items={cardItems}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        className={className}
      />
    );
  }

  // Otherwise render table container (with touch-friendly scroll container on small screens)
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-[#2E2E30] bg-[#1A1A1B] ${className}`}>
      {children}
    </div>
  );
}
