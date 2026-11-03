import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Coffee,
  Users,
  Briefcase,
  Coins,
  FileText,
  CreditCard,
  CheckCircle2,
  BarChart3,
  Settings,
  HelpCircle,
  FolderOpen,
  Calendar,
  Megaphone,
  UserCheck,
  Download,
  Bell,
  Smartphone,
} from "lucide-react";
import type { MobileRole, RoleNavigationConfig } from "./types";

export const ROLE_CONFIGS: Record<MobileRole, RoleNavigationConfig> = {
  EMPLOYEE: {
    role: "EMPLOYEE",
    rootPath: "/employee/dashboard",
    tabs: [
      { id: "home", label: "Home", href: "/employee/dashboard", icon: LayoutDashboard },
      { id: "attendance", label: "Attendance", href: "/employee/attendance", icon: CalendarCheck },
      { id: "tasks", label: "Tasks", href: "/employee/tasks", icon: CheckSquare },
      { id: "leave", label: "Leave", href: "/employee/leave", icon: Coffee },
    ],
    moreItems: [
      { id: "work-reports", label: "Work Reports", href: "/employee/work-reports", icon: FileText, description: "Daily EOD task submissions" },
      { id: "announcements", label: "Announcements", href: "/employee/announcements", icon: Megaphone, description: "Company notices and updates" },
      { id: "calendar", label: "Company Calendar", href: "/employee/calendar", icon: Calendar, description: "Holidays and team events" },
      { id: "documents", label: "My Documents", href: "/employee/documents", icon: FolderOpen, description: "Policies, letters, and forms" },
      { id: "projects", label: "Projects", href: "/employee/projects", icon: Briefcase, description: "Active project allocations" },
      { id: "profile", label: "My Profile", href: "/employee/profile", icon: Users, description: "Personal details and credentials" },
      { id: "settings", label: "Settings", href: "/employee/settings", icon: Settings, description: "Notification and security settings" },
      { id: "support", label: "Help & Support", href: "/employee/support", icon: HelpCircle, description: "Submit internal tickets" },
    ],
  },
  BROKER: {
    role: "BROKER",
    rootPath: "/broker/dashboard",
    tabs: [
      { id: "home", label: "Home", href: "/broker/dashboard", icon: LayoutDashboard },
      { id: "leads", label: "Leads", href: "/broker/leads", icon: Users },
      { id: "projects", label: "Projects", href: "/broker/projects", icon: Briefcase },
      { id: "earnings", label: "Earnings", href: "/broker/commissions", icon: Coins },
    ],
    moreItems: [
      { id: "documents", label: "Documents", href: "/broker/documents", icon: FolderOpen, description: "Contracts and partnership agreements" },
      { id: "notifications", label: "Notifications", href: "/broker/notifications", icon: Bell, description: "Lead status updates and payouts" },
      { id: "profile", label: "Partner Profile", href: "/broker/profile", icon: Users, description: "Bank details and KYC" },
    ],
  },
  CLIENT: {
    role: "CLIENT",
    rootPath: "/client/dashboard",
    tabs: [
      { id: "home", label: "Home", href: "/client/dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", href: "/client/projects", icon: Briefcase },
      { id: "documents", label: "Documents", href: "/client/documents", icon: FileText },
      { id: "invoices", label: "Invoices", href: "/client/invoices", icon: CreditCard },
    ],
    moreItems: [
      { id: "support", label: "Support & Tickets", href: "/client/support", icon: HelpCircle, description: "Contact project team" },
      { id: "profile", label: "Account Profile", href: "/client/profile", icon: Users, description: "Company information" },
    ],
  },
  EXECUTIVE: {
    role: "EXECUTIVE",
    rootPath: "/executive/dashboard",
    tabs: [
      { id: "home", label: "Home", href: "/executive/dashboard", icon: LayoutDashboard },
      { id: "approvals", label: "Approvals", href: "/executive/approvals", icon: CheckCircle2 },
      { id: "people", label: "People", href: "/executive/people", icon: UserCheck },
      { id: "reports", label: "Reports", href: "/executive/reports", icon: BarChart3 },
    ],
    moreItems: [
      { id: "settings", label: "Organization Settings", href: "/executive/settings", icon: Settings, description: "Company parameters" },
      { id: "profile", label: "Executive Profile", href: "/executive/profile", icon: Users, description: "Credentials & security" },
    ],
  },
  ADMIN: {
    role: "ADMIN",
    rootPath: "/admin/dashboard",
    tabs: [
      { id: "home", label: "Home", href: "/admin/dashboard", icon: LayoutDashboard },
      { id: "approvals", label: "Approvals", href: "/admin/approvals", icon: CheckCircle2 },
      { id: "people", label: "People", href: "/admin/employees", icon: Users },
      { id: "crm", label: "CRM", href: "/admin/leads", icon: Briefcase },
    ],
    moreItems: [
      { id: "attendance", label: "Attendance Manager", href: "/admin/attendance", icon: CalendarCheck, description: "Track daily logs & regularization" },
      { id: "tasks", label: "Task Board", href: "/admin/tasks", icon: CheckSquare, description: "Task delegation and tracking" },
      { id: "projects", label: "Project Portfolio", href: "/admin/projects", icon: Briefcase, description: "Active milestones & delivery" },
      { id: "export", label: "Export Center", href: "/admin/export", icon: Download, description: "CSV and Excel data downloads" },
      { id: "app-settings", label: "Mobile App Settings", href: "/admin/settings/app", icon: Smartphone, description: "Releases, APKs & app-mode toggles" },
      { id: "notifications", label: "Notifications", href: "/admin/notifications", icon: Bell, description: "System alerts and logs" },
    ],
  },
};
