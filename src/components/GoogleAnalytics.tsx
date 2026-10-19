"use client";

import Script from "next/script";
import { Suspense, useState, useEffect } from "react";
import AnalyticsRouteTracker from "@/components/analytics/AnalyticsRouteTracker";
import { getStoredConsent, CONSENT_EVENT_NAME } from "@/lib/legal/cookie-consent";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QCHH8ELS1K";
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Initial check
    const stored = getStoredConsent();
    if (stored?.analytics) {
      setHasConsent(true);
    }

    // Dynamic listener for consent events
    const handleUpdate = (e: any) => {
      const prefs = e.detail;
      setHasConsent(Boolean(prefs?.analytics));
    };

    window.addEventListener(CONSENT_EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(CONSENT_EVENT_NAME, handleUpdate);
  }, []);

  if (!gaId || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}', {
            send_page_view: true
          });
        `}
      </Script>

      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>
    </>
  );
}
