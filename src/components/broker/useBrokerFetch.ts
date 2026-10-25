"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface FetchOptions extends RequestInit {
  manual?: boolean;
}

interface UseBrokerFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  refetch: () => Promise<T | null>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useBrokerFetch<T>(
  url: string,
  options?: FetchOptions
): UseBrokerFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!options?.manual);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>(undefined);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeFetch = useCallback(async (): Promise<T | null> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setFieldErrors(undefined);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || json?.success === false) {
        const errorMsg =
          json?.error?.message ||
          (res.status === 401
            ? "Your session has expired. Please log in again."
            : res.status === 403
            ? "You do not have permission to access this resource."
            : `Request failed (HTTP ${res.status}).`);
        setError(errorMsg);
        setFieldErrors(json?.error?.fields);
        setLoading(false);
        return null;
      }

      const resultData = json?.data !== undefined ? json.data : json;
      setData(resultData);
      setLoading(false);
      return resultData;
    } catch (err: any) {
      if (err.name === "AbortError") {
        return null;
      }
      const errorMsg = err?.message || "A network error occurred. Please check your connection.";
      setError(errorMsg);
      setLoading(false);
      return null;
    }
  }, [url, options]);

  useEffect(() => {
    if (!options?.manual) {
      executeFetch();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeFetch, options?.manual]);

  return {
    data,
    loading,
    error,
    fieldErrors,
    refetch: executeFetch,
    setData,
  };
}
