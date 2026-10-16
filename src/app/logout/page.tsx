"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogOut, CheckCircle2, ArrowRight } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [loggedOut, setLoggedOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Immediately trigger backend logout API
    const performLogout = async () => {
      try {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      } catch (err) {
        console.error("Logout request error:", err);
      } finally {
        // Clear client-side cookie defensively
        if (typeof document !== "undefined") {
          document.cookie =
            "axivon_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        setLoggedOut(true);
      }
    };

    performLogout();

    // Smooth progress bar animation
    const startTime = Date.now();
    const duration = 1200; // 1.2 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        // Clean redirect to login page with logged_out notice
        if (typeof window !== "undefined") {
          window.location.href = "/login?logged_out=1";
        } else {
          router.replace("/login?logged_out=1");
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="min-h-dvh bg-[#0B0D10] text-[#F3F5F7] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background ambient emerald glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block focus:outline-none">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={160}
              height={44}
              className="h-8 sm:h-9 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
        </div>

        {/* Central Logout Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full bg-[#151A21] border border-[#29313B] rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/60 text-center flex flex-col items-center relative overflow-hidden"
        >
          {/* Top subtle progress bar line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#1E2530]">
            <motion.div
              className="h-full bg-emerald-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Animated Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400 relative">
            {loggedOut ? (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </motion.div>
            ) : (
              <LogOut className="w-7 h-7 animate-pulse text-emerald-400" />
            )}
          </div>

          {/* Title & Status */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F5F7] mb-2">
            {loggedOut ? "Session Terminated" : "Signing Out..."}
          </h1>

          <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed max-w-xs mb-6">
            Your credentials and session tokens have been securely removed. Redirecting you back to the login page...
          </p>

          {/* Progress Percentage & Status */}
          <div className="w-full bg-[#10151B] border border-[#1E2530] rounded-xl p-3 flex items-center justify-between text-xs mb-6">
            <span className="text-[#7E8997] font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Redirecting to Login
            </span>
            <span className="font-mono font-semibold text-emerald-400">
              {progress}%
            </span>
          </div>

          {/* Immediate Action Button */}
          <Link
            href="/login?logged_out=1"
            className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Return to Login Immediately</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Security Assurance Footer Note */}
        <p className="text-[11px] text-[#566171] mt-6 text-center">
          Axivon ONE Identity Management • Safe Session Teardown
        </p>
      </div>
    </main>
  );
}
