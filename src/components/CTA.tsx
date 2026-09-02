"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Mail, MessageCircle, Rocket } from "lucide-react";
import { Badge } from "@/components/ui";

const WHATSAPP_LINK = "https://wa.me/919473263768";
const CONSULTATION_LINK = "/contact#contact-form";
const EMAIL = "info@axivontech.in";

export default function CTA() {
  return (
    <section id="contact-cta" className="bg-[#0f0f0f] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow behind CTA card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.06),_transparent_70%)]"
      />
      
      <div className="mx-auto max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-[2rem] border border-[#262626] bg-[#141414] p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.4)] sm:p-12 lg:p-16"
        >
          <div className="mb-6 flex justify-center">
            <Badge>
              <Rocket className="h-3.5 w-3.5 text-[#e8a064]" strokeWidth={2} />
              <span className="ml-1.5">Ready To Start?</span>
            </Badge>
          </div>

          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-[#f4f4f5] sm:text-4xl">
            Let&apos;s build a digital presence that{" "}
            <span className="text-gradient-amber">earns trust.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#a1a1aa] sm:text-lg">
            Whether you need a website, mobile app, AI solution, digital marketing, or custom software, Axivon Technologies can help you move from idea to implementation with clarity.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={CONSULTATION_LINK}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e8a064] px-6 py-3.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] hover:-translate-y-0.5 sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
            >
              <span>Get Free Consultation</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#303030] bg-[#1c1c1e] px-6 py-3.5 text-sm font-semibold text-[#d4d4d4] transition-all hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] hover:-translate-y-0.5 sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
            >
              <MessageCircle className="h-4 w-4 text-[#e8a064]" strokeWidth={2} />
              <span>Chat On WhatsApp</span>
            </a>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-[#71717a] sm:flex-row sm:gap-6">
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 transition-colors hover:text-[#e8a064]">
              <Mail className="h-4 w-4 text-[#e8a064]" strokeWidth={2} />
              {EMAIL}
            </a>

            <span aria-hidden={true} className="hidden h-1 w-1 rounded-full bg-[#303030] sm:block" />

            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#e8a064]" strokeWidth={2} />
              Response Time: Within 24 Hours
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}