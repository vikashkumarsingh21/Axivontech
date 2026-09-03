import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, Users, CalendarCheck, Briefcase, 
  CheckSquare, FileText, Coffee, Bell, Megaphone, 
  FolderOpen, Activity, Settings, LogOut
} from "lucide-react";

export function AdminSidebar() {
  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Employees", href: "/admin/employees", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { name: "Work Reports", href: "/admin/work-reports", icon: FileText },
    { name: "Leave", href: "/admin/leave", icon: Coffee },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Documents", href: "/admin/documents", icon: FolderOpen },
    { name: "Activity", href: "/admin/activity", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 w-64 pt-6">
      <div className="px-6 pb-6 border-b border-white/5">
        <Image src="/assets/logo/logo-full.png" alt="Axivon Technologies" width={160} height={40} className="h-8 w-auto brightness-0 invert" priority />
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-2 block">Admin Panel</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <form action="/api/v1/auth/logout" method="POST">
          <button 
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </form>
      </div>
    </div>
  );
}
