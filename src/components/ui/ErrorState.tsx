"use client";

import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  backHref,
  backLabel = "Go back",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={"flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#11141A] border border-red-500/20 max-w-xl mx-auto my-8 " + className}
      role="alert"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-[#F3F5F7] mb-2">{title}</h3>
      <p className="text-sm text-[#A7B0BC] max-w-md mb-6">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#F3F5F7] border border-white/10 rounded-lg text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
