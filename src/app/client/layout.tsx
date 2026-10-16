"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ClientSidebar } from "@/components/portal/ClientSidebar";
import { PortalHeader } from "@/components/portal/PortalHeader";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientUser, setClientUser] = useState<{ name: string; email: string }>({
    name: "Client Partner",
    email: "",
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/v1/client/me");
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setClientUser({
              name: json.data.name || "Client Partner",
              email: json.data.email || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading client session:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [pathname, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B0D10] overflow-hidden text-[#F3F5F7]">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Client Sidebar */}
      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <PortalHeader
          portalName="Client Workspace"
          roleName="Client"
          userName={clientUser.name}
          userEmail={clientUser.email}
          notificationHref="/client/notifications"
          profileHref="/client/profile"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="Search projects, deliverables, documents..."
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
