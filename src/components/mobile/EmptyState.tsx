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
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-500 mb-3 shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
      {Boolean(description) && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
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
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white border border-rose-200 shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">{message}</p>
      {Boolean(onRetry) && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
