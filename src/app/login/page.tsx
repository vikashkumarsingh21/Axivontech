"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronLeft, ChevronRight, AlertCircle, Lock, Mail } from "lucide-react";

// Types
interface Poster {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  altText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  displayOrder: number;
}

export default function LoginPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Poster carousel state
  const [posters, setPosters] = useState<Poster[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Check prefers-reduced-motion safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReduced(mediaQuery.matches);
      const listener = (event: MediaQueryListEvent) => {
        setPrefersReduced(event.matches);
      };
      mediaQuery.addEventListener?.("change", listener);
      return () => mediaQuery.removeEventListener?.("change", listener);
    }
  }, []);

  // Fetch posters on mount to avoid hydration mismatch
  useEffect(() => {
    let isMounted = true;
    async function fetchPosters() {
      try {
        const res = await fetch("/api/v1/public/login-posters");
        if (!res.ok) throw new Error("Failed to fetch posters");
        const data = await res.json();
        const list: Poster[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.posters)
          ? data.posters
          : [];
        if (isMounted) {
          list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
          setPosters(list);
        }
      } catch {
        if (isMounted) {
          setPosters([]);
        }
      }
    }
    fetchPosters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Slide navigation callbacks
  const goToNext = useCallback(() => {
    if (posters.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % posters.length);
    setProgress(0);
  }, [posters.length]);

  const goToPrev = useCallback(() => {
    if (posters.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
    setProgress(0);
  }, [posters.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  // Advance slide when progress completes
  useEffect(() => {
    if (posters.length <= 1) return;

    if (progress >= 100) {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
      setProgress(0);
    }
  }, [progress, posters.length]);

  // Progress bar timer: 50ms tick, 0 -> 100 over 6000ms
  useEffect(() => {
    if (posters.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (50 / 6000) * 100;
        return next >= 100 ? 100 : next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [posters.length, isHovered]);

  // Keyboard navigation support: Left / Right arrow keys
  useEffect(() => {
    if (posters.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") {
        return;
      }
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [posters.length, goToPrev, goToNext]);

  // Auth form submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success, route based on user role
      const userRole = data.user.role;
      if (userRole === "FOUNDER" || userRole === "CO_FOUNDER") {
        router.push("/executive/dashboard");
      } else if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if imageUrl is a valid URL or path
  const hasValidImage = (url?: string) => {
    if (!url) return false;
    const trimmed = url.trim();
    return (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/")
    );
  };

  const currentPoster = posters[currentIndex] || posters[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left panel (40% desktop, full width mobile): Login form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-[#0a0a0a] z-10 border-r border-white/[0.04]">
        {/* Top: Logo & AXIVON ONE Badge */}
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={160}
              height={44}
              className="h-8 sm:h-9 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <div className="mt-2.5">
            <span className="inline-flex items-center text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              AXIVON ONE
            </span>
          </div>
        </div>

        {/* Center: Animated Login Form */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5 }}
          className="w-full max-w-[390px] mx-auto my-auto py-10"
        >
          {/* Welcome heading & subtext */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome back.
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Sign in to your secure workspace.
            </p>
          </motion.div>

          {/* Error Message Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-[13px] text-red-400"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Work Email Field */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.2 }}
            >
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-gray-300 mb-2"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@axivontech.in"
                  autoComplete="email"
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors duration-150"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.3 }}
            >
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={prefersReduced ? undefined : { scale: 1.01 }}
                whileTap={prefersReduced ? undefined : { scale: 0.99 }}
                className="w-full h-11 mt-1 bg-red-600 text-white font-semibold text-[14px] rounded-lg hover:bg-red-500 active:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] shadow-lg shadow-red-600/20"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between text-xs text-gray-500">
          <Link
            href="/"
            className="hover:text-gray-300 transition-colors"
          >
            ← Back to website
          </Link>
          <span className="text-gray-600">
            © {new Date().getFullYear()} Axivon Technologies
          </span>
        </div>
      </div>

      {/* Right panel (60% desktop, hidden mobile): Animated poster carousel */}
      <div
        role="region"
        aria-label="Featured Announcements"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden lg:flex lg:w-[60%] relative flex-col justify-between overflow-hidden bg-[#0a0a0a]"
      >
        {posters.length > 0 && currentPoster ? (
          <div className="relative w-full h-full flex flex-col justify-end overflow-hidden">
            {/* Slide animation container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPoster.id || currentIndex}
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReduced ? undefined : { opacity: 0 }}
                transition={{ duration: prefersReduced ? 0 : 0.6, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col justify-end"
              >
                {/* Full-panel background */}
                {hasValidImage(currentPoster.imageUrl) ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
                    style={{ backgroundImage: `url("${currentPoster.imageUrl}")` }}
                    aria-label={currentPoster.altText || currentPoster.title}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1c0808] via-[#120505] to-[#0a0a0a]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                    <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-red-600/10 blur-[100px] pointer-events-none" />
                  </div>
                )}

                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />

                {/* Bottom text */}
                <div className="relative z-10 p-10 xl:p-16 max-w-2xl mb-8">
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">
                    {currentPoster.title}
                  </h3>
                  {currentPoster.subtitle && (
                    <p className="text-base text-gray-300 mt-3 leading-relaxed">
                      {currentPoster.subtitle}
                    </p>
                  )}
                  {currentPoster.ctaLabel && currentPoster.ctaUrl && (
                    <div className="mt-5">
                      <Link
                        href={currentPoster.ctaUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-colors shadow-lg shadow-red-600/20"
                      >
                        <span>{currentPoster.ctaLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev/Next arrow buttons */}
            {posters.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous slide"
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dot pagination at bottom */}
            {posters.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {posters.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                      index === currentIndex
                        ? "w-8 bg-red-500"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Progress bar: thin red line at bottom */}
            {posters.length > 1 && (
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-red-500 z-30"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        ) : (
          /* Fallback when no posters (empty array or fetch error) */
          <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0f0f0f] via-[#1a0a0a] to-[#0a0a0a] overflow-hidden">
            {/* Red animated orb/glow effect in background */}
            <motion.div
              animate={
                prefersReduced
                  ? undefined
                  : {
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-[500px] h-[500px] rounded-full bg-red-600/15 blur-[120px] pointer-events-none"
            />

            {/* Subtle animated background grid */}
            <motion.div
              animate={
                prefersReduced
                  ? undefined
                  : {
                      backgroundPosition: ["0px 0px", "32px 32px"],
                    }
              }
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none"
            />

            {/* Center-aligned branded content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
              <Image
                src="/assets/logo/logo-full.png"
                alt="Axivon Technologies"
                width={240}
                height={64}
                className="h-12 w-auto brightness-0 invert opacity-95 mb-6"
                priority
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-3">
                Engineering Tomorrow&apos;s Infrastructure
              </h2>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Unified enterprise workspace, mission-critical operations, and intelligent systems.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
