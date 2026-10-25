"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/notifications/toast";
import { parseApiResponse, ParsedApiResponse, getErrorMessage } from "@/lib/errors/client";

export interface UseApiActionOptions<TInput = any, TOutput = any> {
  /**
   * Async handler that either calls fetch or returns a Response/ParsedApiResponse.
   */
  action: (input: TInput) => Promise<Response | ParsedApiResponse<TOutput>>;

  /**
   * Toast message shown on success. Can be a string or a function receiving the data.
   */
  successMessage?: string | ((data: TOutput, raw: any) => string);

  /**
   * Custom error message or override function.
   */
  errorMessage?: string | ((err: unknown) => string);

  /**
   * Callback fired on successful response.
   */
  onSuccess?: (data: TOutput, raw: any) => void | Promise<void>;

  /**
   * Callback fired on failure.
   */
  onError?: (errorMessage: string, fieldErrors: Record<string, string>, raw: any) => void | Promise<void>;

  /**
   * Whether to show toast notifications. Defaults to true.
   */
  showErrorToast?: boolean;
  showSuccessToast?: boolean;

  /**
   * Automatically redirect to /login?expired=1 on 401 Unauthorized.
   * Defaults to true.
   */
  redirectToLoginOn401?: boolean;
}

export interface UseApiActionResult<TInput = any, TOutput = any> {
  execute: (input: TInput) => Promise<ParsedApiResponse<TOutput> | null>;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  data: TOutput | null;
  reset: () => void;
}

export function useApiAction<TInput = void, TOutput = any>(
  options: UseApiActionOptions<TInput, TOutput>
): UseApiActionResult<TInput, TOutput> {
  const {
    action,
    successMessage,
    errorMessage: customErrorMessage,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = true,
    redirectToLoginOn401 = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<TOutput | null>(null);

  const isExecutingRef = useRef(false);
  const router = useRouter();

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setData(null);
    setLoading(false);
    isExecutingRef.current = false;
  }, []);

  const execute = useCallback(
    async (input: TInput): Promise<ParsedApiResponse<TOutput> | null> => {
      // Guard against double submit while previous request is running
      if (isExecutingRef.current) {
        return null;
      }

      isExecutingRef.current = true;
      setLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        const rawResult = await action(input);
        const parsed: ParsedApiResponse<TOutput> =
          rawResult instanceof Response ? await parseApiResponse<TOutput>(rawResult) : (rawResult as ParsedApiResponse<TOutput>);

        if (!parsed.ok) {
          // Handle 401 Session Expiration
          if (parsed.status === 401 && redirectToLoginOn401) {
            toast.error("Session expired, please sign in again.");
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              if (currentPath !== "/login") {
                router.push("/login?expired=1");
                return parsed;
              }
            }
          }

          const message =
            typeof customErrorMessage === "function"
              ? customErrorMessage(parsed.errorMessage)
              : customErrorMessage || parsed.errorMessage || "Something went wrong. Please try again.";

          setError(message);
          setFieldErrors(parsed.fieldErrors || {});

          if (showErrorToast) {
            toast.error(message);
          }

          if (onError) {
            await onError(message, parsed.fieldErrors || {}, parsed.raw);
          }

          return parsed;
        }

        // Success handling
        setData(parsed.data);

        if (showSuccessToast && successMessage) {
          const toastMsg =
            typeof successMessage === "function" ? successMessage(parsed.data as TOutput, parsed.raw) : successMessage;
          if (toastMsg) {
            toast.success(toastMsg);
          }
        }

        if (onSuccess) {
          await onSuccess(parsed.data as TOutput, parsed.raw);
        }

        return parsed;
      } catch (err: unknown) {
        const message =
          typeof customErrorMessage === "function"
            ? customErrorMessage(err)
            : customErrorMessage || getErrorMessage(err);

        setError(message);
        setFieldErrors({});

        if (showErrorToast) {
          toast.error(message);
        }

        if (onError) {
          await onError(message, {}, err);
        }

        return null;
      } finally {
        setLoading(false);
        isExecutingRef.current = false;
      }
    },
    [
      action,
      successMessage,
      customErrorMessage,
      onSuccess,
      onError,
      showErrorToast,
      showSuccessToast,
      redirectToLoginOn401,
      router,
    ]
  );

  return {
    execute,
    loading,
    error,
    fieldErrors,
    data,
    reset,
  };
}

/**
 * Universal safe fetch helper with built-in toast support and 401 detection.
 */
export async function apiFetch<T = any>(
  url: string,
  init?: RequestInit,
  options?: {
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
    redirectToLoginOn401?: boolean;
  }
): Promise<ParsedApiResponse<T>> {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    redirectToLoginOn401 = true,
  } = options || {};

  try {
    const res = await fetch(url, init);
    const parsed = await parseApiResponse<T>(res);

    if (!parsed.ok) {
      if (parsed.status === 401 && redirectToLoginOn401) {
        toast.error("Session expired, please sign in again.");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login?expired=1";
        }
      } else if (showErrorToast && parsed.errorMessage) {
        toast.error(parsed.errorMessage);
      }
    } else if (showSuccessToast && successMessage) {
      toast.success(successMessage);
    }

    return parsed;
  } catch (err) {
    const errorMsg = getErrorMessage(err);
    if (showErrorToast) {
      toast.error(errorMsg);
    }
    return {
      ok: false,
      status: 0,
      data: null,
      raw: err,
      errorMessage: errorMsg,
      fieldErrors: {},
    };
  }
}
