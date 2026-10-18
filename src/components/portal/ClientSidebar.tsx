"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderCheck, 
  FolderOpen, 
  CreditCard, 
  User, 
  LogOut, 
  ShieldCheck,
  LifeBuoy,
  Bell,
  X 
} from "lucide-react";

const navItems = [
  { name: "Client Overview", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "My Projects", href: "/client/projects", icon: Briefcase },
  { name: "Deliverables & UAT", href: "/client/uat", icon: FolderCheck },
  { name: "Documents", href: "/client/documents", icon: FolderOpen },
  { name: "Invoices & Payments", href: "/client/invoices", icon: CreditCard },
  { name: "Support & Helpdesk", href: "/client/support", icon: LifeBuoy },
  { name: "Notifications", href: "/client/notifications", icon: Bell },
  { name: "Account Profile", href: "/client/profile", icon: User },
];

export interface ClientSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarInnerProps {
  pathname: string;
  onClose?: () => void;
}

function SidebarInner({ pathname, onClose }: SidebarInnerProps) {
  const isActive = (href: string) =>
    pathname === href || (href !== "/client/dashboard" && pathname?.startsWith(href));

  return (
    <div className="flex flex-col h-full bg-[#0E1116] border-r border-[#1E2530] w-64 pt-5 select-none shadow-xs">
      {/* Brand Header */}
      <div className="px-5 pb-5 border-b border-[#1E2530] flex items-center justify-between">
        <div>
          <Link href="/client/dashboard" className="block transition-opacity hover:opacity-90">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={140}
              height={36}
              className="h-7 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Client Workspace</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#566171] hover:text-[#F3F5F7] hover:bg-[#202833] transition-colors"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                  : "text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#202833] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active
                      ? "text-emerald-500"
                      : "text-[#566171] group-hover:text-[#A7B0BC]"
                  }`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span>{item.name}</span>
              </div>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3.5 border-t border-[#1E2530] bg-[#0B0D10]/50">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#7E8997] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 text-[#566171] group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (isOpen !== undefined && onClose !== undefined) {
    return (
      <>
        <div className="hidden lg:flex h-full shrink-0">
          <SidebarInner pathname={pathname} onClose={onClose} />
        </div>
        <div
          className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarInner pathname={pathname} onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <aside className="h-full shrink-0">
      <SidebarInner pathname={pathname} />
    </aside>
  );
}
