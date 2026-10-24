"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { UserCheck, MessageSquare, Clock, Code2 } from "lucide-react";
import { CONTACT_CONFIG, getWhatsAppUrl } from "@/config/contact";
import { trackWhatsAppClick } from "@/lib/analytics";

interface TrustPillar {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  href?: string;
  isExternal?: boolean;
}

const TRUST_PILLARS: TrustPillar[] = [
  {
    icon: UserCheck,
    title: "Founder-Led Engineering",
    description: "Every architecture and project specification is directly led and reviewed by founder Vikash Kumar.",
    badge: "Direct Oversight",
  },
  {
    icon: MessageSquare,
    title: "Direct WhatsApp Channel",
    description: "Connect directly with our engineering team via WhatsApp for responsive project consultation.",
    badge: CONTACT_CONFIG.phoneDisplay,
    href: getWhatsAppUrl("Hi Axivon, I would like to consult on a project."),
    isExternal: true,
  },
  {
    icon: Clock,
    title: "24-Hour Guaranteed Response",
    description: "Submit a project inquiry and receive a detailed, written technical evaluation within 24 business hours.",
    badge: "Response SLA",
  },
  {
    icon: Code2,
    title: "Modern Production Stack",
    description: "Rigorous type safety and modular components using Next.js, TypeScript, React, and Tailwind CSS.",
    badge: "Type-Safe Focus",
  },
];

export default function HomeTrustStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Trust and Engineering Standards"
      className="relative z-20 border-y border-[#1e1e24] bg-[#0c0c0e] py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8a064]">
              Authentic Standards
            </span>
            <h2 className="mt-1 font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F3F5F7]">
              Why Teams Build With Axivon Technologies
            </h2>
          </div>
          <span className="text-xs text-[#7E8997]">
            Grounded commitments &middot; Zero unverified claims
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            const content = (
              <motion.div
                key={pillar.title}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className={`group relative flex h-full flex-col justify-between rounded-xl border border-[#1f242c] bg-[#12161c]/80 p-5 backdrop-blur-sm transition-all duration-200 hover:border-[#e8a064]/40 hover:bg-[#161b23] ${
                  pillar.href ? "cursor-pointer" : ""
                }`}
              >
                <div>
                  <div className="mb-3.5 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a323d] bg-[#1a202a] text-[#e8a064] transition-colors group-hover:border-[#e8a064]/50 group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    {pillar.badge && (
                      <span className="rounded-md border border-[#262c36] bg-[#161a22] px-2 py-0.5 text-[10px] font-mono font-medium text-[#A7B0BC] group-hover:border-[#e8a064]/30 group-hover:text-[#e8a064] transition-colors">
                        {pillar.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-[#F3F5F7] tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A7B0BC] font-light">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );

            if (pillar.href) {
              return (
                <a
                  key={pillar.title}
                  href={pillar.href}
                  target={pillar.isExternal ? "_blank" : undefined}
                  rel={pillar.isExternal ? "noopener noreferrer" : undefined}
                  onClick={() => trackWhatsAppClick("home_trust_strip")}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50 rounded-xl"
                  aria-label={`${pillar.title} - ${pillar.badge || "Contact"}`}
                >
                  {content}
                </a>
              );
            }

            return <div key={pillar.title}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
