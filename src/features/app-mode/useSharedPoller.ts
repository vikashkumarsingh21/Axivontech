"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAppMode } from "./useAppMode";

export interface SharedPollerOptions {
  onPoll: () => Promise<void> | void;
  baseIntervalMs?: number; // Minimum 60000ms (60 seconds)
  enabled?: boolean;
}

/**
 * Shared Notification & Badge Poller
 *
 * Enforces Low-Data Compliance:
 * 1. Minimum interval >= 60 seconds (prevents aggressive baseline polling of 34 req/min).
 * 2. Immediately halts polling when page is hidden or app is in background (Page Visibility API).
 * 3. Exponential backoff upon network or server errors (60s -> 120s -> 240s -> 300s max).
 * 4. Never polls on /login or public pages.
 */
export function useSharedPoller({
  onPoll,
  baseIntervalMs = 60000,
  enabled = true,
}: SharedPollerOptions) {
  const { isAppMode } = useAppMode();
  const pathname = usePathname();

  const minInterval = Math.max(60000, baseIntervalMs);
  const currentIntervalRef = useRef<number>(minInterval);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const executePollRef = useRef<() => Promise<void>>(async () => {});

  const isLoginRoute = pathname === "/login";

  const scheduleNextPoll = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled || isLoginRoute) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    timerRef.current = setTimeout(() => {
      executePollRef.current();
    }, currentIntervalRef.current);
  }, [enabled, isLoginRoute]);

  const executePoll = useCallback(async () => {
    // Never poll if hidden or route is /login
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    if (isLoginRoute || !enabled) {
      return;
    }

    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      await onPoll();
      // On success, reset interval back to base 60s
      currentIntervalRef.current = minInterval;
    } catch {
      // Exponential backoff on errors: 60s -> 120s -> 240s -> max 300s
      currentIntervalRef.current = Math.min(300000, currentIntervalRef.current * 2);
    } finally {
      isPollingRef.current = false;
      scheduleNextPoll();
    }
  }, [onPoll, isLoginRoute, enabled, minInterval, scheduleNextPoll]);

  useEffect(() => {
    executePollRef.current = executePoll;
  }, [executePoll]);

  useEffect(() => {
    if (!enabled || isLoginRoute) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Initial schedule
    scheduleNextPoll();

    // Page Visibility API integration: stop on background, resume on foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        currentIntervalRef.current = minInterval;
        executePoll();
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, isLoginRoute, scheduleNextPoll, executePoll, minInterval]);
}
