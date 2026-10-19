"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ShieldCheck, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export interface TurnstileWidgetHandle {
  reset: () => void;
}

export type TurnstileWidgetRef = TurnstileWidgetHandle;

export interface TurnstileWidgetProps {
  siteKey?: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const SCRIPT_ID = "cloudflare-turnstile-script";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  (
    {
      siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
      action,
      theme = "dark",
      size = "normal",
      onVerify,
      onExpire,
      onError,
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "verified" | "error" | "expired">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Expose reset() handle to parent component
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
            setStatus("ready");
            setErrorMessage(null);
          } catch (e) {
            console.warn("[Turnstile] Reset failed:", e);
          }
        }
      },
    }));

    const renderWidget = useCallback(() => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          action,
          callback: (token: string) => {
            setStatus("verified");
            setErrorMessage(null);
            onVerify(token);
          },
          "expired-callback": () => {
            setStatus("expired");
            onExpire?.();
          },
          "error-callback": (code?: string) => {
            setStatus("error");
            const msg = "Security check error. Click to retry.";
            setErrorMessage(msg);
            onError?.(code || "turnstile_error");
          },
          "timeout-callback": () => {
            setStatus("expired");
            onExpire?.();
          },
        });

        widgetIdRef.current = id;
        setStatus("ready");
      } catch (err: any) {
        console.error("[Turnstile] Render error:", err);
        setStatus("error");
        setErrorMessage("Failed to initialize security verification.");
      }
    }, [siteKey, theme, action, onVerify, onExpire, onError]);

    // Load Turnstile script once globally
    useEffect(() => {
      let isMounted = true;

      if (window.turnstile) {
        renderWidget();
        return;
      }

      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_URL;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if (window.turnstile && isMounted) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.turnstile && isMounted) {
          setStatus("error");
          setErrorMessage("Security script timed out. Check connection.");
        }
      }, 10000);

      return () => {
        isMounted = false;
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore cleanup errors
          }
          widgetIdRef.current = null;
        }
      };
    }, [renderWidget]);

    const handleManualRetry = () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setStatus("ready");
        setErrorMessage(null);
      } else {
        renderWidget();
      }
    };

    return (
      <div className={`my-3 space-y-2 ${className}`}>
        {/* Turnstile explicit widget mount node */}
        <div
          ref={containerRef}
          className="flex justify-center sm:justify-start min-h-[65px]"
          aria-live="polite"
        />

        {/* Loading placeholder before widget renders */}
        {status === "loading" && !widgetIdRef.current && (
          <div className="flex items-center gap-2 text-xs text-[#7E8997] px-3 py-2 rounded-lg bg-[#151A21] border border-[#29313B]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Initializing Cloudflare Anti-Bot verification…</span>
          </div>
        )}

        {/* Verified indicator badge */}
        {status === "verified" && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Bot Verification Passed</span>
          </div>
        )}

        {/* Error notification with manual retry and dev bypass if in test mode */}
        {status === "error" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-red-400 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage || "Verification challenge failed."}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualRetry}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-red-500/20 hover:bg-red-500/30 px-2 py-0.5 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              {(siteKey === "1x00000000000000000000AA" || process.env.NODE_ENV !== "production") && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus("verified");
                    setErrorMessage(null);
                    onVerify("1x00000000000000000000AA");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded transition-colors"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Pass Test
                </button>
              )}
            </div>
          </div>
        )}

        {/* Expired token banner */}
        {status === "expired" && (
          <div className="flex items-center justify-between text-xs text-amber-400 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Verification token expired. Please refresh the check.</span>
            </div>
            <button
              type="button"
              onClick={handleManualRetry}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        )}
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";
