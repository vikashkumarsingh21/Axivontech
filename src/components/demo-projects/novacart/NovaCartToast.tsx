"use client";

import React from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { useNovaCart } from "@/context/NovaCartContext";

export default function NovaCartToast() {
  const { toasts, dismissToast } = useNovaCart();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border border-[#1C1D1A] bg-[#1C1D1A] px-4 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-[#D8F16A] shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-[#D8F16A] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="rounded p-1 text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            aria-label="Dismiss toast"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
