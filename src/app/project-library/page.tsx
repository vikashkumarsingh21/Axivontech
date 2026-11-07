import { Metadata } from "next";
import Link from "next/link";
import { ProjectLibraryDashboard } from "@/components/project-library/ProjectLibraryDashboard";
import { ArrowLeft, Home, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "AxivonTech Project Library — Completed Projects Archive",
  description: "Centralized archive of verified completed projects delivered by Axivon Technologies.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnifiedProjectLibraryPage() {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-xs">
              AX
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Axivon Technologies</h1>
              <p className="text-[11px] text-slate-400">Authenticated Enterprise System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectLibraryDashboard />
      </main>
    </div>
  );
}
