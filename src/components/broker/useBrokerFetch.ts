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

// Client-side in-memory cache for GET requests (15s SWR)
const clientFetchCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_LIFETIME_MS = 15_000;

export function useBrokerFetch<T>(
  url: string,
  options?: FetchOptions
): UseBrokerFetchResult<T> {
  // Check if we have cached data to show immediately
  const cachedEntry = !options?.manual && (!options?.method || options.method === "GET")
    ? clientFetchCache.get(url)
    : undefined;
  const initialData = cachedEntry ? (cachedEntry.data as T) : null;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!options?.manual && !initialData);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | undefined>(undefined);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const executeFetch = useCallback(async (bypassCache = false): Promise<T | null> => {
    const isGet = !optionsRef.current?.method || optionsRef.current.method === "GET";

    if (!bypassCache && isGet) {
      const cached = clientFetchCache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_LIFETIME_MS) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setFieldErrors(undefined);

    // Request deduplication for simultaneous calls to identical GET URL
    if (isGet && inFlightRequests.has(url)) {
      try {
        const sharedData = await inFlightRequests.get(url);
        setData(sharedData);
        setLoading(false);
        return sharedData;
      } catch {}
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(url, {
          ...optionsRef.current,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...optionsRef.current?.headers,
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
        if (isGet) {
          clientFetchCache.set(url, { data: resultData, timestamp: Date.now() });
        }
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
      } finally {
        if (isGet) {
          inFlightRequests.delete(url);
        }
      }
    })();

    if (isGet) {
      inFlightRequests.set(url, fetchPromise);
    }

    return fetchPromise;
  }, [url]);

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
    refetch: () => executeFetch(true),
    setData,
  };
}
