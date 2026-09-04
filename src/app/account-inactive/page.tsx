"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, Mail, HelpCircle } from "lucide-react";

export default function AccountInactivePage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      document.cookie = "axivon_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0a0a0c] border border-red-500/30 rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider uppercase">
            Access Restricted
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ACCOUNT INACTIVE
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your account is currently inactive. Please contact the administrator for further assistance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-left space-y-3 text-xs text-gray-300">
          <div className="flex items-center gap-2 text-gray-400 font-medium border-b border-gray-800 pb-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Why am I seeing this?</span>
          </div>
          <p>
            An administrator has temporarily deactivated your profile. While your account is inactive, access to internal tools, attendance logging, tasks, and project management is suspended.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-3 px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Signing out..." : "Return to Login"}</span>
          </button>
          
          <a
            href="mailto:support@axivon.dev"
            className="inline-flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors py-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Administrator</span>
          </a>
        </div>
      </div>
    </div>
  );
}
