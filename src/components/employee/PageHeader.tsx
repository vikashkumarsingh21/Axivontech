"use client";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#1E2530]">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E6E8EB] tracking-tight font-heading">{title}</h1>
        {subtitle && <p className="text-sm text-[#8B94A1]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
