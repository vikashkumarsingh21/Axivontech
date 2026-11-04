"use client";

import { useState, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface MobilePullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 65;

export function MobilePullToRefresh({
  children,
  onRefresh,
  className = "",
}: MobilePullToRefreshProps) {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const scrollContainer = containerRef.current;
    if (scrollContainer && scrollContainer.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Apply friction damping
      const damped = Math.min(diff * 0.45, 100);
      setPullY(damped);
    } else {
      setPullY(0);
      isPullingRef.current = false;
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return;
    isPullingRef.current = false;

    if (pullY >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullY(50);
      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          router.refresh();
          await new Promise((r) => setTimeout(r, 600));
        }
      } catch (err) {
        // Fallback
      } finally {
        setIsRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-y-auto ${className}`}
    >
      {/* Pull Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-150 pointer-events-none z-30"
        style={{
          height: `${pullY}px`,
          opacity: pullY > 15 ? Math.min(pullY / PULL_THRESHOLD, 1) : 0,
        }}
        aria-hidden="true"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1B] border border-[#2E2E30] text-[#4F9D83] shadow-md">
          <Loader2
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullY * 4}deg)`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          transform: pullY > 0 ? `translateY(${pullY}px)` : undefined,
          transition: pullY > 0 && !isRefreshing ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
