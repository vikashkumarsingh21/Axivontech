"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useNovaCart } from "@/context/NovaCartContext";
import { formatPrice } from "@/data/novacart-data";

export default function NovaCartCheckoutPage() {
  const router = useRouter();
  const {
    cart,
    isHydrated,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total,
    clearCart,
  } = useNovaCart();

  // Transient form state (never stored in localStorage)
  const [formData, setFormData] = useState({
    email: "alex.morgan@example.com",
    phone: "+91 98765 43210",
    fullName: "Alex Morgan",
    address: "42, 100 Feet Road, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560038",
    deliveryOption: "standard",
    paymentMethod: "upi",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee =
    formData.deliveryOption === "express"
      ? (shipping || 0) + 299
      : shipping;

  const finalOrderTotal = Math.max(0, subtotal - discount + deliveryFee);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errs.email = "Valid email is required";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required for dispatch notification";
    }
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!formData.address.trim()) {
      errs.address = "Street address is required";
    }
    if (!formData.city.trim()) {
      errs.city = "City is required";
    }
    if (!formData.state.trim()) {
      errs.state = "State is required";
    }
    if (!formData.postalCode.trim()) {
      errs.postalCode = "PIN code is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Save transient summary for confirmation screen in sessionStorage only
    try {
      const summaryPayload = {
        fullName: formData.fullName,
        email: formData.email,
        itemCount: cart.reduce((a, b) => a + b.quantity, 0),
        itemsSummary: cart.map((i) => ({
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price,
          variant: i.selectedColor || i.selectedSize,
        })),
        total: finalOrderTotal,
        paymentMethod: formData.paymentMethod.toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      sessionStorage.setItem("novacart_demo_order_summary", JSON.stringify(summaryPayload));
    } catch {
      // Ignore sessionStorage errors
    }

    // Deliberate simulated delay then clear cart and redirect
    setTimeout(() => {
      clearCart();
      router.push("/demo-projects/ecommerce/novacart/order-confirmation");
    }, 600);
  };

  if (!isHydrated) {
    return (
      <div className="py-16 text-center text-sm text-[#696D66]">
        Preparing checkout interface...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-[#E8EBE3] text-[#1C1D1A]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#1C1D1A]">Your cart is empty</h1>
          <p className="mt-1 text-xs text-[#696D66]">
            Cannot proceed to checkout without any products in your bag.
          </p>
          <Link
            href="/demo-projects/ecommerce/novacart/shop"
            className="mt-6 inline-flex rounded-md bg-[#1C1D1A] px-5 py-2.5 text-xs font-bold text-[#D8F16A]"
          >
            Browse Store Catalogue
          </Link>
        </div>
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
          <Link href="/demo-projects/ecommerce/novacart/cart" className="hover:text-[#1C1D1A]">
            Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1C1D1A]" aria-current="page">
            Demo Checkout
          </span>
        </nav>

        {/* Demo Notice Banner */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#DCDDD5] bg-[#E8EBE3] p-4 text-xs text-[#1C1D1A]">
          <Info className="h-5 w-5 shrink-0 text-[#1C1D1A] mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Demonstration Checkout Process</p>
            <p className="text-[#696D66] leading-relaxed">
              This checkout is a frontend simulation. No actual payment gateways (Razorpay, Stripe) are connected. No cards or real money will be charged, and personal shipping information is not stored.
            </p>
          </div>
        </div>

        {/* Form and Summary Grid */}
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Multi-Section Form (7 cols) */}
          <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-8">
            {/* Section A: Contact Information */}
            <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1C1D1A]">
                1. Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="chk-email" className="block text-xs font-semibold text-[#1C1D1A]">
                    Email Address *
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                  />
                  {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-semibold text-[#1C1D1A]">
                    Mobile Phone *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                  />
                  {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Section B: Shipping Address */}
            <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1C1D1A]">
                2. Shipping Address
              </h2>
              <div>
                <label htmlFor="chk-name" className="block text-xs font-semibold text-[#1C1D1A]">
                  Full Recipient Name *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                />
                {errors.fullName && <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="chk-addr" className="block text-xs font-semibold text-[#1C1D1A]">
                  Street Address & Apartment/Suite *
                </label>
                <input
                  id="chk-addr"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                />
                {errors.address && <p className="mt-1 text-[11px] text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="chk-city" className="block text-xs font-semibold text-[#1C1D1A]">
                    City *
                  </label>
                  <input
                    id="chk-city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                  />
                  {errors.city && <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="chk-state" className="block text-xs font-semibold text-[#1C1D1A]">
                    State *
                  </label>
                  <input
                    id="chk-state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                  />
                  {errors.state && <p className="mt-1 text-[11px] text-red-600">{errors.state}</p>}
                </div>
                <div>
                  <label htmlFor="chk-pin" className="block text-xs font-semibold text-[#1C1D1A]">
                    PIN Code *
                  </label>
                  <input
                    id="chk-pin"
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2 text-xs text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                  />
                  {errors.postalCode && <p className="mt-1 text-[11px] text-red-600">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* Section C: Delivery Options */}
            <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1C1D1A]">
                3. Delivery Method
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.deliveryOption === "standard"
                      ? "border-[#1C1D1A] bg-[#F7F7F2]"
                      : "border-[#DCDDD5] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="standard"
                      checked={formData.deliveryOption === "standard"}
                      onChange={() => setFormData({ ...formData, deliveryOption: "standard" })}
                      className="text-[#1C1D1A] focus:ring-[#1C1D1A]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1C1D1A]">
                        Standard Air Cargo (3–5 Business Days)
                      </p>
                      <p className="text-[11px] text-[#696D66]">
                        Dispatched via Delhivery / BlueDart network
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#1C1D1A]">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.deliveryOption === "express"
                      ? "border-[#1C1D1A] bg-[#F7F7F2]"
                      : "border-[#DCDDD5] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="express"
                      checked={formData.deliveryOption === "express"}
                      onChange={() => setFormData({ ...formData, deliveryOption: "express" })}
                      className="text-[#1C1D1A] focus:ring-[#1C1D1A]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1C1D1A]">
                        Priority Expedited (1–2 Business Days)
                      </p>
                      <p className="text-[11px] text-[#696D66]">
                        Same-day dispatch with priority air transit
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#1C1D1A]">
                    +{formatPrice(299)}
                  </span>
                </label>
              </div>
            </div>

            {/* Section D: Payment Method (Demonstration Only) */}
            <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1C1D1A]">
                4. Simulated Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "upi", label: "UPI (Google Pay / PhonePe / Paytm - Demo)", desc: "Simulated instant UPI approval" },
                  { id: "card", label: "Credit / Debit Card (Demo Sandbox)", desc: "Mock Visa / Mastercard processing" },
                  { id: "netbanking", label: "NetBanking (HDFC / ICICI / SBI - Demo)", desc: "Simulated institutional gateway" },
                  { id: "cod", label: "Cash on Delivery (Sample COD)", desc: "Pay upon mock package arrival" },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                      formData.paymentMethod === pm.id
                        ? "border-[#1C1D1A] bg-[#F7F7F2]"
                        : "border-[#DCDDD5] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={formData.paymentMethod === pm.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      className="mt-0.5 text-[#1C1D1A] focus:ring-[#1C1D1A]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1C1D1A]">{pm.label}</p>
                      <p className="text-[11px] text-[#696D66]">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D8F16A] py-4 text-sm font-bold text-[#1C1D1A] shadow-md transition-all hover:bg-[#c9e355] hover:shadow-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
            >
              {isSubmitting ? (
                <span>Simulating Order Placement...</span>
              ) : (
                <>
                  <span>Complete Demo Checkout ({formatPrice(finalOrderTotal)})</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Right: Order Summary Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-2xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-[#1C1D1A] border-b border-[#DCDDD5] pb-3">
                Order Items ({cart.length})
              </h2>

              {/* Items scroll */}
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#F7F7F2] border border-[#DCDDD5]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.imageAlt}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1C1D1A] text-[9px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 text-xs">
                      <p className="font-bold text-[#1C1D1A] line-clamp-1">{item.product.name}</p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-[10px] text-[#696D66]">
                          {item.selectedColor} {item.selectedSize && `· ${item.selectedSize}`}
                        </p>
                      )}
                    </div>

                    <p className="text-xs font-bold text-[#1C1D1A] shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="border-t border-[#DCDDD5] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#696D66]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1C1D1A]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#696D66]">
                  <span>Delivery ({formData.deliveryOption})</span>
                  <span className="font-semibold text-[#1C1D1A]">
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-[#DCDDD5] pt-3 flex justify-between text-base font-black text-[#1C1D1A]">
                  <span>Estimated Total</span>
                  <span>{formatPrice(finalOrderTotal)}</span>
                </div>
              </div>

              {/* Demo Guarantee Badge */}
              <div className="rounded-lg bg-[#E8EBE3]/60 p-3 text-[11px] text-[#696D66] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#1C1D1A]">
                  <ShieldCheck className="h-4 w-4 text-[#1C1D1A]" />
                  <span>100% Simulated Safe Environment</span>
                </div>
                <p>
                  No real bank accounts or financial credentials required. Designed for Axivon Technologies portfolio verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
