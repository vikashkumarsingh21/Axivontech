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

  // Track scroll for subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Shop", href: "/demo-projects/ecommerce/novacart/shop" },
    { label: "New Arrivals", href: "/demo-projects/ecommerce/novacart/shop?filter=new" },
  ];

  return (
    <header
      className={`sticky top-[37px] z-40 w-full border-b border-[#DCDDD5] bg-[#F7F7F2]/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-xs" : ""
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger + Desktop Brand */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#1C1D1A] hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] md:hidden"
            aria-label={mobileMenuOpen ? "Close main navigation menu" : "Open main navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Store Logo / Wordmark */}
          <Link
            href="/demo-projects/ecommerce/novacart"
            className="group flex items-center gap-2 text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#1C1D1A] text-xs font-bold tracking-widest text-[#D8F16A] transition-transform group-hover:scale-105">
              N
            </span>
            <span className="font-sans text-xl font-extrabold tracking-tight text-[#1C1D1A]">
              NOVACART
            </span>
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
                className={`relative text-sm font-medium transition-colors hover:text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                  isActive ? "text-[#1C1D1A] font-semibold" : "text-[#696D66]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[#1C1D1A] rounded-full" />
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
              className="inline-flex items-center gap-1 text-sm font-medium text-[#696D66] hover:text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              aria-expanded={collectionsOpen}
              aria-haspopup="true"
            >
              <span>Collections</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  collectionsOpen ? "rotate-180 text-[#1C1D1A]" : ""
                }`}
              />
            </button>

            {collectionsOpen && (
              <div className="absolute top-full -left-4 w-64 pt-2 shadow-lg">
                <div className="rounded-lg border border-[#DCDDD5] bg-white p-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#696D66]">
                    Curated Categories
                  </div>
                  {NOVACART_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                      className="group flex flex-col rounded-md px-3 py-2 text-xs transition-colors hover:bg-[#F7F7F2]"
                    >
                      <span className="font-semibold text-[#1C1D1A] group-hover:text-[#1C1D1A]">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-[#696D66]">{cat.shortTag}</span>
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-[#DCDDD5] pt-1">
                    <Link
                      href="/demo-projects/ecommerce/novacart/shop"
                      className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-[#1C1D1A] hover:bg-[#E8EBE3]"
                    >
                      <span>View All Catalogue</span>
                      <span className="rounded bg-[#D8F16A] px-1.5 py-0.5 text-[10px] font-bold text-[#1C1D1A]">
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
            className="text-sm font-medium text-[#696D66] transition-colors hover:text-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            About
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
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1C1D1A] text-[9px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Shopping Cart Button */}
          <Link
            href="/demo-projects/ecommerce/novacart/cart"
            aria-label={`Shopping Cart (${totalCartQuantity} items)`}
            className="group relative flex h-9 items-center gap-2 rounded-full bg-[#1C1D1A] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#343630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] focus-visible:ring-offset-2"
          >
            <ShoppingBag className="h-4 w-4 text-[#D8F16A]" />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D8F16A] px-1 text-[11px] font-bold text-[#1C1D1A]">
              {isHydrated ? totalCartQuantity : 0}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#DCDDD5] bg-[#F7F7F2] px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium">
            <Link
              href="/demo-projects/ecommerce/novacart/shop"
              className="text-[#1C1D1A] hover:text-[#696D66]"
            >
              Shop All Catalogue
            </Link>
            <Link
              href="/demo-projects/ecommerce/novacart/shop?filter=new"
              className="text-[#1C1D1A] hover:text-[#696D66]"
            >
              New Arrivals
            </Link>

            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#696D66]">
                Categories
              </span>
              <div className="mt-2 flex flex-col gap-2 pl-2">
                {NOVACART_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                    className="text-sm text-[#1C1D1A] hover:text-[#696D66]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#DCDDD5] pt-4 flex flex-col gap-3 text-sm">
              <Link
                href="/demo-projects/ecommerce/novacart/account"
                className="flex items-center gap-2 text-[#1C1D1A]"
              >
                <User className="h-4 w-4" />
                <span>Demo Account</span>
              </Link>
              <Link
                href="/demo-projects/ecommerce/novacart/wishlist"
                className="flex items-center gap-2 text-[#1C1D1A]"
              >
                <Heart className="h-4 w-4" />
                <span>Saved Wishlist ({wishlist.length})</span>
              </Link>
              <Link
                href="/demo-projects/ecommerce/novacart#about-story"
                className="text-[#696D66]"
              >
                About NovaCart
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
