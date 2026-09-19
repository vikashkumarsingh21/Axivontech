"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-bold tracking-tight text-[#f4f4f5]">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
        {label}
      </span>
    </div>
  );
}

// Logical sequence of 4 videos (Video 2 and 3 use the same source file)
const HERO_VIDEOS = [
  { id: "video-1", src: "/assets/home/hero/videos/axivon-home-hero-01-team.mp4" },
  { id: "video-2", src: "/assets/home/hero/videos/axivon-home-hero-02-collaboration.mp4" },
  { id: "video-3", src: "/assets/home/hero/videos/axivon-home-hero-02-collaboration.mp4" },
  { id: "video-4", src: "/assets/home/hero/videos/axivon-home-hero-04-coding.mp4" }
];

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % HERO_VIDEOS.length);
  };

  useEffect(() => {
    if (shouldReduceMotion) return;
    const video = videoRef.current;
    if (video && isClient) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [currentVideoIndex, shouldReduceMotion, isClient]);

  return (
    <section className="relative flex min-h-[90vh] lg:min-h-screen w-full items-center overflow-hidden bg-[#0f0f0f] py-20 lg:py-0">
      {/* Fallback / Video Background Layer */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[#0a0a0a]">
        {isClient && !shouldReduceMotion ? (
          <video
            ref={videoRef}
            src={HERO_VIDEOS[currentVideoIndex].src}
            poster="/assets/video/hero-poster.jpg"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          />
        ) : (
          <Image
            src="/assets/video/hero-poster.jpg"
            alt="Software developers engineering applications at Axivon Technologies"
            fill
            priority
            className="object-cover object-center"
          />
        )}
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-[#0f0f0f] via-black/40 to-black/60" />
      </div>

      {/* Main Content Layer */}
      <div className="container relative z-10 mx-auto px-6 lg:px-12 pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto text-center lg:mx-0 lg:text-left flex flex-col items-center lg:items-start">
          
          <motion.div
            variants={container}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="show"
            className="flex flex-col items-center lg:items-start"
          >
            {/* Eyebrow */}
            <motion.div variants={item}>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[#e8a064]" />
                Technology &amp; Digital Agency &mdash; India
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="max-w-3xl text-[2.4rem] font-bold leading-[1.08] tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-[4rem]"
            >
              We build digital products that{" "}
              <span className="text-[#e8a064]">
                move businesses forward.
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg lg:text-xl font-light"
            >
              Axivon Technologies designs and engineers high-performance websites,
              mobile apps, AI systems, and custom software for startups, healthcare teams,
              educational platforms, and ambitious businesses.
            </motion.p>

            {/* Primary & Secondary Action CTAs */}
            <motion.div
              variants={item}
              className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-8 py-4 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_20px_rgba(232,160,100,0.30)] transition-all hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                <span>Start a Project</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                <span>View Selected Work</span>
              </Link>
            </motion.div>

            {/* Capability Badges */}
            <motion.div
              variants={item}
              className="mt-12 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              {[
                "Web Architecture",
                "Mobile Systems",
                "AI Automation",
                "UI/UX Design",
                "Technical SEO",
              ].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-full border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-2 text-xs font-medium text-gray-300"
                >
                  {pill}
                </span>
              ))}
            </motion.div>

            {/* Verified Operational Metrics */}
            <motion.div
              variants={item}
              className="mt-12 flex flex-wrap items-center justify-center gap-7 border-t border-white/10 pt-8 lg:justify-start"
            >
              <Stat value="10+" label="Projects Delivered" />
              <div className="hidden h-7 w-px bg-white/10 sm:block" />
              <Stat value="8" label="Core Services" />
              <div className="hidden h-7 w-px bg-white/10 sm:block" />
              <Stat value="24/7" label="Support" />
              <div className="hidden h-7 w-px bg-white/10 sm:block" />
              <Stat value="100%" label="Code Quality" />
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}