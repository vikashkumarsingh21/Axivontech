import type { ComponentType } from "react";

export type MobileRole = "EMPLOYEE" | "BROKER" | "CLIENT" | "EXECUTIVE" | "ADMIN";

export interface MobileTabItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export interface MobileMoreItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

export interface RoleNavigationConfig {
  role: MobileRole;
  rootPath: string;
  tabs: MobileTabItem[];
  moreItems: MobileMoreItem[];
}
