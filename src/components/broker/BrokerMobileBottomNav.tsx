"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Briefcase, Wallet, Menu } from "lucide-react";

interface BrokerMobileBottomNavProps {
  onOpenMenu: () => void;
}

export function BrokerMobileBottomNav({ onOpenMenu }: BrokerMobileBottomNavProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/broker/dashboard") return pathname === "/broker/dashboard";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const navItems = [
    { name: "Overview", href: "/broker/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/broker/leads", icon: Users },
    { name: "Projects", href: "/broker/projects", icon: Briefcase },
    { name: "Commissions", href: "/broker/commissions", icon: Wallet },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B0D10]/95 backdrop-blur-md border-t border-[#22262D] px-2 py-1 select-none"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                active ? "text-[#C2A878]" : "text-[#8B94A1] hover:text-[#E6E8EB]"
              }`}
            >
              <Icon className="w-4 h-4 mb-1" strokeWidth={active ? 2.2 : 1.75} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium text-[#8B94A1] hover:text-[#E6E8EB] cursor-pointer"
        >
          <Menu className="w-4 h-4 mb-1" strokeWidth={1.75} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
