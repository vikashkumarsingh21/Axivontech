"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";

/**
 * Dedicated Application Entry Point (/app)
 * Automatically evaluates the active session and navigates:
 * - Unauthenticated -> /app/login
 * - Authenticated -> User's authorized role dashboard
 */
export default function AppEntryPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("Securing workspace session...");

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
            setStatusText("Opening authorized portal...");
            const target = data.mustChangePassword
              ? "/auth/change-password"
              : resolveRoleDashboardUrl(data.user.role);
            router.replace(target);
            return;
          }
        }

        // Not authenticated
        setStatusText("Redirecting to login...");
        router.replace("/app/login");
      } catch (err) {
        if (!isMounted) return;
        router.replace("/app/login");
      }
    }

    evaluateAppSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] flex flex-col items-center justify-center p-6 select-none">
      {/* Official Brand Logo */}
      <div className="relative mb-6">
        <Image
          src="/assets/logo/logo-full.png"
          alt="Axivon Technologies"
          width={200}
          height={55}
          priority
          className="h-10 sm:h-12 w-auto brightness-0 invert opacity-95 object-contain"
        />
      </div>

      {/* Modern Emerald Spinner */}
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />

      {/* Informative Status Text */}
      <p className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wide animate-pulse">
        {statusText}
      </p>
    </div>
  );
}
