"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";
import { formatPrice } from "@/data/novacart-data";

interface OrderSummary {
  fullName: string;
  email: string;
  itemCount: number;
  itemsSummary: {
    name: string;
    qty: number;
    price: number;
    variant?: string;
  }[];
  total: number;
  paymentMethod: string;
  timestamp: string;
}

export default function NovaCartOrderConfirmationPage() {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("novacart_demo_order_summary");
      if (raw) {
        setSummary(JSON.parse(raw));
      }
    } catch {
      // Ignore sessionStorage issues
    } finally {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[#DCDDD5] bg-white p-6 sm:p-10 shadow-sm text-center">
          {/* Animated checkmark circle */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D8F16A] text-[#1C1D1A]">
            <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
          </div>

          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
            Demo Checkout Completed
          </h1>

          {/* Honest Demo Disclosure */}
          <div className="mt-4 rounded-xl bg-[#E8EBE3] p-4 text-xs text-[#1C1D1A] text-left leading-relaxed">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#1C1D1A] mt-0.5" />
              <div>
                <p className="font-bold">Frontend Demonstration Notice</p>
                <p className="mt-0.5 text-[#696D66]">
                  This is a frontend demonstration created by Axivon Technologies. <strong>No order has been placed and no payment has been processed.</strong> All product definitions, mock inventories, and financial totals are illustrative.
                </p>
              </div>
            </div>
          </div>

          {/* Transient Summary (if present) */}
          {loaded && summary && (
            <div className="mt-6 rounded-xl border border-[#DCDDD5] bg-[#F7F7F2] p-5 text-left text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#696D66]">
                    Demo Session Reference
                  </p>
                  <p className="font-bold text-[#1C1D1A] text-sm">NC-SIMULATED-{summary.timestamp}</p>
                </div>
                <span className="rounded-full bg-[#1C1D1A] px-2.5 py-0.5 text-[10px] font-bold text-[#D8F16A]">
                  Simulated Success
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#696D66]">Customer Name:</p>
                  <p className="font-semibold text-[#1C1D1A]">{summary.fullName}</p>
                </div>
                <div>
                  <p className="text-[#696D66]">Delivery Email:</p>
                  <p className="font-semibold text-[#1C1D1A]">{summary.email}</p>
                </div>
                <div>
                  <p className="text-[#696D66]">Payment Choice:</p>
                  <p className="font-semibold text-[#1C1D1A]">{summary.paymentMethod} (Sandbox)</p>
                </div>
                <div>
                  <p className="text-[#696D66]">Demonstrated Total:</p>
                  <p className="font-bold text-sm text-[#1C1D1A]">{formatPrice(summary.total)}</p>
                </div>
              </div>

              {summary.itemsSummary && summary.itemsSummary.length > 0 && (
                <div className="border-t border-[#DCDDD5] pt-3">
                  <p className="font-bold text-[#1C1D1A] mb-2">Simulated Line Items:</p>
                  <ul className="space-y-1.5 text-[#696D66]">
                    {summary.itemsSummary.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {item.name} {item.variant && `(${item.variant})`} × {item.qty}
                        </span>
                        <span className="font-medium text-[#1C1D1A]">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/demo-projects/ecommerce/novacart/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#1C1D1A] px-6 py-3 text-xs font-bold text-[#D8F16A] hover:bg-[#343630] transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo-projects/ecommerce/novacart"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-[#DCDDD5] bg-white px-5 py-3 text-xs font-semibold text-[#1C1D1A] hover:bg-[#E8EBE3] transition-colors"
            >
              Storefront Home
            </Link>

            <Link
              href="/demo-projects"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-[#DCDDD5] bg-white px-5 py-3 text-xs font-semibold text-[#696D66] hover:text-[#1C1D1A] hover:bg-[#E8EBE3] transition-colors"
            >
              All Demo Projects
            </Link>
          </div>

          {/* Parent Agency Banner */}
          <div className="mt-8 border-t border-[#DCDDD5] pt-6 flex flex-col items-center">
            <p className="text-xs text-[#696D66]">
              Looking to develop a custom lifestyle or D2C e-commerce platform?
            </p>
            <Link
              href="/contact?project=NovaCart#contact-form"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1D1A] hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#1C1D1A]" />
              <span>Discuss an E-Commerce Project with Axivon</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
