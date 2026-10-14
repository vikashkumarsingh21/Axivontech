import type { Metadata } from "next";
import { LeadPilotProvider } from "@/context/LeadPilotContext";
import LeadPilotDemoStrip from "@/components/demo-projects/leadpilot/LeadPilotDemoStrip";
import LeadPilotShell from "@/components/demo-projects/leadpilot/LeadPilotShell";

export const metadata: Metadata = {
  title: "LeadPilot — Premium CRM & Sales Pipeline Dashboard Demo | Axivon Technologies",
  description:
    "Explore LeadPilot, a modern B2B CRM and sales management dashboard demonstration crafted by Axivon Technologies. Features lead tracking, deal pipelines, contact management, task workflows, and activity reporting.",
  keywords: [
    "LeadPilot",
    "CRM Dashboard",
    "Sales Pipeline",
    "Axivon Technologies",
    "B2B SaaS Demo",
    "Lead Management",
    "Sales Management Software",
  ],
  openGraph: {
    title: "LeadPilot — Premium CRM & Sales Dashboard Demo | Axivon Technologies",
    description:
      "Enterprise sales CRM showcase engineered by Axivon Technologies with interactive lead pipeline, contact directories, and sales reporting.",
    url: "https://axivontech.in/demo-projects/saas/leadpilot",
    siteName: "Axivon Technologies",
    type: "website",
  },
};

export default function LeadPilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LeadPilotProvider>
      <div className="leadpilot-theme min-h-screen flex flex-col bg-[#F6F7F4] text-[#252925] font-sans antialiased selection:bg-[#E5F0EB] selection:text-[#2F806A]">
        {/* 1. Axivon Demo Showcase Strip */}
        <LeadPilotDemoStrip />

        {/* 2. Main Application Shell with Sidebar and Header */}
        <LeadPilotShell>{children}</LeadPilotShell>
      </div>
    </LeadPilotProvider>
  );
}
