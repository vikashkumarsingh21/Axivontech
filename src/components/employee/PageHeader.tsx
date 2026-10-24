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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-800/80">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/10">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-heading">
            {title}
          </h1>
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
