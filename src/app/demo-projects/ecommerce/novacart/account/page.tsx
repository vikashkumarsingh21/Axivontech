"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Info,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useNovaCart } from "@/context/NovaCartContext";
import { formatPrice } from "@/data/novacart-data";

export default function NovaCartAccountPage() {
  const { wishlist, totalCartQuantity } = useNovaCart();
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");

  const sampleDemoOrders = [
    {
      id: "DEMO-ORD-8942",
      date: "04 October 2026",
      items: "Minimalist Matte Chrono Watch (Slate Black)",
      total: 4499,
      status: "Delivered (Sample)",
      isComplete: true,
    },
    {
      id: "DEMO-ORD-7619",
      date: "18 September 2026",
      items: "Aeroflex Commuter Backpack 22L (Matte Black)",
      total: 5999,
      status: "Delivered (Sample)",
      isComplete: true,
    },
  ];

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
            Customer Account (Demo)
          </span>
        </nav>

        {/* Demo Notice Banner */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#DCDDD5] bg-white p-4 shadow-xs">
          <Info className="h-5 w-5 shrink-0 text-[#1C1D1A] mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#1C1D1A]">Demonstration Profile Interface: </span>
            <span className="text-[#696D66]">
              This screen showcases how customer profile data, previous purchase logs, and address management interfaces can be structured in a custom storefront created by Axivon Technologies.
            </span>
          </div>
        </div>

        {/* Profile Header */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-[#DCDDD5] bg-[#E8EBE3]/50 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1D1A] text-xl font-bold text-[#D8F16A]">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1D1A]">
                  Alex Morgan
                </h1>
                <span className="rounded-full bg-[#1C1D1A] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  Demo Client
                </span>
              </div>
              <p className="text-xs text-[#696D66] mt-0.5">alex.morgan@example.com · Bangalore, India</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/demo-projects/ecommerce/novacart/wishlist"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#DCDDD5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1D1A] hover:bg-[#E8EBE3]"
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
            <Link
              href="/demo-projects/ecommerce/novacart/cart"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1C1D1A] px-3.5 py-2 text-xs font-semibold text-[#D8F16A] hover:bg-[#343630]"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Active Cart ({totalCartQuantity})</span>
            </Link>
          </div>
        </div>

        {/* Account Tabs & Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Navigation Sidebar (3 cols) */}
          <aside className="lg:col-span-3">
            <div className="rounded-xl border border-[#DCDDD5] bg-white p-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === "orders"
                    ? "bg-[#1C1D1A] text-white"
                    : "text-[#696D66] hover:bg-[#F7F7F2] hover:text-[#1C1D1A]"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Demo Order History</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === "profile"
                    ? "bg-[#1C1D1A] text-white"
                    : "text-[#696D66] hover:bg-[#F7F7F2] hover:text-[#1C1D1A]"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Account Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === "addresses"
                    ? "bg-[#1C1D1A] text-white"
                    : "text-[#696D66] hover:bg-[#F7F7F2] hover:text-[#1C1D1A]"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Saved Shipping Addresses</span>
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-[#DCDDD5] bg-[#E8EBE3]/50 p-4">
              <p className="text-xs font-bold text-[#1C1D1A]">Have a question?</p>
              <p className="mt-1 text-[11px] text-[#696D66]">
                Our concierge service is available weekdays 9am–6pm IST.
              </p>
              <Link
                href="/contact?project=NovaCart#contact-form"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1C1D1A] hover:underline"
              >
                <span>Contact customer care</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* Main Tab Panels (9 cols) */}
          <div className="lg:col-span-9">
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1C1D1A]">
                    Demonstration Purchase Log
                  </h2>
                  <span className="text-xs text-[#696D66]">Sample illustrative records</span>
                </div>

                <div className="space-y-3">
                  {sampleDemoOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-xl border border-[#DCDDD5] bg-white p-5 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCDDD5] pb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1C1D1A]">{ord.id}</span>
                          <span className="text-[#696D66]">· {ord.date}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{ord.status}</span>
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#1C1D1A]">{ord.items}</p>
                          <p className="text-xs text-[#696D66]">Courier: Delhivery Express Air</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1C1D1A]">{formatPrice(ord.total)}</p>
                          <span className="text-[11px] text-[#696D66]">Paid (Demonstration)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="rounded-xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-[#1C1D1A]">Profile Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[#696D66] font-medium">Full Name</label>
                    <p className="mt-1 font-semibold text-[#1C1D1A]">Alex Morgan</p>
                  </div>
                  <div>
                    <label className="text-[#696D66] font-medium">Email Address</label>
                    <p className="mt-1 font-semibold text-[#1C1D1A]">alex.morgan@example.com</p>
                  </div>
                  <div>
                    <label className="text-[#696D66] font-medium">Phone</label>
                    <p className="mt-1 font-semibold text-[#1C1D1A]">+91 98765 43210</p>
                  </div>
                  <div>
                    <label className="text-[#696D66] font-medium">Preferred Currency</label>
                    <p className="mt-1 font-semibold text-[#1C1D1A]">INR (₹)</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="rounded-xl border border-[#DCDDD5] bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1C1D1A]">Saved Addresses (Sample)</h2>
                  <span className="rounded bg-[#E8EBE3] px-2 py-0.5 text-[10px] font-bold text-[#1C1D1A]">Default</span>
                </div>
                <div className="rounded-lg border border-[#DCDDD5] p-4 text-xs space-y-1">
                  <p className="font-bold text-[#1C1D1A]">Alex Morgan</p>
                  <p className="text-[#696D66]">42, 100 Feet Road, Indiranagar</p>
                  <p className="text-[#696D66]">Bangalore, Karnataka — 560038</p>
                  <p className="text-[#696D66]">Phone: +91 98765 43210</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
