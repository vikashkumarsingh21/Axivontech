import type { ReactNode, ComponentType } from "react";
import { FolderOpen, AlertCircle, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FolderOpen,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#1A1A1B] border border-[#2E2E30]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#232324] border border-[#2E2E30] text-[#B3AFA6] mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[#EDEBE6] tracking-tight">{title}</h3>
      {Boolean(description) && (
        <p className="text-xs text-[#B3AFA6] mt-1 max-w-xs">{description}</p>
      )}
      {Boolean(action) && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#1A1A1B] border border-[#C85555]/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C85555]/10 border border-[#C85555]/20 text-[#C85555] mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[#EDEBE6]">{title}</h3>
      <p className="text-xs text-[#B3AFA6] mt-1 max-w-xs">{message}</p>
      {Boolean(onRetry) && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-xs font-semibold text-[#EDEBE6] hover:bg-[#2A2A2C] active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#4F9D83]" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
