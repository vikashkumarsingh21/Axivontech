"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  Info,
  ChevronRight,
} from "lucide-react";
import { Product, formatPrice, getRelatedProducts } from "@/data/novacart-data";
import { useNovaCart } from "@/context/NovaCartContext";
import ProductCard from "./ProductCard";

interface Props {
  product: Product;
}

export default function ProductDetailView({ product }: Props) {
  const { addToCart, toggleWishlist, isInWishlist } = useNovaCart();
  const isWishlisted = isInWishlist(product.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : undefined
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "disclaimer">("specs");

  const relatedProducts = getRelatedProducts(product.id, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Refined Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] text-[#696D66]">
          <Link href="/demo-projects/ecommerce/novacart" className="transition-colors hover:text-[#1C1D1A]">
            HOME
          </Link>
          <ChevronRight className="h-3 w-3 text-[#DCDDD5]" />
          <Link href="/demo-projects/ecommerce/novacart/shop" className="transition-colors hover:text-[#1C1D1A]">
            SHOP
          </Link>
          <ChevronRight className="h-3 w-3 text-[#DCDDD5]" />
          <Link
            href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
            className="uppercase transition-colors hover:text-[#1C1D1A]"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3 text-[#DCDDD5]" />
          <span className="font-bold text-[#1C1D1A] truncate max-w-[240px]" aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-[#DCDDD5] bg-white shadow-sm">
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-all duration-500"
              />

              {/* Wishlist Button floating on main image */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                  isWishlisted
                    ? "bg-[#1C1D1A] text-[#D8F16A] shadow-md scale-105"
                    : "bg-white/90 text-[#1C1D1A] backdrop-blur-xs hover:bg-white shadow-xs hover:scale-105"
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>

              {/* Image Frame Indicator */}
              <div className="absolute bottom-4 left-4 rounded-full bg-[#1C1D1A]/80 px-3 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                0{activeImageIndex + 1} / 0{product.images.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((imgSrc, idx) => (
                  <button
                    key={imgSrc}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 ${
                      activeImageIndex === idx
                        ? "border-[#1C1D1A] shadow-sm scale-102"
                        : "border-[#DCDDD5] opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View product image ${idx + 1}`}
                  >
                    <Image
                      src={imgSrc}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Purchase Interface */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Category & Stock Pill */}
            <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-4">
              <Link
                href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
                className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#696D66] transition-colors hover:text-[#1C1D1A]"
              >
                {product.category}
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EBE3] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1C1D1A]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {product.stockStatus}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#1C1D1A] sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating Banner */}
            <div className="mt-3 flex items-center gap-2.5 text-xs text-[#696D66]">
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="ml-1 font-bold text-[#1C1D1A]">{product.sampleRating}</span>
              </div>
              <span>·</span>
              <span>{product.sampleReviewCount} verified specimen reviews</span>
            </div>

            {/* Price display */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-black tracking-tight text-[#1C1D1A]">
                {formatPrice(product.price)}
              </span>
              {discountPercentage !== null && product.compareAtPrice && (
                <>
                  <span className="text-base text-[#696D66] line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-[#D8F16A] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#1C1D1A]">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Product Narrative */}
            <p className="mt-5 text-sm leading-relaxed text-[#696D66]">
              {product.fullDescription}
            </p>

            {/* Highlights bullets */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mt-5 rounded-xl border border-[#DCDDD5] bg-white p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#696D66]">
                  Key Craft Highlights
                </p>
                <ul className="mt-2.5 space-y-2 text-xs text-[#1C1D1A]">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-[#1C1D1A] shrink-0 mt-0.5" />
                      <span className="leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variants Selector: Color */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6 border-t border-[#DCDDD5] pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#1C1D1A]">
                    Colorway / Material
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#696D66]">
                    {selectedColor}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-[#1C1D1A] scale-110 shadow-sm"
                            : "border-transparent hover:scale-105"
                        }`}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      >
                        <span
                          className="h-6.5 w-6.5 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variants Selector: Size / Model */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#1C1D1A]">
                    Size / Scale
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#696D66]">
                    {selectedSize}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`rounded-lg px-4 py-2 font-mono text-xs font-bold transition-all duration-200 ${
                          isSelected
                            ? "bg-[#1C1D1A] text-white shadow-xs"
                            : "border border-[#DCDDD5] bg-white text-[#1C1D1A] hover:bg-[#E8EBE3]"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Counter & Add To Cart CTA */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-[#DCDDD5] pt-6">
              {/* Stepper */}
              <div className="flex h-13 items-center justify-between rounded-lg border border-[#DCDDD5] bg-white px-4 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1 text-[#1C1D1A] disabled:opacity-30 hover:text-[#696D66] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-mono text-sm font-bold text-[#1C1D1A]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-1 text-[#1C1D1A] hover:text-[#696D66] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add To Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="group flex flex-1 h-13 items-center justify-center gap-2.5 rounded-lg bg-[#D8F16A] px-6 text-xs font-black uppercase tracking-wider text-[#1C1D1A] shadow-xs transition-all duration-200 hover:bg-[#c9e355] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              >
                <ShoppingBag className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                <span>Add to Cart · {formatPrice(product.price * quantity)}</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#DCDDD5] pt-5 text-[11px] text-[#696D66]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8EBE3] text-[#1C1D1A]">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span>Free Ship ₹2k+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8EBE3] text-[#1C1D1A]">
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span>30-Day Return</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8EBE3] text-[#1C1D1A]">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span>2-Yr Warranty</span>
              </div>
            </div>

            {/* Accordion / Tabbed Specs */}
            <div className="mt-8 rounded-xl border border-[#DCDDD5] bg-white p-5 shadow-2xs">
              <div className="flex border-b border-[#DCDDD5] pb-3 text-xs font-bold gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`pb-1 uppercase tracking-wider transition-colors ${
                    activeTab === "specs"
                      ? "border-b-2 border-[#1C1D1A] text-[#1C1D1A]"
                      : "text-[#696D66] hover:text-[#1C1D1A]"
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-1 uppercase tracking-wider transition-colors ${
                    activeTab === "shipping"
                      ? "border-b-2 border-[#1C1D1A] text-[#1C1D1A]"
                      : "text-[#696D66] hover:text-[#1C1D1A]"
                  }`}
                >
                  Shipping & Care
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("disclaimer")}
                  className={`pb-1 uppercase tracking-wider transition-colors ${
                    activeTab === "disclaimer"
                      ? "border-b-2 border-[#1C1D1A] text-[#1C1D1A]"
                      : "text-[#696D66] hover:text-[#1C1D1A]"
                  }`}
                >
                  Disclaimer
                </button>
              </div>

              <div className="pt-4 text-xs">
                {activeTab === "specs" && (
                  <dl className="divide-y divide-[#DCDDD5]/60">
                    {product.specs.map((s) => (
                      <div key={s.label} className="flex justify-between py-2">
                        <dt className="text-[#696D66]">{s.label}</dt>
                        <dd className="font-mono font-bold text-[#1C1D1A]">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-3 leading-relaxed text-[#696D66]">
                    <p>
                      <strong className="text-[#1C1D1A]">Pan-India Express Dispatch:</strong> Processed from Bangalore central distribution within 24–48 simulated hours. Delivered via BlueDart / Delhivery air cargo networks.
                    </p>
                    <p>
                      <strong className="text-[#1C1D1A]">Care Instructions:</strong> Wipe with dry microfiber cloth. Avoid solvent cleaners on natural vegetable-tanned leathers and matte anodized surfaces.
                    </p>
                  </div>
                )}

                {activeTab === "disclaimer" && (
                  <div className="flex items-start gap-3 rounded-lg bg-[#E8EBE3]/70 p-3.5 text-[#1C1D1A] leading-relaxed">
                    <Info className="h-4 w-4 shrink-0 text-[#1C1D1A] mt-0.5" />
                    <p className="text-[11px]">
                      This is a live interactive demonstration created by Axivon Technologies. All details, inventory figures, and prices are fictional test fixtures. No real financial transaction occurs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-20 border-t border-[#DCDDD5] pt-14 sm:mt-28 sm:pt-16">
          <div className="flex flex-col justify-between gap-4 border-b border-[#DCDDD5] pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#696D66]">
                COMPATIBLE PAIRINGS
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#1C1D1A] sm:text-3xl">
                Related Everyday Objects
              </h2>
            </div>
            <Link
              href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
              className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A] hover:underline underline-offset-4"
            >
              See all {product.category} →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
