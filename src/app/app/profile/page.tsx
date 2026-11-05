"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/mobile/MobileShell";
import { MobileProfileSettings } from "@/components/mobile/MobileProfileSettings";
import { Loader2 } from "lucide-react";
import type { MobileRole } from "@/components/mobile/types";

export default function MobileAppProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.replace("/app/login");
        }
      })
      .catch(() => {
        router.replace("/app/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const role: MobileRole =
    user.role === "ADMIN"
      ? "ADMIN"
      : user.role === "FOUNDER" || user.role === "CO_FOUNDER"
      ? "EXECUTIVE"
      : user.role === "BROKER" || user.role === "BUSINESS_PARTNER"
      ? "BROKER"
      : user.role === "MANAGER" || user.role === "DEPARTMENT_MANAGER"
      ? "DEPARTMENT_MANAGER"
      : user.role === "CLIENT"
      ? "CLIENT"
      : "EMPLOYEE";

  return (
    <MobileShell role={role} userName={user.name}>
      <MobileProfileSettings user={user} />
    </MobileShell>
  );
}
