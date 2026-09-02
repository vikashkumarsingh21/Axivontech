"use client";

import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <section className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Rocket className="mx-auto h-16 w-16 text-[#d4915c]" />

          <h1 className="mt-6 text-5xl font-bold text-white">
            {title}
          </h1>

          <div className="mt-8">
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-[#e8a064] via-[#c9922a] to-[#d4915c] bg-clip-text text-transparent">
              🚀 Coming Soon
            </h2>

            <p className="mt-6 text-lg text-slate-400">
              We are currently building this page.
            </p>

            <p className="mt-2 text-lg text-slate-400">
              Stay tuned for updates.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#141414]/5 p-6">
            <h3 className="text-white font-semibold">
              For Business Inquiries
            </h3>

            <p className="mt-4 text-slate-300">
              info@axivontech.in
            </p>

            <p className="mt-2 text-slate-300">
              +91 9473263768
            </p>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e8a064] via-[#c9922a] to-[#d4915c] px-8 py-4 text-white font-semibold shadow-lg"
          >
            <ArrowLeft size={18} />
            Back To Home
          </Link>
        </motion.div>
      </div>
    </section>
  );
}