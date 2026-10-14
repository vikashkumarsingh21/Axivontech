"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ArrowRight } from "lucide-react";
import { NOVACART_CATEGORIES } from "@/data/novacart-data";

export default function NovaCartFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim().includes("@")) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="border-t border-[#DCDDD5] bg-[#F7F7F2] text-[#1C1D1A]">
      {/* Upper Newsletter & Brand Manifesto */}
      <div className="border-b border-[#DCDDD5] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Brand Intro */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1C1D1A] font-mono text-sm font-black tracking-wider text-[#D8F16A]">
                  N
                </span>
                <span className="font-sans text-xl font-black tracking-[-0.03em] text-[#1C1D1A]">
                  NOVACART
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#696D66]">
                Thoughtfully selected everyday objects for modern living, creative studios, and mindful journeys. Engineered for longevity, tactile satisfaction, and quiet refinement.
              </p>
              <div className="mt-6 flex items-center gap-3 font-mono text-[11px] font-semibold text-[#696D66]">
                <span>SPECIMEN 05</span>
                <span>·</span>
                <span>BANGALORE</span>
                <span>·</span>
                <span>EST. 2026</span>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-2xs sm:p-8">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#1C1D1A]">
                  The NovaCart Journal & Edition Dispatches
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#696D66]">
                  Receive periodic essays on sustainable industrial design, material sourcing, and new sample releases.
                </p>

                {subscribed ? (
                  <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-[#1C1D1A] bg-[#1C1D1A] px-4 py-3 text-xs font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4 text-[#D8F16A]" />
                    <span>Thank you. Simulated subscription acknowledged.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 rounded-lg border border-[#DCDDD5] bg-[#F7F7F2] px-4 py-3 text-xs text-[#1C1D1A] placeholder-[#696D66] transition-colors focus:border-[#1C1D1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1D1A]"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1D1A] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#D8F16A] transition-all hover:bg-[#343630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
                    >
                      <span>Join Dispatch</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Links Columns */}
      <div className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
            {/* Column 1: Shop */}
            <div>
              <h5 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1D1A]">
                CATALOGUE INDEX
              </h5>
              <ul className="mt-4 space-y-2.5 text-xs text-[#696D66]">
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/shop" className="transition-colors hover:text-[#1C1D1A]">
                    All Products (24 Items)
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/shop?filter=new" className="transition-colors hover:text-[#1C1D1A]">
                    New 2026 Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/shop?filter=featured" className="transition-colors hover:text-[#1C1D1A]">
                    Featured Highlights
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/search" className="transition-colors hover:text-[#1C1D1A]">
                    Interactive Search
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Categories */}
            <div>
              <h5 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1D1A]">
                COLLECTIONS
              </h5>
              <ul className="mt-4 space-y-2.5 text-xs text-[#696D66]">
                {NOVACART_CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                      className="transition-colors hover:text-[#1C1D1A]"
                    >
                      {cat.name} ({cat.itemCount})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div>
              <h5 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1D1A]">
                STORE INTERFACES
              </h5>
              <ul className="mt-4 space-y-2.5 text-xs text-[#696D66]">
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/cart" className="transition-colors hover:text-[#1C1D1A]">
                    Interactive Cart Drawer
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/wishlist" className="transition-colors hover:text-[#1C1D1A]">
                    Saved Wishlist Collection
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/account" className="transition-colors hover:text-[#1C1D1A]">
                    Customer Account Portal
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/login" className="transition-colors hover:text-[#1C1D1A]">
                    Demo Login State
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/register" className="transition-colors hover:text-[#1C1D1A]">
                    Registration Prototype
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Parent Agency */}
            <div>
              <h5 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1D1A]">
                AXIVON ATELIER
              </h5>
              <p className="mt-4 text-xs leading-relaxed text-[#696D66]">
                Looking to build a high-conversion, performant e-commerce platform with bespoke design engineering?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/contact?project=NovaCart#contact-form"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1D1A] hover:underline underline-offset-4"
                >
                  <span>Commission a Store Like This</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/demo-projects"
                  className="inline-flex items-center gap-1.5 text-xs text-[#696D66] hover:text-[#1C1D1A]"
                >
                  <span>Explore all demo showcases</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Honest Demonstration Legal Disclosure */}
      <div className="border-t border-[#DCDDD5] bg-[#E8EBE3]/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-[#696D66]">
            <p className="text-center md:text-left max-w-3xl leading-relaxed text-[11px]">
              <strong className="text-[#1C1D1A]">DEMONSTRATION SHOWCASE:</strong> NovaCart is a fictional lifestyle e-commerce demonstration designed and built by{" "}
              <Link href="/" className="font-bold text-[#1C1D1A] underline underline-offset-2 hover:text-[#696D66]">
                Axivon Technologies
              </Link>
              . All products, prices (INR), inventory tags, checkout workflows, and profile states are illustrative demonstrations of frontend UI/UX engineering. No monetary transactions occur.
            </p>
            <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] font-bold text-[#1C1D1A]">
              <span className="h-2 w-2 rounded-full bg-[#1C1D1A]" />
              <span>AXIVON DEMO SPECIMEN 05</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
