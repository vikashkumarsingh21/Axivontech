"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass, MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <main
      role="main"
      aria-labelledby="not-found-heading"
      className="bg-[#0f0f0f] text-[#f4f4f5] min-h-screen flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-xl text-center"
      >
        {/* Sleek 404 badge */}
        <span className="text-[#e8a064] font-mono text-sm tracking-widest uppercase mb-2 inline-block font-semibold">
          Error 404
        </span>

        {/* Big 404 display */}
        <h1 className="text-7xl font-extrabold tracking-tight text-[#f4f4f5] sm:text-8xl mb-4">
          404
        </h1>

        {/* Bold Title */}
        <h2
          id="not-found-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f4f5] mb-4"
        >
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-base text-[#a1a1aa] leading-relaxed mb-8 sm:text-lg">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e8a064] hover:bg-[#d4915c] text-[#0f0f0f] rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#2a2a2a] hover:border-[#e8a064]/40 text-[#f4f4f5] hover:text-[#e8a064] rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>View Services</span>
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[#e8a064] hover:bg-[#1c1c1e] rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Contact Support</span>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}