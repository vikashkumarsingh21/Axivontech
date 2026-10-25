"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { toastManager, ToastItem } from "@/lib/notifications/toast";

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((items) => {
      setToasts(items);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReduced(mediaQuery.matches);
      const listener = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
      mediaQuery.addEventListener?.("change", listener);
      return () => mediaQuery.removeEventListener?.("change", listener);
    }
  }, []);

  return (
    <aside
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            prefersReduced={prefersReduced}
            onDismiss={() => toastManager.dismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </aside>
  );
}

function ToastCard({
  toast,
  prefersReduced,
  onDismiss,
}: {
  toast: ToastItem;
  prefersReduced: boolean;
  onDismiss: () => void;
}) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, toast.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  const config = {
    success: {
      bg: "bg-[#0B1512] border-emerald-500/30 text-emerald-200",
      iconColor: "text-emerald-400",
      icon: CheckCircle2,
      ariaRole: "status" as const,
      ariaLive: "polite" as const,
    },
    error: {
      bg: "bg-[#180E10] border-red-500/30 text-red-200",
      iconColor: "text-red-400",
      icon: AlertCircle,
      ariaRole: "alert" as const,
      ariaLive: "assertive" as const,
    },
    warning: {
      bg: "bg-[#18130B] border-amber-500/30 text-amber-200",
      iconColor: "text-amber-400",
      icon: AlertTriangle,
      ariaRole: "status" as const,
      ariaLive: "polite" as const,
    },
    info: {
      bg: "bg-[#0B1218] border-sky-500/30 text-sky-200",
      iconColor: "text-sky-400",
      icon: Info,
      ariaRole: "status" as const,
      ariaLive: "polite" as const,
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <motion.div
      layout
      role={config.ariaRole}
      aria-live={config.ariaLive}
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: prefersReduced ? 0.05 : 0.2 }}
      className={`pointer-events-auto rounded-xl border p-3.5 shadow-xl shadow-black/50 backdrop-blur-md flex items-start gap-3 ${config.bg}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <h4 className="text-[13px] font-semibold text-[#F3F5F7] mb-0.5 tracking-tight">
            {toast.title}
          </h4>
        )}
        <p className="text-[12.5px] leading-relaxed break-words font-medium opacity-90">
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[#7E8997] hover:text-[#F3F5F7] p-1 rounded transition-colors shrink-0 -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
