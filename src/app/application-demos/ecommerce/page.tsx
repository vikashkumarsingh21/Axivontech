"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Package,
  Search,
  ShoppingCart,
  CreditCard,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  Terminal,
  FileCode,
  FolderArchive,
  RefreshCw,
  Clock,
  ChevronRight,
  Info,
} from "lucide-react";

export default function EcommerceShowcasePage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Trigger download from API endpoint
    window.location.href = "/api/v1/public/downloads/ecommerce";
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased selection:bg-[#dc2626] selection:text-white">
      {/* ── 01. NAVIGATION BREADCRUMB ── */}
      <div className="border-b border-white/[0.08] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/demo-projects" className="hover:text-white transition-colors">
              Demo Projects
            </Link>
            <span>/</span>
            <span className="text-white font-semibold" aria-current="page">
              Axivon Commerce
            </span>
          </nav>

          <Link
            href="/demo-projects/ecommerce/novacart"
            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            <span>Launch Live Storefront</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── 02. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-white/[0.08]">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#D8F16A]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold tracking-wider uppercase mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full-Stack Application Specimen</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Explore Axivon Commerce
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed font-normal">
              Experience a complete E-commerce solution with product discovery, shopping cart,
              checkout demonstration, inventory control, and dedicated order administration.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/demo-projects/ecommerce/novacart"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-red-600/20 transition-all duration-200"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Explore Live Demo</span>
              </Link>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 transition-all duration-200"
              >
                <Download className="h-4 w-4 text-[#D8F16A]" />
                <span>{downloading ? "Preparing Package..." : "Download Demo Application"}</span>
              </button>

              <Link
                href="/demo-projects/ecommerce/novacart/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-[#141414] text-gray-300 hover:text-white font-semibold text-sm px-5 py-3.5 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
                <span>Open Store Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03. APPLICATION LIVE PREVIEW CARDS ── */}
      <section className="py-16 sm:py-24 border-b border-white/[0.08] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
              Application Architecture
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dual-Layer Architecture: Storefront &amp; Control Console
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Axivon Commerce unites customer shopping journeys with an isolated administration cockpit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Storefront */}
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D8F16A]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-gray-400 border border-white/5">
                    Customer Experience
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">Modern Lifestyle Storefront</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Curated product categories (Fashion, Travel, Tech, Living), instant keyword search,
                  faceted filters, real-time cart persistence, and simulated checkout.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D8F16A]" />
                    <span>Real-time localStorage bag and wishlist synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D8F16A]" />
                    <span>Multi-attribute variant selection (color, sizing, specification)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D8F16A]" />
                    <span>Dynamic promotion code discounts and shipping calculator</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/demo-projects/ecommerce/novacart"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition-colors"
                >
                  <span>Launch Customer Storefront</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] font-mono text-gray-500">Route: /demo-projects/ecommerce/novacart</span>
              </div>
            </div>

            {/* Card 2: Admin Dashboard */}
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-gray-400 border border-white/5">
                    Store Operations
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">Store Administration Console</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Real-time KPI metrics, stock level alerts, sample product creator/editor, and order
                  lifecycle status pipeline (Processing, Shipped, Delivered).
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-400" />
                    <span>Catalog CRUD: add, edit, toggle stock, or delete sample items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-400" />
                    <span>Order lifecycle tracker with customer delivery inspect modal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-400" />
                    <span>One-click &quot;Reset Demo Data&quot; to restore clean seeded database</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <Link
                  href="/demo-projects/ecommerce/novacart/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition-colors"
                >
                  <span>Launch Admin Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] font-mono text-gray-500">Route: .../novacart/admin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04. FEATURE OVERVIEW GRID ── */}
      <section className="py-16 sm:py-24 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
              Included Functionality
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Production-Grade Features Ready Out-of-the-Box
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Every workflow has been crafted to demonstrate high-performance modern retail technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Package,
                title: "Product Catalog",
                desc: "Rich multi-image galleries, attribute chips, stock levels, and responsive specs tables.",
              },
              {
                icon: Search,
                title: "Smart Search",
                desc: "Instant client-side substring indexing matching titles, tags, categories, and descriptions.",
              },
              {
                icon: ShoppingCart,
                title: "Shopping Cart & Bag",
                desc: "Persistent line items with color/size variants, quantity steppers, and price calculations.",
              },
              {
                icon: CreditCard,
                title: "Checkout Demonstration",
                desc: "Validated delivery address inputs, payment selection, and simulated order placement.",
              },
              {
                icon: Clock,
                title: "Order Lifecycle",
                desc: "Real order tracking from Pending to Processing, Shipped, and Delivered statuses.",
              },
              {
                icon: ShieldCheck,
                title: "Inventory Control",
                desc: "Low-stock notifications, availability badges, and restock status toggles.",
              },
              {
                icon: LayoutDashboard,
                title: "Admin Dashboard",
                desc: "Revenue aggregations, order count metrics, and customer spend logs.",
              },
              {
                icon: RefreshCw,
                title: "Seed Data Reset",
                desc: "Instant demo reset button that restores original sample data safely.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-[#111111] p-6 hover:border-white/15 transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">{f.title}</h4>
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 05. DOWNLOAD CARD & SETUP INSTRUCTIONS ── */}
      <section id="download-package" className="py-16 sm:py-24 border-b border-white/[0.08] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Package Info (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8F16A]/10 border border-[#D8F16A]/20 text-[#D8F16A] text-xs font-mono font-bold tracking-wider uppercase mb-5">
                <FolderArchive className="h-3.5 w-3.5" />
                <span>Verified Distribution Archive</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Download Standalone E-Commerce Package
              </h2>

              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                Download the complete, self-contained Next.js application package. It includes all
                frontend components, catalog datasets, local state storage managers, and administrative
                consoles. Zero external database or cloud credentials needed to run locally.
              </p>

              {/* Package Specs Grid */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-white/10 bg-[#111111] text-xs">
                <div>
                  <span className="text-gray-500 block">Package Name</span>
                  <span className="font-bold text-white mt-0.5 block">Axivon Commerce</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Release Version</span>
                  <span className="font-bold text-white mt-0.5 block font-mono">v1.0.0 (Demo)</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Archive Format</span>
                  <span className="font-bold text-white mt-0.5 block">Standard .ZIP</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Prerequisites</span>
                  <span className="font-bold text-white mt-0.5 block">Node.js 18.x+</span>
                </div>
              </div>

              {/* Download Action */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-7 py-4 shadow-xl shadow-red-600/25 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "Starting Download..." : "Download axivon-commerce-demo-v1.0.0.zip"}</span>
                </button>

                <a
                  href="/api/v1/public/downloads/ecommerce?info=true"
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-white underline transition-colors"
                >
                  View Release Manifest JSON
                </a>
              </div>
            </div>

            {/* Right: Quick Start Guide (5 cols) */}
            <div className="lg:col-span-5 bg-[#141414] rounded-3xl border border-white/10 p-6 sm:p-8 font-mono text-xs">
              <div className="flex items-center gap-2 text-gray-400 pb-4 border-b border-white/10 mb-5">
                <Terminal className="h-4 w-4 text-[#D8F16A]" />
                <span className="font-bold text-white">Local Run Quick-Start Guide</span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 text-[11px]"># 1. Extract Archive</span>
                  <div className="mt-1 bg-black/60 p-2.5 rounded-lg border border-white/5 text-gray-200">
                    tar -xf axivon-commerce-demo-v1.0.0.zip<br />
                    cd axivon-commerce-demo
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-[11px]"># 2. Install Dependencies</span>
                  <div className="mt-1 bg-black/60 p-2.5 rounded-lg border border-white/5 text-gray-200">
                    npm install
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-[11px]"># 3. Start Local Development Server</span>
                  <div className="mt-1 bg-black/60 p-2.5 rounded-lg border border-white/5 text-emerald-400">
                    npm run dev
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-[11px]"># 4. Open in Browser</span>
                  <div className="mt-1 bg-black/60 p-2.5 rounded-lg border border-white/5 text-gray-200">
                    http://localhost:3000
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-gray-500">
                <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>Zero configuration required. All demo data runs in local storage.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06. CUSTOM DEVELOPMENT CONSULTATION CTA ── */}
      <section className="py-20 sm:py-28 bg-[#111111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold tracking-wider uppercase mb-5">
            <span>Tailored Enterprise Retail</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Need an E-commerce Solution for Your Business?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Axivon Technologies engineers custom, high-converting digital commerce platforms,
            omnichannel inventory sync engines, and payment gateway integrations.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact?service=ecommerce#contact-form"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-8 py-4 shadow-xl shadow-red-600/25 transition-all"
            >
              <span>Consult Axivon Engineers</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo-projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <span>Browse 20+ Industry Demonstrations</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
