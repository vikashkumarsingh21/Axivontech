"use client";

import { motion } from "framer-motion";
import { ArrowDown, LayoutGrid } from "lucide-react";
import Image from "next/image";

export default function IndustriesHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#0f0f0f] pt-24 pb-16">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/agency/team-collaboration.jpg"
          alt="Axivon Technologies collaborating across industries"
          fill
          className="object-cover object-center opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
        >
          <LayoutGrid className="w-4 h-4 text-[#e8a064]" />
          <span className="text-xs font-semibold tracking-widest text-[#e8a064] uppercase">Domain Expertise</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]"
        >
          Building Digital Engines For{" "}
          <span className="bg-gradient-to-r from-[#e8a064] via-[#d4915c] to-[#c9922a] bg-clip-text text-transparent">
            Every Sector
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed"
        >
          We engineer scalable, secure, and modern digital platforms tailored to the exact requirements of your industry — from EdTech and Healthcare to E-Commerce and Enterprise.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="#industries"
            className="flex flex-col items-center gap-3 text-[#71717a] hover:text-[#e8a064] transition-colors"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-medium">Explore Industries</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
