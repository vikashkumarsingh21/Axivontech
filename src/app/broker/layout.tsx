"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrokerPortalSidebar } from "@/components/broker/BrokerPortalSidebar";
import { BrokerPortalHeader } from "@/components/broker/BrokerPortalHeader";
import { BrokerMobileBottomNav } from "@/components/broker/BrokerMobileBottomNav";
import { PortalAIAssistant } from "@/components/portal-ai/PortalAIAssistant";

interface BrokerProfileState {
  name: string;
  email: string;
  partnerId?: string;
  referralCode?: string;
  onboardingCompleted?: boolean;
}

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [brokerInfo, setBrokerInfo] = useState<BrokerProfileState>({
    name: "Partner",
    email: "",
  });

  const checkProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/broker/profile");
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const json = await res.json();
        const profile = json.data?.profile;
        const brokerProfile = profile?.brokerProfile;
        const referralCode = brokerProfile?.referralCode;
        const isCompleted = profile?.onboarding?.isCompleted;

        setBrokerInfo({
          name: profile?.name || "Partner",
          email: profile?.email || "",
          partnerId: brokerProfile?.partnerId,
          referralCode,
          onboardingCompleted: isCompleted,
        });

        // Compute uncompleted onboarding steps as pending action badge
        if (profile?.onboarding?.checklist) {
          const checklist = profile.onboarding.checklist;
          const uncompleted = Object.values(checklist).filter((v) => !v).length;
          setPendingActionsCount(uncompleted);
        }

        // Onboarding gate logic:
        // Pages that remain accessible regardless of onboarding state
        const openPages = [
          "/broker/onboarding",
          "/broker/profile",
          "/broker/support",
          "/broker/notifications",
        ];
        const isCurrentPageOpen = openPages.some((p) => pathname === p || pathname?.startsWith(`${p}/`));

        if (!referralCode && !isCurrentPageOpen) {
          router.push("/broker/onboarding");
        } else if (referralCode && isCompleted && pathname === "/broker/onboarding") {
          // If onboarding is completely finished, redirect from onboarding to dashboard
          router.push("/broker/dashboard");
        }
      }
    } catch (error) {
      console.error("Broker profile check error:", error);
    } finally {
      setIsChecking(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  // Loading shimmer placeholder (avoids infinite circular spinner)
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center p-6 select-none">
        <div className="w-full max-w-sm rounded-xl border border-[#22262D] bg-[#111317] p-6 text-center space-y-4 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-[#171A1F] mx-auto border border-[#22262D]" />
          <div className="h-4 w-32 bg-[#171A1F] rounded mx-auto" />
          <div className="h-2.5 w-48 bg-[#171A1F] rounded mx-auto" />
        </div>
      </div>
    );
  }

  // Full-width view for onboarding flow
  if (pathname === "/broker/onboarding") {
    return (
      <div className="min-h-screen bg-[#0A0B0D] text-[#E6E8EB]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0B0D] overflow-hidden text-[#E6E8EB] font-sans antialiased">
      {/* Redesigned Grouped Collapsible Sidebar */}
      <BrokerPortalSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        pendingActionsCount={pendingActionsCount}
      />

      {/* Main Column */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Redesigned Header */}
        <BrokerPortalHeader
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
          brokerName={brokerInfo.name}
          brokerEmail={brokerInfo.email}
          partnerId={brokerInfo.partnerId}
          referralCode={brokerInfo.referralCode}
        />

        {/* Content Viewport with mobile bottom bar offset */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (lg:hidden) */}
      <BrokerMobileBottomNav onOpenMenu={() => setMobileSidebarOpen(true)} />

      {/* AI Assistant Widget Placement */}
      <PortalAIAssistant portalRole="BROKER" />
    </div>
  );
}
