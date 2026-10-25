import React from "react";
import { FolderOpen, Users, DollarSign, FileText, Bell, Search } from "lucide-react";

export type EmptyStateType = "leads" | "projects" | "commissions" | "documents" | "notifications" | "search" | "general";

interface BrokerEmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function BrokerEmptyState({
  type = "general",
  title,
  description,
  action,
  className = "",
}: BrokerEmptyStateProps) {
  const getIcon = () => {
    const iconClass = "w-7 h-7 text-[#C2A878]/70 stroke-[1.5]";
    switch (type) {
      case "leads":
        return <Users className={iconClass} />;
      case "projects":
        return <FolderOpen className={iconClass} />;
      case "commissions":
        return <DollarSign className={iconClass} />;
      case "documents":
        return <FileText className={iconClass} />;
      case "notifications":
        return <Bell className={iconClass} />;
      case "search":
        return <Search className={iconClass} />;
      default:
        return <FolderOpen className={iconClass} />;
    }
  };

  return (
    <div
      className={`rounded-xl border border-[#22262D] bg-[#111317] p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}
    >
      {/* Abstract Architectural SVG container */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#171A1F] border border-[#22262D] flex items-center justify-center shadow-inner relative z-10">
          {getIcon()}
        </div>
        <div className="absolute inset-0 rounded-2xl bg-[#C2A878]/5 blur-lg -z-0" />
      </div>

      <h3 className="text-base font-semibold text-[#E6E8EB] mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-[#8B94A1] max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {action && <div className="inline-flex items-center justify-center">{action}</div>}
    </div>
  );
}
