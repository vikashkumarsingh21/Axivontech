import React, { ReactNode } from "react";
import { EpButton } from "./EpButton";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: any;
  customAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  customAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-[#1A1A1B] border border-[#2E2E30] shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#4F9D83]/10 border border-[#4F9D83]/20 flex items-center justify-center text-[#4F9D83] mb-4 shadow-2xs">
        {Icon ? (
          <Icon className="w-6 h-6" />
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      <h3 className="text-base font-semibold text-[#EDEBE6] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#B3AFA6] max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {customAction
        ? customAction
        : actionLabel &&
          onAction && (
            <EpButton variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </EpButton>
          )}
    </div>
  );
}
