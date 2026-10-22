"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { RECAPTCHA_TEST_KEYS } from "@/lib/captcha/recaptcha";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          theme?: "dark" | "light";
          size?: "normal" | "compact";
          tabindex?: number;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error?: any) => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      ready: (callback: () => void) => void;
    };
    __recaptchaScriptLoading?: Promise<void>;
  }
}

export interface GoogleRecaptchaWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onExpired?: () => void;
  onError?: (err?: any) => void;
  theme?: "dark" | "light";
  size?: "normal" | "compact";
  resetTrigger?: number | boolean;
  className?: string;
  errorMessage?: string | null;
}

/**
 * Loads the official Google reCAPTCHA v2 API script once across the application lifecycle.
 */
function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
    return Promise.resolve();
  }

  if (window.__recaptchaScriptLoading) {
    return window.__recaptchaScriptLoading;
  }

  window.__recaptchaScriptLoading = new Promise<void>((resolve, reject) => {
    // Check if script already exists in DOM
    const existing = document.querySelector('script[src*="google.com/recaptcha/api.js"]');
    if (existing) {
      if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        resolve();
        return;
      }
      const pollTimer = setInterval(() => {
        if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
          clearInterval(pollTimer);
          resolve();
        }
      }, 50);

      existing.addEventListener("load", () => {
        clearInterval(pollTimer);
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => resolve());
        } else {
          resolve();
        }
      });
      existing.addEventListener("error", (e) => {
        clearInterval(pollTimer);
        reject(e);
      });
      setTimeout(() => {
        clearInterval(pollTimer);
        if (window.grecaptcha) {
          resolve();
        } else {
          reject(new Error("reCAPTCHA script load timed out"));
        }
      }, 8000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => resolve());
      } else {
        const poll = setInterval(() => {
          if (window.grecaptcha) {
            clearInterval(poll);
            window.grecaptcha.ready(() => resolve());
          }
        }, 50);
        setTimeout(() => {
          clearInterval(poll);
          resolve();
        }, 4000);
      }
    };

    script.onerror = (err) => {
      console.error("[reCAPTCHA] Failed to load Google reCAPTCHA script:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return window.__recaptchaScriptLoading;
}

export const GoogleRecaptchaWidget: React.FC<GoogleRecaptchaWidgetProps> = ({
  siteKey: propSiteKey,
  onVerify,
  onExpire,
  onExpired,
  onError,
  theme = "dark",
  size = "normal",
  resetTrigger,
  className = "",
  errorMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Store callbacks in refs to guarantee stable references and avoid effect re-execution
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onExpiredRef = useRef(onExpired);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onExpiredRef.current = onExpired;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onExpired, onError]);

  // Resolve Site Key cleanly (strip any surrounding quotes or whitespace)
  const rawKey =
    propSiteKey ||
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY;
  const activeSiteKey = rawKey.replace(/['"]/g, "").trim();

  // Initialize and render the genuine Google reCAPTCHA widget
  useEffect(() => {
    let isCancelled = false;

    loadRecaptchaScript()
      .then(() => {
        if (isCancelled || !containerRef.current || !window.grecaptcha) return;

        window.grecaptcha.ready(() => {
          if (isCancelled || !containerRef.current || !window.grecaptcha) return;

          // Check if an iframe is already rendered inside this container
          const existingIframe = containerRef.current.querySelector("iframe");
          if (existingIframe) {
            setIsLoaded(true);
            setLoadError(null);
            return;
          }

          // If widgetId is already assigned and container has child nodes, it is loaded
          if (widgetIdRef.current !== null && containerRef.current.hasChildNodes()) {
            setIsLoaded(true);
            setLoadError(null);
            return;
          }

          try {
            // Clean out any stale empty text nodes or non-iframe debris
            if (containerRef.current.hasChildNodes() && !containerRef.current.querySelector("iframe")) {
              containerRef.current.innerHTML = "";
            }

            const widgetId = window.grecaptcha.render(containerRef.current, {
              sitekey: activeSiteKey,
              theme: theme,
              size: size,
              callback: (token: string) => {
                onVerifyRef.current(token);
              },
              "expired-callback": () => {
                onExpireRef.current?.();
                onExpiredRef.current?.();
              },
              "error-callback": (err?: any) => {
                onErrorRef.current?.(err);
              },
            });

            widgetIdRef.current = widgetId;
            setIsLoaded(true);
            setLoadError(null);
          } catch (renderErr: any) {
            console.warn("[reCAPTCHA] Render status:", renderErr);
            const errStr = String(renderErr || "");
            if (errStr.includes("already been rendered")) {
              setIsLoaded(true);
              setLoadError(null);
            } else {
              setLoadError("Failed to initialize verification challenge.");
            }
          }
        });
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("[reCAPTCHA] Script load failed:", err);
          setLoadError("Verification service could not be loaded. Please check your internet connection.");
          onErrorRef.current?.(err);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSiteKey, theme, size]);

  // Handle external reset triggers cleanly
  useEffect(() => {
    if (resetTrigger !== undefined && widgetIdRef.current !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (e) {
        console.warn("[reCAPTCHA] Widget reset failed:", e);
      }
    }
  }, [resetTrigger]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative min-h-[78px] min-w-[304px] flex items-center justify-center sm:justify-start">
        {/* Loading placeholder skeleton - shown only while waiting for iframe */}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 w-[304px] h-[78px] rounded-lg border border-[#29313B] bg-[#10151B]/80 flex items-center justify-center gap-2.5 text-xs text-[#7E8997] animate-pulse pointer-events-none z-10">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Loading verification check…</span>
          </div>
        )}

        {/* The genuine Google reCAPTCHA container - never hidden with opacity-0 */}
        <div
          ref={containerRef}
          id="recaptcha-widget-container"
          className="min-h-[78px] min-w-[304px] rounded"
        />
      </div>

      {/* Network or Script Load Error */}
      {loadError && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Validation / Form Error */}
      {errorMessage && (
        <div role="alert" className="flex items-center gap-1.5 text-xs text-red-400 font-medium animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
