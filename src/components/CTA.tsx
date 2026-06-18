"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function CTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Large floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#2563EB]/25 blur-[140px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute right-0 bottom-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/4 rounded-full bg-[#7C3AED]/25 blur-[140px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute left-0 bottom-0 h-[26rem] w-[26rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#00D4FF]/15 blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
        <div className="relative">
          {/* Pulsing gradient border glow */}
          <motion.div
            aria-hidden
            className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] blur-2xl"
            animate={shouldReduceMotion ? { opacity: 0.5 } : { opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Glass card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-16 text-center backdrop-blur-2xl sm:px-14 sm:py-20"
          >
            <motion.span
              variants={itemVariants}
              className="mb-6 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#00D4FF]"
            >
              Future-Ready Technology For Modern Businesses
            </motion.span>

            <motion.h2
              variants={itemVariants}
              className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Ready To{" "}
              <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Business?
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Let&apos;s discuss your project and build something amazing
              together with cutting-edge technology solutions.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.a
                href="/contact"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_10px_30px_-8px_rgba(124,58,237,0.7)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_14px_40px_-6px_rgba(0,212,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:w-auto"
              >
                Book Free Consultation
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.a>

              <motion.a
                href="/contact"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:w-auto"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}