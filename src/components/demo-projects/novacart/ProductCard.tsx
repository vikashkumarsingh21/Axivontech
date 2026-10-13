"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Check } from "lucide-react";
import { Product, formatPrice } from "@/data/novacart-data";
import { useNovaCart } from "@/context/NovaCartContext";

interface ProductCardProps {
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

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-[#DCDDD5] bg-white transition-all duration-300 hover:border-[#1C1D1A]/30 hover:shadow-md">
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
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="rounded-full bg-[#1C1D1A] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
              New
            </span>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="rounded-full bg-[#D8F16A] px-2.5 py-0.5 text-[10px] font-bold text-[#1C1D1A] uppercase tracking-wide">
              Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
            isWishlisted
              ? "bg-[#1C1D1A] text-[#D8F16A] shadow-md"
              : "bg-white/90 text-[#1C1D1A] backdrop-blur-xs hover:bg-white hover:text-black shadow-xs"
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick Add Overlay on hover (Desktop) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 hidden sm:block opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1C1D1A]/95 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xs transition-colors hover:bg-[#1C1D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8F16A]"
          >
            <Plus className="h-3.5 w-3.5 text-[#D8F16A]" />
            <span>Quick Add</span>
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Color indicators */}
        <div className="flex items-center justify-between text-[11px] text-[#696D66]">
          <Link
            href={`/demo-projects/ecommerce/novacart/category/${product.categorySlug}`}
            className="hover:text-[#1C1D1A] transition-colors font-medium"
          >
            {product.category}
          </Link>
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1" title={`${product.colors.length} shades available`}>
              {product.colors.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  className="h-2 w-2 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[9px] text-[#696D66]">+{product.colors.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link
          href={`/demo-projects/ecommerce/novacart/products/${product.slug}`}
          className="mt-1.5 text-sm font-semibold text-[#1C1D1A] hover:underline underline-offset-2 line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Short description */}
        <p className="mt-1 text-xs text-[#696D66] line-clamp-1">
          {product.shortDescription}
        </p>

        {/* Price and Mobile Add Button */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#DCDDD5]/60">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#1C1D1A]">
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
            className="sm:hidden flex h-7 w-7 items-center justify-center rounded-full bg-[#1C1D1A] text-white hover:bg-[#343630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-3.5 w-3.5 text-[#D8F16A]" />
          </button>
        </div>
      </div>
    </div>
  );
}
