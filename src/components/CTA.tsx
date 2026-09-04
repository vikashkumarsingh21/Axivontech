"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Mail, MessageCircle, Rocket, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui";

const WHATSAPP_LINK = "https://wa.me/919473263768";
const CONSULTATION_LINK = "/contact#contact-form";
const EMAIL = "info@axivontech.in";

const TRUST_SIGNALS = [
  { icon: Shield, label: "No-commitment consultation" },
  { icon: Zap, label: "Response within 24 hours" },
  { icon: Clock, label: "Flexible engagement models" },
];

export default function CTA() {
  return (
    <section
      id="contact-cta"
      className="bg-[#0f0f0f] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.07),_transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/assets/images/team-meeting.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1152px"
              priority={false}
              aria-hidden
            />
            {/* Dark overlay so text is readable */}
            <div className="absolute inset-0 bg-[#0f0f0f]/85" />
            {/* Warm amber vignette from right */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,_rgba(232,160,100,0.10),_transparent_60%)]" />
          </div>

          {/* Content */}
          <div className="relative z-10 grid grid-cols-1 gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:p-16 lg:gap-8 items-center">
            {/* Left — text */}
            <div>
              <div className="mb-6 flex">
                <Badge>
                  <Rocket className="h-3.5 w-3.5 text-[#e8a064]" strokeWidth={2} />
                  <span className="ml-1.5">Ready To Start?</span>
                </Badge>
              </div>

              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#f4f4f5] sm:text-4xl lg:text-5xl">
                Let&apos;s build a digital presence that{" "}
                <span className="text-gradient-amber">earns trust.</span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#a1a1aa] sm:text-lg">
                Whether you need a website, mobile app, AI solution, or digital marketing, Axivon
                Technologies helps you move from idea to implementation with clarity.
              </p>

              {/* Trust signals */}
              <ul className="mt-8 space-y-3">
                {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a1f14] border border-[#e8a064]/20">
                      <Icon className="h-3.5 w-3.5 text-[#e8a064]" strokeWidth={2} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — actions */}
            <div className="flex flex-col gap-5">
              <a
                href={CONSULTATION_LINK}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e8a064] px-7 py-4 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_20px_rgba(232,160,100,0.3)] transition-all hover:bg-[#f0b07a] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                <span>Get Free Consultation</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#303030] bg-[#141414]/80 px-7 py-4 text-sm font-semibold text-[#d4d4d4] backdrop-blur-sm transition-all hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                <MessageCircle className="h-4 w-4 text-[#e8a064]" strokeWidth={2} />
                <span>Chat On WhatsApp</span>
              </a>

              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[#71717a]">
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-[#e8a064]"
                >
                  <Mail className="h-4 w-4 text-[#e8a064]" strokeWidth={2} />
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}