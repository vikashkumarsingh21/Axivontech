"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { Product, formatPrice } from "@/data/novacart-data";
import { useNovaCart } from "@/context/NovaCartContext";

export interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useNovaCart();
  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#DCDDD5] bg-white transition-all duration-300 hover:border-[#1C1D1A] hover:shadow-xl">
      {/* Product Image Frame */}
      <Link
        href={`/demo-projects/ecommerce/novacart/products/${product.slug}`}
        className="relative aspect-4/5 w-full overflow-hidden bg-[#F7F7F2]"
      >
        <Image
          src={product.images[0]}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="rounded-full bg-[#1C1D1A] px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white uppercase shadow-2xs">
              New 2026
            </span>
          )}
          {discountPercentage !== null && (
            <span className="rounded-full bg-[#D8F16A] px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-[#1C1D1A] shadow-2xs">
              Save {discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 flex h-8.5 w-8.5 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
            isWishlisted
              ? "bg-[#1C1D1A] text-[#D8F16A] shadow-md scale-105"
              : "bg-white/85 text-[#1C1D1A] backdrop-blur-xs hover:bg-white hover:text-black shadow-xs hover:scale-105"
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Overlay on hover (Desktop) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 hidden sm:block opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1C1D1A] py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-[#343630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8F16A]"
          >
            <Plus className="h-4 w-4 text-[#D8F16A]" />
            <span>Quick Add · {formatPrice(product.price)}</span>
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4.5">
        {/* Category & Color indicators */}
        <div className="flex items-center justify-between text-[11px] text-[#696D66]">
          <Link
            href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#696D66] transition-colors hover:text-[#1C1D1A]"
          >
            {product.category}
          </Link>
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5" title={`${product.colors.length} shades available`}>
              {product.colors.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="font-mono text-[9px] font-bold text-[#696D66]">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link
          href={`/demo-projects/ecommerce/novacart/products/${product.slug}`}
          className="mt-2 text-sm font-bold tracking-tight text-[#1C1D1A] hover:underline underline-offset-2 line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Short description */}
        <p className="mt-1 text-xs leading-relaxed text-[#696D66] line-clamp-1">
          {product.shortDescription}
        </p>

        {/* Price and Mobile Add Button */}
        <div className="mt-4 flex items-center justify-between border-t border-[#DCDDD5]/80 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-[#1C1D1A]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#696D66] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1D1A] text-white shadow-xs transition-colors hover:bg-[#343630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4 text-[#D8F16A]" />
          </button>
        </div>
      </div>
    </div>
  );
}
