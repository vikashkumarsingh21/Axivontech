// src/components/demo-projects/leadpilot/LeadPilotShell.tsx
"use client";

import React, { useState } from "react";
import LeadPilotSidebar from "./LeadPilotSidebar";
import LeadPilotHeader from "./LeadPilotHeader";
import LeadPilotModals from "./LeadPilotModals";

export default function LeadPilotShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState<"lead" | "contact" | "deal" | "task" | null>(null);

  return (
    <div className="flex min-h-screen bg-[#F6F7F4] text-[#252925] antialiased">
      {/* 1. Sidebar */}
      <LeadPilotSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <LeadPilotHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickAdd={(type) => setModalType(type)}
        />

        {/* Dynamic Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>

      {/* 3. Global Quick Add Modals */}
      <LeadPilotModals
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
}
