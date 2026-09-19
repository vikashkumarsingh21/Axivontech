"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ContactCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } 
    },
  };

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="relative rounded-3xl overflow-hidden border border-[#2a2a2a] bg-[#141414]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/contact/cta/contact-client-discussion.jpg"
              alt="Professional client discussion and project planning"
              fill
              className="object-cover object-center opacity-30"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/90 to-[#0f0f0f]/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-10 sm:p-16 lg:p-20 max-w-2xl">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#f4f4f5]">
              Have an idea?<br />
              <span className="text-[#e8a064]">Let's talk.</span>
            </motion.h2>
            
            <motion.p variants={fadeUp} className="mt-6 text-lg text-[#a1a1aa] leading-relaxed">
              Tell us what you're trying to build, improve, or automate. Our engineering team is ready to help you turn your vision into a reality.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10">
              <Link 
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-8 py-4 text-sm font-semibold text-[#0f0f0f] transition-colors hover:bg-[#f0b07a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
              >
                Start a Conversation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
