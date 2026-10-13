"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useNovaCart } from "@/context/NovaCartContext";
import { getProductById } from "@/data/novacart-data";
import ProductCard from "@/components/demo-projects/novacart/ProductCard";

export default function NovaCartWishlistPage() {
  const { wishlist, isHydrated, toggleWishlist, addToCart } = useNovaCart();

  const savedProducts = wishlist
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#696D66]">
          <Link href="/demo-projects/ecommerce/novacart" className="hover:text-[#1C1D1A]">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1C1D1A]" aria-current="page">
            Wishlist
          </span>
        </nav>

        {/* Page Header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCDDD5] pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
              Saved Wishlist
            </h1>
            <p className="mt-1 text-sm text-[#696D66]">
              {isHydrated
                ? `${savedProducts.length} ${savedProducts.length === 1 ? "item" : "items"} saved for later review`
                : "Loading your saved items..."}
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                savedProducts.forEach((p) => addToCart(p, 1));
              }}
              className="inline-flex items-center gap-2 rounded-md bg-[#1C1D1A] px-4 py-2 text-xs font-bold text-[#D8F16A] hover:bg-[#343630] transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add All to Cart</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          {!isHydrated ? (
            <div className="p-12 text-center text-sm text-[#696D66]">
              Checking saved preferences...
            </div>
          ) : savedProducts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCDDD5] bg-white p-12 sm:p-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F7F2] text-[#696D66]">
                <Heart className="h-7 w-7 text-[#696D66]" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#1C1D1A]">
                Your wishlist is currently empty
              </h2>
              <p className="mt-1.5 text-xs text-[#696D66] max-w-sm">
                As you browse our curated catalogue, tap the heart icon on any product to save it here for later consideration.
              </p>
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1C1D1A] px-6 py-3 text-xs font-bold text-[#D8F16A] hover:bg-[#343630] transition-colors"
              >
                <span>Discover Products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {/* Remove from wishlist action button */}
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#696D66] hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove item</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
