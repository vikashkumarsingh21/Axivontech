"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
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
      <div className="border-b border-[#DCDDD5] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Brand Intro */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#1C1D1A] text-xs font-bold tracking-widest text-[#D8F16A]">
                  N
                </span>
                <span className="text-xl font-extrabold tracking-tight text-[#1C1D1A]">
                  NOVACART
                </span>
              </div>
              <p className="mt-4 text-sm text-[#696D66] max-w-md leading-relaxed">
                Thoughtfully selected everyday objects for modern living, work, and mindful journeys. Engineered for longevity and quiet refinement.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="lg:col-span-6">
              <h4 className="text-sm font-bold text-[#1C1D1A]">
                The NovaCart Journal & New Releases
              </h4>
              <p className="mt-1 text-xs text-[#696D66]">
                Receive occasional dispatches on sustainable craftsmanship and new sample catalog releases.
              </p>

              {subscribed ? (
                <div className="mt-4 flex items-center gap-2 rounded-md bg-[#E8EBE3] px-4 py-3 text-xs font-semibold text-[#1C1D1A]">
                  <CheckCircle2 className="h-4 w-4 text-[#1C1D1A]" />
                  <span>Thank you! (Demo subscription simulated successfully.)</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex max-w-md gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 rounded-md border border-[#DCDDD5] bg-white px-3.5 py-2.5 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none focus:ring-1 focus:ring-[#1C1D1A]"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-[#1C1D1A] px-5 py-2.5 text-xs font-bold text-[#D8F16A] hover:bg-[#343630] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Links Columns */}
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
            {/* Column 1: Shop */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Catalogue
              </h5>
              <ul className="mt-4 space-y-2.5 text-xs text-[#696D66]">
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/shop" className="hover:text-[#1C1D1A] transition-colors">
                    All Products (24)
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/shop?filter=new" className="hover:text-[#1C1D1A] transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/shop?filter=featured" className="hover:text-[#1C1D1A] transition-colors">
                    Featured Highlights
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/search" className="hover:text-[#1C1D1A] transition-colors">
                    Product Search
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Categories */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Categories
              </h5>
              <ul className="mt-4 space-y-2.5 text-xs text-[#696D66]">
                {NOVACART_CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                      className="hover:text-[#1C1D1A] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Customer UI
              </h5>
              <ul className="mt-4 space-y-2.5 text-xs text-[#696D66]">
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/cart" className="hover:text-[#1C1D1A] transition-colors">
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/wishlist" className="hover:text-[#1C1D1A] transition-colors">
                    Saved Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/account" className="hover:text-[#1C1D1A] transition-colors">
                    Demo Account
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/login" className="hover:text-[#1C1D1A] transition-colors">
                    Demo Login
                  </Link>
                </li>
                <li>
                  <Link href="/demo-projects/ecommerce/novacart/register" className="hover:text-[#1C1D1A] transition-colors">
                    Demo Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Parent Agency */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Axivon Technologies
              </h5>
              <p className="mt-4 text-xs text-[#696D66] leading-relaxed">
                Need a custom e-commerce web platform engineered for high conversion, responsive ergonomics, and bespoke design?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/contact?project=NovaCart#contact-form"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1D1A] hover:underline underline-offset-4"
                >
                  <span>Build a store like this</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/demo-projects"
                  className="inline-flex items-center gap-1.5 text-xs text-[#696D66] hover:text-[#1C1D1A]"
                >
                  <span>Browse all demo projects</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Honest Demonstration Legal Disclosure */}
      <div className="border-t border-[#DCDDD5] bg-[#E8EBE3] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#696D66]">
            <p className="text-center md:text-left max-w-3xl leading-relaxed">
              <strong className="text-[#1C1D1A]">DEMONSTRATION DISCLOSURE:</strong> NovaCart is a fictional lifestyle e-commerce demonstration created by{" "}
              <Link href="/" className="font-semibold text-[#1C1D1A] hover:underline">
                Axivon Technologies
              </Link>
              . All products, prices (INR), stock indicators, order workflows, and account states are illustrative demonstrations of frontend UI/UX engineering. No real monetary transactions or order fulfillment take place.
            </p>
            <p className="shrink-0 text-[#1C1D1A] font-medium">
              Demo Project 05 · Axivon Technologies
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
