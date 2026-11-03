"use client";

import { useState, useEffect } from "react";
import { EmployeeSidebar } from "./EmployeeSidebar";
import { EmployeeNavbar } from "./EmployeeNavbar";
import { PortalAIAssistant } from "@/components/portal-ai/PortalAIAssistant";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useAppMode } from "@/features/app-mode/useAppMode";

interface EmployeePortalClientProps {
  children: React.ReactNode;
}

export function EmployeePortalClient({ children }: EmployeePortalClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAppMode } = useAppMode();
  const [userName, setUserName] = useState("Employee");
  const [userEmail, setUserEmail] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/v1/employee/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
        if (data?.user?.email) setUserEmail(data.user.email);
      })
      .catch(() => {});

    fetch("/api/v1/employee/notifications?unreadOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data?.total) setUnread(data.total);
      })
      .catch(() => {});
  }, []);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // App-Mode dedicated Mobile Shell
  if (isAppMode) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#EDEBE6]">
        <MobileShell
          role="EMPLOYEE"
          userName={userName}
          userEmail={userEmail}
          unreadCount={unread}
        >
          {children}
        </MobileShell>
        <PortalAIAssistant portalRole="EMPLOYEE" />
      </div>
    );
  }

  // Desktop / Standard Browser layout remains 100% untouched
  return (
    <div className="flex h-screen overflow-hidden bg-[#121212] text-[#EDEBE6] antialiased">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <EmployeeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <EmployeeNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 pt-8 pb-28 sm:pb-32">
          <div className="max-w-7xl mx-auto space-y-8 min-w-0">
            {children}
          </div>
        </main>
      </div>
      <PortalAIAssistant portalRole="EMPLOYEE" />
    </div>
  );
}
