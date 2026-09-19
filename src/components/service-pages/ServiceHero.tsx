"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ServiceData } from "@/data/services";

export default function ServiceHero({ service }: { service: ServiceData }) {
  // Map standard services to their images. Use a default if missing.
  const imageUrl = `/assets/images/services/${service.slug}.jpg`;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const whatsappHref = `https://wa.me/919473263768?text=${encodeURIComponent(
    `Hi Axivon Technologies, I'm interested in your ${service.title} services.`
  )}`;

  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-[#0f0f0f] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={service.title}
          fill
          className="object-cover object-center opacity-30"
          priority
          quality={90}
          onError={(e) => {
            // Fallback to the main office hero if specific image is missing
            (e.target as HTMLImageElement).src = "/assets/images/services/services-hero-office.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[#e8a064]/30 bg-[#e8a064]/10 px-3 py-1 text-sm font-medium text-[#e8a064]">
                <span className="mr-2 h-2 w-2 rounded-full bg-[#e8a064] animate-pulse" />
                {service.badge}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]"
            >
              {service.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
            >
              {service.heroDescription}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/contact"
                className="group flex items-center justify-center gap-2 rounded-xl bg-[#e8a064] px-6 py-3.5 text-sm font-semibold text-[#0f0f0f] transition-all hover:bg-[#d4915c]"
              >
                Get Free Consultation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                WhatsApp Chat
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}