import { ExecutiveSidebar } from "@/components/portal/ExecutiveSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Portal | Axivon Technologies",
};

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <ExecutiveSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-amber-500/10 bg-[#0a0a0a] flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-amber-400/90 tracking-wide uppercase">
              Founder & Executive Command Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-inner">
              E
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
