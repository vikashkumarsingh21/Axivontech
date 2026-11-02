"use client";

import React, { Suspense } from "react";
import { UnifiedLeadRegistrationForm } from "@/components/broker/UnifiedLeadRegistrationForm";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerSkeletonCard } from "@/components/broker/BrokerSkeleton";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function BrokerProjectNewPage() {
  return (
    <div className="space-y-6">
      <BrokerPageHeader
        title="Register a New Lead"
        subtitle="Axivon Technologies has unified lead registration. Submit all client opportunities (both early-stage prospects and confirmed requirements) through this single registration system."
        breadcrumbs={[
          { label: "Dashboard", href: "/broker/dashboard" },
          { label: "Projects", href: "/broker/projects" },
          { label: "Register New Lead" },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25">
            <Sparkles className="w-3.5 h-3.5" />
            Unified Lead Registration System
          </span>
        }
        actions={
          <Link
            href="/broker/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#22262D] bg-[#111317] hover:bg-[#171A1F] text-xs font-medium text-[#8B94A1] hover:text-[#E6E8EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
        }
      />

      <div className="p-3.5 rounded-xl bg-[#C2A878]/10 border border-[#C2A878]/25 text-xs text-[#E6E8EB] flex items-center justify-between gap-3">
        <span>
          💡 <strong>Notice:</strong> General Lead and Confirmed Lead workflows are now consolidated into ONE registration system. All business opportunities registered here are assigned to executive review and eligible for commercial project conversion.
        </span>
        <Link href="/broker/leads" className="text-[#C2A878] hover:underline font-semibold shrink-0">
          View My Leads →
        </Link>
      </div>

      <Suspense fallback={<BrokerSkeletonCard />}>
        <UnifiedLeadRegistrationForm />
      </Suspense>
    </div>
  );
}
