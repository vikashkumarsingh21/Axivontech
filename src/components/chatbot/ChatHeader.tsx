"use client";

import { useState } from "react";
import Image from "next/image";
import { X, RotateCcw, Sparkles, Check, AlertTriangle } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onReset?: () => void;
  botName?: string;
  isOnline?: boolean;
}

export function ChatHeader({
  onClose,
  onReset,
  botName = "Axivon AI Assistant",
  isOnline = true,
}: ChatHeaderProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleConfirmReset = () => {
    setShowConfirmReset(false);
    if (onReset) onReset();
  };

  return (
    <div className="relative flex shrink-0 items-center justify-between border-b border-[#29313B] bg-[#101318] px-4 py-3 sm:px-5 sm:py-3.5 sm:rounded-t-2xl z-20">
      {/* Identity & Status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D242D] border border-[#29313B] shadow-xs">
          <Image
            src="/assets/logo/logo-icon.png"
            alt="Axivon Technologies"
            width={22}
            height={22}
            className="h-5 w-5 object-contain"
            onError={(e) => {
              // Graceful fallback to icon if image fails
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <Sparkles className="h-4 w-4 text-[#10B981] hidden only:block" />
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-[#101318]"
            title="Online and operational"
            aria-label="Online"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F5F7] tracking-tight truncate">
              {botName}
            </h3>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20">
              Verified
            </span>
          </div>
          <p className="text-[11px] font-medium text-[#A7B0BC] truncate flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden />
            Virtual Receptionist • Axivon Technologies
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onReset && (
          <div className="relative">
            <button
              onClick={() => setShowConfirmReset((v) => !v)}
              aria-label="Reset Conversation"
              title="Reset conversation"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A7B0BC] hover:bg-[#1D242D] hover:text-[#F3F5F7] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Confirm Reset Popover */}
            {showConfirmReset && (
              <div className="absolute right-0 top-10 z-30 w-56 rounded-xl border border-[#29313B] bg-[#171C23] p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-2 mb-2 text-xs text-[#F3F5F7]">
                  <AlertTriangle className="h-4 w-4 text-[#D6B779] shrink-0 mt-0.5" />
                  <span>Clear conversation history and start fresh?</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#29313B]">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-1 text-[11px] font-medium text-[#A7B0BC] hover:text-[#F3F5F7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="px-2.5 py-1 rounded-md bg-red-500/15 border border-red-500/30 text-[11px] font-semibold text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close Axivon AI Assistant"
          title="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A7B0BC] hover:bg-[#1D242D] hover:text-[#F3F5F7] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
