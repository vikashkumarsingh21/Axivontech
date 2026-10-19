"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { PortalHeader } from "./PortalHeader";
import { PortalAIAssistant } from "@/components/portal-ai/PortalAIAssistant";

interface AdminPortalClientProps {
  userName: string;
  userRole: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function AdminPortalClient({
  userName,
  userRole,
  userEmail,
  children,
}: AdminPortalClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0D10] text-[#F3F5F7]">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Admin Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <PortalHeader
          portalName="Axivon Control Center"
          roleName={userRole}
          userName={userName}
          userEmail={userEmail}
          notificationHref="/admin/notifications"
          profileHref="/admin/settings"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="Search leads, employees, settings (Ctrl+K)..."
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {children}
          </div>
        </main>
      </div>
      <PortalAIAssistant portalRole="ADMIN" />
    </div>
  );
}
