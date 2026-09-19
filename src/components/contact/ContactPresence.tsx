"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { MapPin, Globe2 } from "lucide-react";

export default function ContactPresence() {
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
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-24 lg:py-32 border-b border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Image Side */}
          <motion.div variants={fadeUp} className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#2a2a2a]">
            <Image
              src="/assets/contact/presence/contact-office-workspace.jpg"
              alt="Modern office workspace representing Axivon's digital presence"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          {/* Content Side */}
          <motion.div variants={fadeUp} className="flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5] mb-6">
              Our Presence
            </h2>
            <p className="text-[#a1a1aa] text-lg leading-relaxed mb-10">
              We operate with a modern, digital-first approach, collaborating with clients across India and globally to deliver exceptional technology solutions.
            </p>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
                  <MapPin className="h-5 w-5 text-[#e8a064]" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f4f4f5]">India Operations</h3>
                  <p className="mt-1 text-sm text-[#a1a1aa] leading-relaxed">
                    Headquartered in Muzaffarpur, Bihar. We support businesses and startups across the country with dedicated engineering teams.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
                  <Globe2 className="h-5 w-5 text-[#e8a064]" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f4f4f5]">Remote & Digital</h3>
                  <p className="mt-1 text-sm text-[#a1a1aa] leading-relaxed">
                    Our digital infrastructure allows us to seamlessly collaborate with clients worldwide, ensuring smooth communication and delivery.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
