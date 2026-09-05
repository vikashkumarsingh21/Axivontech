import type { Metadata } from "next";
import { AdminSidebar } from "@/components/portal/AdminSidebar";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import Link from "next/link";
import { ShieldAlert, Bell, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin & CRM Portal — Axivon Technologies",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || "");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("axivon_session")?.value;

  let isInactive = false;
  let userName = "Administrator";
  let userRole = "ADMIN";

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ["HS256"],
      });
      const userId = payload.userId as string;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, status: true, userRoles: { include: { role: true } } },
      });

      if (user) {
        userName = user.name;
        if (user.userRoles.length > 0) {
          userRole = user.userRoles[0].role.name;
        }
        if (user.status === "INACTIVE") {
          isInactive = true;
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  if (isInactive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-gray-200 p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ACCOUNT INACTIVE</h1>
          <p className="text-gray-400">
            Your account is currently inactive. Please contact the administrator for further assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-200">
      {/* Permanent Left Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Top Header Navbar */}
        <header className="h-16 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400">Axivon Control Center</span>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-bold text-white tracking-wide uppercase">{userRole}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin/notifications" className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]"></span>
            </Link>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-xs">
                <p className="text-white font-semibold">{userName}</p>
                <p className="text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
