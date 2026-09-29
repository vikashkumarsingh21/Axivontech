import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply - AXIVON Business Partner Program",
  description: "Apply to join the AXIVON Business Partner Program.",
};

import PartnerApplicationForm from "@/components/partner-application/PartnerApplicationForm";

export default function BusinessPartnerApplyPage() {
  return (
    <main className="bg-[#0a0a0a] text-white selection:bg-[#e8a064] selection:text-[#0a0a0a] min-h-screen font-sans flex flex-col items-center justify-center p-6 py-20">
      
      <div className="max-w-3xl w-full border border-white/10 bg-[#0e0e0e] rounded-sm p-6 md:p-10 shadow-2xl">
        <Link href="/business-partner" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Program
        </Link>
        
        <h1 className="text-3xl font-semibold mb-2 text-white">Business Partner Application</h1>
        <p className="text-gray-400 mb-8 font-light text-sm">
          Please fill out the following sections accurately. All applications are subject to AXIVON review.
        </p>

        <PartnerApplicationForm />
      </div>
      
    </main>
  );
}
