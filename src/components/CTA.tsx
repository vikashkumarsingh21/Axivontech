"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Mail, MessageCircle, Rocket } from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/919473263768";
const CONSULTATION_LINK = "/contact#contact-form";
const EMAIL = "info@axivontech.in";

export default function CTA() {
  return (
    <section
      id="contact-cta"
      className="relative w-full overflow-hidden bg-[#050816] px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      {/* Floating gradient blobs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-52 top-0 h-[520px] w-[520px] rounded-full bg-[#2563EB]/25 blur-[140px]"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 top-10 h-[460px] w-[460px] rounded-full bg-[#7C3AED]/25 blur-[140px]"
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-200px] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#00D4FF]/20 blur-[150px]"
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl"
      >
        {/* Pulsing glow */}
        <motion.div
          aria-hidden="true"
          className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] blur-2xl sm:rounded-[2.5rem]"
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Crisp gradient border line */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-70 sm:rounded-[2.5rem]"
        />

        {/* Glass card body */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0F24]/90 px-6 py-14 text-center shadow-[0_0_80px_-15px_rgba(124,58,237,0.5)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-20">
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00D4FF] backdrop-blur-md">
            <Rocket className="h-3.5 w-3.5" strokeWidth={2.5} />
            Ready To Start?
          </span>

          {/* Heading */}
          <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Let&apos;s Build Something{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Amazing
            </span>{" "}
            Together
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Whether you need a website, mobile app, AI solution, digital
            marketing, or custom software, Axivon Technologies is ready to
            help your business grow.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a
              href={CONSULTATION_LINK}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_30px_-8px_rgba(37,99,235,0.8)] transition-shadow duration-300 hover:shadow-[0_0_45px_-6px_rgba(124,58,237,0.9)] sm:w-auto"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">Get Free Consultation</span>
              <ArrowRight
                className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </motion.a>

            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-slate-200 backdrop-blur-md transition-colors duration-300 hover:border-[#00D4FF]/50 hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <MessageCircle
                className="h-4 w-4 text-[#00D4FF] transition-transform duration-300 group-hover:scale-110"
                strokeWidth={2.5}
              />
              <span>Chat On WhatsApp</span>
            </motion.a>
          </div>

          {/* Contact info row */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 text-sm text-slate-400 sm:flex-row sm:gap-6">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 transition-colors duration-300 hover:text-[#00D4FF]"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              {EMAIL}
            </a>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block"
            />

            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" strokeWidth={2} />
              Response Time: Within 24 Hours
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}