"use client";

import { useState, useEffect } from "react";
import { ExecutiveSidebar } from "./ExecutiveSidebar";
import { PortalHeader } from "./PortalHeader";

interface ExecutivePortalClientProps {
  userName: string;
  userRole: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function ExecutivePortalClient({
  userName,
  userRole,
  userEmail,
  children,
}: ExecutivePortalClientProps) {
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

      {/* Responsive Executive Sidebar */}
      <ExecutiveSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <PortalHeader
          portalName="Executive Governance"
          roleName={userRole}
          userName={userName}
          userEmail={userEmail}
          notificationHref="/admin/notifications"
          profileHref="/executive/settings"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="Search executive metrics, reports, audit logs (Ctrl+K)..."
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
