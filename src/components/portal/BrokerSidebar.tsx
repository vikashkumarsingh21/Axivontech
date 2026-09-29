"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCircle, LogOut, Briefcase, FileText, Wallet, Bell } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/broker/dashboard", icon: LayoutDashboard },
  { name: "My Leads", href: "/broker/leads", icon: Users },
  { name: "Projects", href: "/broker/projects", icon: Briefcase },
  { name: "Commissions", href: "/broker/commissions", icon: Wallet },
  { name: "Documents", href: "/broker/documents", icon: FileText },
  { name: "Notifications", href: "/broker/notifications", icon: Bell },
  { name: "Profile", href: "/broker/profile", icon: UserCircle },
];

export function BrokerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/10 w-64 flex-shrink-0">
      <div className="p-6 border-b border-white/10">
        <Link href="/broker/dashboard" className="block">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={150}
            height={36}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <div className="mt-2">
          <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Partner Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/broker/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-red-500/10 text-red-500 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={17} className={isActive ? "text-red-500" : "text-gray-500"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={async () => {
            await fetch("/api/v1/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={17} className="text-gray-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
