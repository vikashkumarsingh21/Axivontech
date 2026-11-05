"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function MobileNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top duration-200 z-50">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Connected back online. Workspace synchronized.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-1.5 z-50 shadow-sm">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>No internet connection. Viewing offline data.</span>
    </div>
  );
}
