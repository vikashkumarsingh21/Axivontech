"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrokerSidebar } from "@/components/portal/BrokerSidebar";

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

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
          const referralCode = data.data.profile.brokerProfile?.referralCode;
          
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

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If onboarding, don't show sidebar
  if (pathname === "/broker/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-gray-200">
      <BrokerSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
