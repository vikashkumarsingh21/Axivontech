"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  X,
  AlertCircle,
} from "lucide-react";
import { useNovaCart } from "@/context/NovaCartContext";
import { formatPrice } from "@/data/novacart-data";

export default function NovaCartCartPage() {
  const {
    cart,
    isHydrated,
    totalCartQuantity,
    subtotal,
    shipping,
    discount,
    total,
    appliedPromo,
    promoError,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useNovaCart();

  const [promoInput, setPromoInput] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      const success = applyPromoCode(promoInput.trim());
      if (success) setPromoInput("");
    }
  };

  if (!isHydrated) {
    return (
      <div className="py-16 text-center text-sm text-[#696D66]">
        Loading your shopping bag...
      </div>
    );
  }

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
            Shopping Cart
          </span>
        </nav>

        {/* Header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCDDD5] pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-[#696D66]">
              {cart.length > 0
                ? `${totalCartQuantity} items in your bag`
                : "Your bag is currently empty"}
            </p>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-[#696D66] hover:text-red-600 transition-colors"
            >
              Clear entire cart
            </button>
          )}
        </div>

        {/* Main Body */}
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCDDD5] bg-white p-12 sm:p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F7F2] text-[#696D66]">
              <ShoppingBag className="h-8 w-8 text-[#696D66]" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#1C1D1A]">
              Your bag is empty
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#696D66] max-w-sm">
              Explore our collection of thoughtful accessories, carry goods, and modern workspace essentials.
            </p>
            <Link
              href="/demo-projects/ecommerce/novacart/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1C1D1A] px-6 py-3 text-xs font-bold text-[#D8F16A] hover:bg-[#343630] transition-colors"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[#DCDDD5] bg-white p-4 transition-all hover:border-[#1C1D1A]/30 shadow-xs"
                >
                  {/* Thumbnail & Product Details */}
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/demo-projects/ecommerce/novacart/products/${item.product.slug}`}
                      className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F7F7F2] border border-[#DCDDD5]"
                    >
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.imageAlt}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#696D66]">
                        {item.product.category}
                      </span>
                      <Link
                        href={`/demo-projects/ecommerce/novacart/products/${item.product.slug}`}
                        className="block text-sm font-bold text-[#1C1D1A] hover:underline"
                      >
                        {item.product.name}
                      </Link>

                      {/* Variant Info */}
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="mt-0.5 text-xs text-[#696D66]">
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          {item.selectedColor && item.selectedSize && <span> · </span>}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </p>
                      )}

                      <p className="mt-1 text-xs font-semibold text-[#1C1D1A]">
                        {formatPrice(item.product.price)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-[#DCDDD5]">
                    {/* Quantity Selector */}
                    <div className="flex h-9 items-center rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-[#1C1D1A] hover:text-[#696D66]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#1C1D1A]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-[#1C1D1A] hover:text-[#696D66]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Total */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-bold text-[#1C1D1A]">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-[#696D66] hover:text-red-600 transition-colors"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/demo-projects/ecommerce/novacart/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1D1A] hover:underline"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  <span>Continue Shopping Catalogue</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-6">
                <h2 className="text-base font-bold text-[#1C1D1A] border-b border-[#DCDDD5] pb-3">
                  Order Summary
                </h2>

                {/* Subtotals breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[#696D66]">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#1C1D1A]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#696D66]">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-[#1C1D1A]">
                      {shipping === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE (₹2k+ threshold)</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="border-t border-[#DCDDD5] pt-3 flex justify-between text-sm font-black text-[#1C1D1A]">
                    <span>Estimated Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Simulated Coupon Input */}
                <div className="border-t border-[#DCDDD5] pt-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between rounded-lg bg-[#E8EBE3] p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#1C1D1A]">
                        <Tag className="h-3.5 w-3.5 text-[#1C1D1A]" />
                        <span>Code &quot;{appliedPromo.code}&quot; active</span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-red-600 hover:text-red-800 p-1"
                        aria-label="Remove applied coupon"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="space-y-2">
                      <label htmlFor="cart-coupon" className="text-xs font-semibold text-[#1C1D1A]">
                        Sample Discount Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="cart-coupon"
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Try WELCOME10 or NOVAFIRST"
                          className="flex-1 rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3 py-2 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none uppercase"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-[#1C1D1A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#343630]"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{promoError}</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Checkout CTA */}
                <div className="pt-2">
                  <Link
                    href="/demo-projects/ecommerce/novacart/checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#D8F16A] py-3.5 text-sm font-bold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#c9e355] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
                  >
                    <span>Proceed to Demo Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <p className="mt-3 text-center text-[11px] text-[#696D66]">
                    Frontend demonstration only. No real charges or payment credentials will be requested.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
