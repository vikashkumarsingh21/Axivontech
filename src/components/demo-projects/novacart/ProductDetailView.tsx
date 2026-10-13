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

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#696D66]">
          <Link href="/demo-projects/ecommerce/novacart" className="hover:text-[#1C1D1A]">
            Home
          </Link>
          <span>/</span>
          <Link href="/demo-projects/ecommerce/novacart/shop" className="hover:text-[#1C1D1A]">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
            className="hover:text-[#1C1D1A]"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1C1D1A] truncate max-w-[200px]" aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
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
                className="object-cover object-center transition-all duration-300"
              />

              {/* Wishlist Button floating on main image */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isWishlisted
                    ? "bg-[#1C1D1A] text-[#D8F16A] shadow-md"
                    : "bg-white/90 text-[#1C1D1A] backdrop-blur-xs hover:bg-white shadow-sm"
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((imgSrc, idx) => (
                  <button
                    key={imgSrc}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 bg-white transition-all ${
                      activeImageIndex === idx
                        ? "border-[#1C1D1A] ring-2 ring-[#1C1D1A]/20"
                        : "border-[#DCDDD5] opacity-70 hover:opacity-100"
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
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#696D66]">
              <Link
                href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
                className="hover:text-[#1C1D1A]"
              >
                {product.category}
              </Link>
              <span>·</span>
              <span className="text-[#1C1D1A]">{product.stockStatus}</span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
              {product.name}
            </h1>

            {/* Illustrative Rating Banner */}
            <div className="mt-3 flex items-center gap-2 text-xs text-[#696D66]">
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="ml-1 font-bold text-[#1C1D1A]">{product.sampleRating}</span>
              </div>
              <span>({product.sampleReviewCount} illustrative sample reviews)</span>
            </div>

            {/* Price display */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-black text-[#1C1D1A]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-base text-[#696D66] line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-[#D8F16A] px-2.5 py-0.5 text-xs font-bold text-[#1C1D1A]">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Product Narrative */}
            <p className="mt-5 text-sm text-[#696D66] leading-relaxed">
              {product.fullDescription}
            </p>

            {/* Highlights bullets */}
            {product.highlights && product.highlights.length > 0 && (
              <ul className="mt-4 space-y-2 text-xs text-[#1C1D1A]">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#1C1D1A] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Variants Selector: Color */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6 border-t border-[#DCDDD5] pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1C1D1A]">Color / Finish:</span>
                  <span className="text-[#696D66] font-medium">{selectedColor}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2.5">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-[#1C1D1A] ring-2 ring-[#1C1D1A]/20 scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-black/15 shadow-xs"
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
                  <span className="font-bold text-[#1C1D1A]">Size / Option:</span>
                  <span className="text-[#696D66] font-medium">{selectedSize}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
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
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-[#DCDDD5] pt-6">
              {/* Counter */}
              <div className="flex h-12 items-center justify-between rounded-md border border-[#DCDDD5] bg-white px-3 sm:w-32">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1 text-[#1C1D1A] disabled:opacity-30 hover:text-[#696D66]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-bold text-[#1C1D1A]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-1 text-[#1C1D1A] hover:text-[#696D66]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add To Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 h-12 items-center justify-center gap-2 rounded-md bg-[#D8F16A] px-6 text-sm font-bold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#c9e355] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                <span>Add to Cart ({formatPrice(product.price * quantity)})</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[#DCDDD5] pt-4 text-[11px] text-[#696D66]">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-[#1C1D1A] shrink-0" />
                <span>Free delivery over ₹2k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-[#1C1D1A] shrink-0" />
                <span>30-day demo return</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1C1D1A] shrink-0" />
                <span>2-year craft warrant</span>
              </div>
            </div>

            {/* Accordion / Tabbed Specs */}
            <div className="mt-8 rounded-xl border border-[#DCDDD5] bg-white p-4">
              <div className="flex border-b border-[#DCDDD5] pb-2 text-xs font-semibold gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`pb-1 transition-colors ${
                    activeTab === "specs"
                      ? "border-b-2 border-[#1C1D1A] text-[#1C1D1A] font-bold"
                      : "text-[#696D66] hover:text-[#1C1D1A]"
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-1 transition-colors ${
                    activeTab === "shipping"
                      ? "border-b-2 border-[#1C1D1A] text-[#1C1D1A] font-bold"
                      : "text-[#696D66] hover:text-[#1C1D1A]"
                  }`}
                >
                  Shipping & Care
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("disclaimer")}
                  className={`pb-1 transition-colors ${
                    activeTab === "disclaimer"
                      ? "border-b-2 border-[#1C1D1A] text-[#1C1D1A] font-bold"
                      : "text-[#696D66] hover:text-[#1C1D1A]"
                  }`}
                >
                  Demo Disclaimer
                </button>
              </div>

              <div className="pt-4 text-xs">
                {activeTab === "specs" && (
                  <dl className="space-y-2">
                    {product.specs.map((s) => (
                      <div key={s.label} className="flex justify-between py-1 border-b border-[#DCDDD5]/50">
                        <dt className="text-[#696D66]">{s.label}</dt>
                        <dd className="font-semibold text-[#1C1D1A]">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-2 text-[#696D66] leading-relaxed">
                    <p>
                      <strong>Pan-India Express:</strong> Dispatched from Bangalore fulfillment facility within 24–48 simulated hours. Delivered via BlueDart / Delhivery air cargo.
                    </p>
                    <p>
                      <strong>Care Instructions:</strong> Wipe surfaces with a dry microfiber cloth. Avoid solvent-based harsh cleansers on natural leather and brushed metals.
                    </p>
                  </div>
                )}

                {activeTab === "disclaimer" && (
                  <div className="flex items-start gap-2 rounded bg-[#E8EBE3] p-3 text-[#1C1D1A] leading-relaxed">
                    <Info className="h-4 w-4 shrink-0 text-[#1C1D1A] mt-0.5" />
                    <p>
                      This is a demonstration product from Axivon Technologies. All details, inventory figures, and prices are fictional. No actual items can be purchased.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 sm:mt-24 border-t border-[#DCDDD5] pt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1C1D1A]">
              Related Everyday Objects
            </h2>
            <Link
              href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
              className="text-xs font-semibold text-[#1C1D1A] hover:underline"
            >
              See all {product.category}
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
