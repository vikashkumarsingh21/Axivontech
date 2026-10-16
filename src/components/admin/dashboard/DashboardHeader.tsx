"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardHeader() {
  const [greeting, setGreeting] = useState("Good Morning");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[#29313B] bg-[#151A21] p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold w-fit">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Executive Overview</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F3F5F7]">
          {greeting}, Administrator
        </h1>
        <p className="text-sm text-[#7E8997]">
          Welcome back to the Axivon Technologies Control Center.
        </p>
        {currentDate && (
          <span className="text-xs font-medium text-[#566171]">{currentDate}</span>
        )}
      </div>

      <div className="flex shrink-0">
        <Link href="/admin/crm/pipeline">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            <span>New Deal</span>
          </Button>
        </Link>
      </div>
    </section>
  );
}
