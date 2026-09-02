"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, MessageCircle, Mail, Phone, MapPin, type LucideIcon } from "lucide-react";

interface ContactItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const CONTACT_ITEMS: ContactItem[] = [
  {
    icon: Mail,
    label: "Email",
    value: "info@axivontech.in",
    href: "mailto:info@axivontech.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 943263768",
    href: "tel:+91943263768",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Muzaffarpur, Bihar, India",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, x: 16 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.65, ease: "easeOut", delay: 0.2 },
  },
};

export default function ContactHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0f0f0f] pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[#e8a064]/25 blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 35, 0], y: [0, 25, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#c9922a]/25 blur-[140px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-[#d4915c]/15 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left: heading and content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.span
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141414]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4915c] backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#d4915c]"
                  animate={shouldReduceMotion ? undefined : { scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4915c]" />
              </span>
              Contact Us
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Let&apos;s Build Something{" "}
              <span className="bg-gradient-to-r from-[#e8a064] via-[#c9922a] to-[#d4915c] bg-clip-text text-transparent">
                Amazing
              </span>{" "}
              Together
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Have a project idea, startup, business website, mobile app, AI
              solution, or digital marketing requirement? Our team is ready
              to help.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <motion.a
                href="/contact#consultation"
                aria-label="Get a free consultation"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e8a064] via-[#c9922a] to-[#d4915c] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_10px_30px_-8px_rgba(201,146,42,0.7)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_14px_40px_-6px_rgba(212,145,92,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4915c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] sm:w-auto"
              >
                Get Free Consultation
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.a>

              <motion.a
                href="https://wa.me/91943263768"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-[#141414]/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-[#141414]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 text-[#d4915c]" />
                Chat on WhatsApp
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right: contact info card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="relative"
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#e8a064] via-[#c9922a] to-[#d4915c] opacity-30 blur-xl" />

            <div className="relative rounded-3xl border border-white/10 bg-[#141414]/[0.04] p-8 backdrop-blur-2xl sm:p-10">
              <h2 className="mb-8 text-lg font-semibold text-white">
                Contact Information
              </h2>

              <ul className="flex flex-col gap-7">
                {CONTACT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8a064]/20 via-[#c9922a]/20 to-[#d4915c]/20 ring-1 ring-white/10">
                        <Icon className="h-5 w-5 text-[#d4915c]" strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="mt-1 inline-block text-base font-medium text-white transition-colors duration-300 hover:text-[#d4915c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4915c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] rounded-sm"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-1 text-base font-medium text-white">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}