"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useNovaCart } from "@/context/NovaCartContext";
import { NOVACART_CATEGORIES } from "@/data/novacart-data";

export default function NovaCartHeader() {
  const pathname = usePathname();
  const { totalCartQuantity, wishlist, isHydrated } = useNovaCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  // Track scroll for subtle border and shadow transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Shop All", href: "/demo-projects/ecommerce/novacart/shop" },
    { label: "New Arrivals", href: "/demo-projects/ecommerce/novacart/shop?filter=new" },
    { label: "Store Admin", href: "/demo-projects/ecommerce/novacart/admin" },
  ];

  return (
    <header
      className={`sticky top-[38px] z-40 w-full border-b border-[#DCDDD5] bg-[#F7F7F2]/90 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-xs border-[#DCDDD5]" : "border-[#DCDDD5]/80"
      }`}
    >
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger + Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#1C1D1A] transition-colors hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] md:hidden"
            aria-label={mobileMenuOpen ? "Close main navigation menu" : "Open main navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Store Logo / Wordmark */}
          <Link
            href="/demo-projects/ecommerce/novacart"
            className="group flex items-center gap-2.5 text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1C1D1A] font-mono text-sm font-black tracking-wider text-[#D8F16A] shadow-xs transition-transform duration-200 group-hover:scale-105">
              N
            </span>
            <div className="flex flex-col">
              <span className="font-sans text-lg font-black tracking-[-0.03em] text-[#1C1D1A] sm:text-xl">
                NOVACART
              </span>
              <span className="hidden text-[9px] font-semibold tracking-widest uppercase text-[#696D66] -mt-1 sm:block">
                LIFESTYLE OBJECTS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav aria-label="Main Store Navigation" className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative py-1 text-xs font-semibold tracking-wide uppercase transition-colors hover:text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                  isActive ? "text-[#1C1D1A]" : "text-[#696D66]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#1C1D1A]" />
                )}
              </Link>
            );
          })}

          {/* Collections Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCollectionsOpen(true)}
            onMouseLeave={() => setCollectionsOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold tracking-wide uppercase text-[#696D66] transition-colors hover:text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              aria-expanded={collectionsOpen}
              aria-haspopup="true"
            >
              <span>Collections</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  collectionsOpen ? "rotate-180 text-[#1C1D1A]" : ""
                }`}
              />
            </button>

            {collectionsOpen && (
              <div className="absolute top-full -left-6 z-50 w-72 pt-3">
                <div className="overflow-hidden rounded-xl border border-[#DCDDD5] bg-white p-2.5 shadow-xl transition-all animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#696D66]">
                    Curated Categories
                  </div>
                  <div className="space-y-0.5">
                    {NOVACART_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                        className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:bg-[#F7F7F2]"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1C1D1A] group-hover:text-[#1C1D1A]">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-[#696D66]">{cat.shortTag}</span>
                        </div>
                        <span className="rounded-full bg-[#E8EBE3] px-2 py-0.5 text-[10px] font-semibold text-[#1C1D1A] group-hover:bg-[#D8F16A]">
                          {cat.itemCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-[#DCDDD5] pt-2">
                    <Link
                      href="/demo-projects/ecommerce/novacart/shop"
                      className="group flex items-center justify-between rounded-lg bg-[#E8EBE3]/50 px-3 py-2 text-xs font-bold text-[#1C1D1A] transition-colors hover:bg-[#E8EBE3]"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Browse Entire Index</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="rounded-full bg-[#D8F16A] px-2 py-0.5 text-[10px] font-extrabold text-[#1C1D1A]">
                        24 Items
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/demo-projects/ecommerce/novacart#about-story"
            className="py-1 text-xs font-semibold tracking-wide uppercase text-[#696D66] transition-colors hover:text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            Philosophy
          </Link>
        </nav>

        {/* Right: Utility actions (Search, Account, Wishlist, Cart) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button */}
          <Link
            href="/demo-projects/ecommerce/novacart/search"
            aria-label="Search products"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#1C1D1A] transition-colors hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <Search className="h-4.5 w-4.5" />
          </Link>

          {/* Account Button */}
          <Link
            href="/demo-projects/ecommerce/novacart/account"
            aria-label="Demo Customer Account"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#1C1D1A] transition-colors hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <User className="h-4.5 w-4.5" />
          </Link>

          {/* Wishlist Button */}
          <Link
            href="/demo-projects/ecommerce/novacart/wishlist"
            aria-label={`Wishlist (${wishlist.length} saved)`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#1C1D1A] transition-colors hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <Heart className="h-4.5 w-4.5" />
            {isHydrated && wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1C1D1A] px-1 text-[9px] font-bold text-[#D8F16A]">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Shopping Cart Button */}
          <Link
            href="/demo-projects/ecommerce/novacart/cart"
            aria-label={`Shopping Cart (${totalCartQuantity} items)`}
            className="group relative ml-1 flex h-9 items-center gap-2 rounded-full bg-[#1C1D1A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#343630] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] focus-visible:ring-offset-2"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-[#D8F16A] transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline font-medium">Cart</span>
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#D8F16A] px-1 text-[10px] font-black text-[#1C1D1A]">
              {isHydrated ? totalCartQuantity : 0}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#DCDDD5] bg-[#F7F7F2] px-5 py-6 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 border-b border-[#DCDDD5] pb-4">
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="text-sm font-bold text-[#1C1D1A] hover:text-[#696D66]"
              >
                Shop All Catalogue (24 Products)
              </Link>
              <Link
                href="/demo-projects/ecommerce/novacart/shop?filter=new"
                className="text-sm font-semibold text-[#1C1D1A] hover:text-[#696D66]"
              >
                New Arrivals
              </Link>
              <Link
                href="/demo-projects/ecommerce/novacart/shop?filter=featured"
                className="text-sm font-semibold text-[#1C1D1A] hover:text-[#696D66]"
              >
                Featured Highlights
              </Link>
            </div>

            <div className="py-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#696D66]">
                Curated Categories
              </span>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {NOVACART_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                    className="flex flex-col rounded-lg border border-[#DCDDD5] bg-white p-2.5 text-xs transition-colors hover:border-[#1C1D1A]"
                  >
                    <span className="font-bold text-[#1C1D1A]">{cat.name}</span>
                    <span className="text-[10px] text-[#696D66]">{cat.itemCount} items</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#DCDDD5] pt-4 flex flex-col gap-3 text-xs">
              <Link
                href="/demo-projects/ecommerce/novacart/account"
                className="flex items-center gap-2 font-medium text-[#1C1D1A]"
              >
                <User className="h-4 w-4" />
                <span>Demo Customer Account</span>
              </Link>
              <Link
                href="/demo-projects/ecommerce/novacart/wishlist"
                className="flex items-center gap-2 font-medium text-[#1C1D1A]"
              >
                <Heart className="h-4 w-4" />
                <span>Saved Wishlist ({isHydrated ? wishlist.length : 0})</span>
              </Link>
              <Link
                href="/demo-projects/ecommerce/novacart#about-story"
                className="font-medium text-[#696D66] hover:text-[#1C1D1A]"
              >
                Design Ethos & Brand Philosophy
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
