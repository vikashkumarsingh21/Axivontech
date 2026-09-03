import { AdminSidebar } from "@/components/portal/AdminSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Axivon Technologies",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6">
          <h1 className="text-sm font-medium text-gray-400">Admin Control Center</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
