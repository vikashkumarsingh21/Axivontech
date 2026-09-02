import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  CheckSquare, 
  FileText, 
  Coffee, 
  Bell, 
  Megaphone, 
  FolderOpen, 
  Settings,
  LogOut
} from "lucide-react";

export function EmployeeSidebar() {
  const navItems = [
    { name: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
    { name: "Attendance", href: "/employee/attendance", icon: CalendarCheck },
    { name: "Tasks", href: "/employee/tasks", icon: CheckSquare },
    { name: "Work Reports", href: "/employee/work-reports", icon: FileText },
    { name: "Leave", href: "/employee/leave", icon: Coffee },
    { name: "Notifications", href: "/employee/notifications", icon: Bell },
    { name: "Announcements", href: "/employee/announcements", icon: Megaphone },
    { name: "Documents", href: "/employee/documents", icon: FolderOpen },
    { name: "Settings", href: "/employee/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 w-64 pt-6">
      <div className="px-6 pb-6 border-b border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight">Axivon Portal</h2>
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
              <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
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
