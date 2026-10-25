"use client";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: any;
}

export function PageHeader({ title, subtitle, action, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#2E2E30]">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-[#4F9D83]/12 border border-[#4F9D83]/28 flex items-center justify-center text-[#4F9D83] shrink-0 shadow-xs">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#EDEBE6] tracking-tight leading-tight">
            {title}
          </h1>
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-[#B3AFA6]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
