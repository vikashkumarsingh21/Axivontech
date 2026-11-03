"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-h-[90vh] rounded-t-2xl bg-[#1A1A1B] border-t border-[#2E2E30] pb-[env(safe-area-inset-bottom)] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 ease-out"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="h-1.5 w-10 rounded-full bg-[#38383A]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2E2E30]">
          <div>
            <h2 className="text-base font-semibold text-[#EDEBE6] tracking-tight">{title}</h2>
            {Boolean(description) && (
              <p className="text-xs text-[#B3AFA6] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232324] text-[#B3AFA6] hover:text-[#EDEBE6] active:scale-95 transition-transform"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-5 py-4 max-h-[calc(90vh-140px)] space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {Boolean(footer) && (
          <div className="border-t border-[#2E2E30] px-5 py-3 bg-[#1A1A1B]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
