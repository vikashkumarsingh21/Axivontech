"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Wrench,
  GraduationCap,
  Mail,
  FileText,
  Image as ImageIcon,
  BarChart3,
  MessageSquareQuote,
  Users,
  Settings,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";

/**
 * Represents a single navigation entry in the sidebar.
 */
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Primary navigation items for the admin panel.
 * Kept data-driven so menu changes never require touching layout markup.
 */
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Careers", href: "/admin/careers", icon: GraduationCap },
  { label: "Contacts", href: "/admin/contacts", icon: Mail },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/**
 * Props for the Sidebar component.
 *
 * `isCollapsed` is reserved for future collapse support. The parent
 * (AdminLayout or a wrapping client component) owns the collapse state;
 * Sidebar only reacts to it.
 */
interface SidebarProps {
  isCollapsed?: boolean;
}

/**
 * Sidebar
 * ----------------------------------------------------------------------
 * Primary navigation surface for the Axivon Technologies Admin Panel.
 *
 * Renders company branding, the main navigation menu, and a bottom
 * profile/logout section. Navigation items are data-driven and active
 * state is derived from the current pathname.
 * ----------------------------------------------------------------------
 */
export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#151A21] text-white">
      {/* ------------------------------------------------------------
          TOP SECTION — Branding
      ------------------------------------------------------------- */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#2B323D] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C08457] text-sm font-bold text-[#0F1115]">
          AX
        </div>
        {!isCollapsed && (
          <span className="truncate text-sm font-semibold tracking-wide text-white">
            Axivon Technologies
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------
          MIDDLE SECTION — Navigation Menu
      ------------------------------------------------------------- */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-[#1B212A] text-[#C08457]"
                      : "text-[#B7BDC7] hover:bg-[#1B212A] hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-[#C08457]"
                        : "text-[#B7BDC7] group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ------------------------------------------------------------
          BOTTOM SECTION — Profile & Logout
      ------------------------------------------------------------- */}
      <div className="shrink-0 border-t border-[#2B323D] px-3 py-4">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/admin/profile"
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                pathname === "/admin/profile"
                  ? "bg-[#1B212A] text-[#C08457]"
                  : "text-[#B7BDC7] hover:bg-[#1B212A] hover:text-white"
              }`}
            >
              <User
                size={18}
                className={`shrink-0 transition-colors duration-200 ${
                  pathname === "/admin/profile"
                    ? "text-[#C08457]"
                    : "text-[#B7BDC7] group-hover:text-white"
                }`}
              />
              {!isCollapsed && <span className="truncate">Profile</span>}
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#B7BDC7] transition-colors duration-200 hover:bg-[#1B212A] hover:text-white"
            >
              <LogOut
                size={18}
                className="shrink-0 text-[#B7BDC7] transition-colors duration-200 group-hover:text-white"
              />
              {!isCollapsed && <span className="truncate">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}