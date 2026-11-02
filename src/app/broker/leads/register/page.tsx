"use client";

import React, { Suspense } from "react";
import { UnifiedLeadRegistrationForm } from "@/components/broker/UnifiedLeadRegistrationForm";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerSkeletonCard } from "@/components/broker/BrokerSkeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BrokerRegisterLeadPage() {
  return (
    <div className="space-y-6">
      <BrokerPageHeader
        title="Register a New Lead"
        subtitle="Submit a prospective client or confirmed opportunity directly to Axivon Technologies."
        breadcrumbs={[
          { label: "Dashboard", href: "/broker/dashboard" },
          { label: "My Leads", href: "/broker/leads" },
          { label: "Register New Lead" },
        ]}
        actions={
          <Link
            href="/broker/leads"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#22262D] bg-[#111317] hover:bg-[#171A1F] text-xs font-medium text-[#8B94A1] hover:text-[#E6E8EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Leads</span>
          </Link>
        }
      />

      <Suspense fallback={<BrokerSkeletonCard />}>
        <UnifiedLeadRegistrationForm />
      </Suspense>
    </div>
  );
}
