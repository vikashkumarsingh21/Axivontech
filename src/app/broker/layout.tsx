"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrokerSidebar } from "@/components/portal/BrokerSidebar";
import { PortalHeader } from "@/components/portal/PortalHeader";

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brokerInfo, setBrokerInfo] = useState<{ name: string; email: string; referralCode?: string }>({
    name: "Partner",
    email: "",
  });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/v1/broker/profile");
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const profile = data.data?.profile;
          const referralCode = profile?.brokerProfile?.referralCode;

          setBrokerInfo({
            name: profile?.name || "Partner",
            email: profile?.email || "",
            referralCode,
          });
          
          if (!referralCode && pathname !== "/broker/onboarding") {
            router.push("/broker/onboarding");
          } else if (referralCode && pathname === "/broker/onboarding") {
            router.push("/broker/dashboard");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsChecking(false);
      }
    };
    checkProfile();
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

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If onboarding, don't show sidebar
  if (pathname === "/broker/onboarding") {
    return <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7]">{children}</div>;
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

      {/* Responsive Sidebar */}
      <BrokerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <PortalHeader
          portalName="Partner Network"
          roleName={brokerInfo.referralCode ? `Partner · ${brokerInfo.referralCode}` : "Partner"}
          userName={brokerInfo.name}
          userEmail={brokerInfo.email}
          notificationHref="/broker/notifications"
          profileHref="/broker/profile"
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="Search leads, projects, commissions..."
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
