"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Listens for App Router client navigation and tracks page views without duplication.
 */
export default function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Avoid firing duplicate page_view on initial page load (gtag handles initial load automatically)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const url = searchParams && searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}
