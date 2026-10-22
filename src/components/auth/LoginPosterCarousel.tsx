"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Poster {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  altText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  displayOrder: number;
}

export const LoginPosterCarousel: React.FC = () => {
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
    <div
      role="region"
      aria-label="Featured Announcements"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:flex lg:w-[60%] relative flex-col justify-between overflow-hidden bg-[#0B0D10]"
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#061811] via-[#0b1f17] to-[#0B0D10]">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                  <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
                </div>
              )}

              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />

              {/* Bottom text */}
              <div className="relative z-10 p-10 xl:p-16 max-w-2xl mb-8">
                <h3 className="text-3xl font-bold text-[#F3F5F7] tracking-tight leading-tight">
                  {currentPoster.title}
                </h3>
                {currentPoster.subtitle && (
                  <p className="text-base text-[#A7B0BC] mt-3 leading-relaxed">
                    {currentPoster.subtitle}
                  </p>
                )}
                {currentPoster.ctaLabel && currentPoster.ctaUrl && (
                  <div className="mt-5">
                    <Link
                      href={currentPoster.ctaUrl}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-semibold tracking-wide transition-colors shadow-lg shadow-emerald-500/20"
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
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#101318]/60 hover:bg-[#1B222B] border border-[#29313B] text-[#F3F5F7] backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#101318]/60 hover:bg-[#1B222B] border border-[#29313B] text-[#F3F5F7] backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      ? "w-8 bg-emerald-500"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress bar: thin emerald line at bottom */}
          {posters.length > 1 && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 z-30"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      ) : (
        /* Fallback when no posters (empty array or fetch error) */
        <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0B0D10] via-[#071a12] to-[#0B0D10] overflow-hidden">
          {/* Emerald animated orb/glow effect in background */}
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
            className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none"
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
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight leading-snug mb-3">
              Engineering Tomorrow&apos;s Infrastructure
            </h2>
            <p className="text-sm text-[#A7B0BC] max-w-sm leading-relaxed">
              Unified enterprise workspace, mission-critical operations, and intelligent systems.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
