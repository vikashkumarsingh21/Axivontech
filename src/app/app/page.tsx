"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";

/**
 * Dedicated Application Entry & Splash Screen (/app)
 * Professional, clean light interface.
 * Evaluates active session and navigates directly:
 * - Unauthenticated -> /app/login
 * - Authenticated -> User's authorized role dashboard
 */
export default function AppEntryPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("Initializing Axivon workspace...");

  useEffect(() => {
    let isMounted = true;

    async function evaluateAppSession() {
      try {
        const res = await fetch("/api/v1/auth/session", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data?.user?.role) {
            setStatusText("Opening authorized workspace...");
            const target = data.mustChangePassword
              ? "/auth/change-password"
              : resolveRoleDashboardUrl(data.user.role);
            router.replace(target);
            return;
          }
        }

        // Unauthenticated
        setStatusText("Opening login...");
        router.replace("/app/login");
      } catch (err) {
        if (!isMounted) return;
        router.replace("/app/login");
      }
    }

    // Brief 300ms pause to ensure smooth native splash transition
    const timer = setTimeout(evaluateAppSession, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 select-none">
      {/* Official Company Logo */}
      <div className="relative mb-8 flex flex-col items-center">
        <Image
          src="/assets/logo/logo-full.png"
          alt="Axivon Technologies"
          width={220}
          height={60}
          priority
          className="h-12 sm:h-14 w-auto object-contain"
        />
        <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 text-[11px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
          <span>Official Business Application</span>
        </div>
      </div>

      {/* Modern Emerald Spinner */}
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-teal-600 animate-spin mb-4" />

      {/* Status Notice */}
      <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
        {statusText}
      </p>
    </div>
  );
}
