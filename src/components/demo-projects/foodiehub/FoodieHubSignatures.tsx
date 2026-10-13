"use client";

import React from "react";
import Image from "next/image";
import { SIGNATURE_DISHES } from "@/data/foodiehub-data";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FoodieHubSignatures() {
  return (
    <section
      id="signatures"
      aria-labelledby="signatures-heading"
      className="relative border-t border-[#E8DFC9] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
            <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
            <span>Culinary Centrepieces</span>
          </div>

          <h2
            id="signatures-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            Signature Dishes
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#24221F]/80">
            Three iconic recipes that define Saffron & Stone's culinary identity—celebrating
            the craft of the tandoor, the patience of the simmer, and the sweet perfume of saffron.
          </p>
        </div>

        {/* 3 Featured Dishes with Distinct Editorial Layouts */}
        <div className="mt-14 space-y-16">
          {SIGNATURE_DISHES.map((dish, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <article
                key={dish.id}
                className={`grid items-center gap-8 rounded-3xl border border-[#E8DFC9] bg-[#F8F3EA]/60 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12 ${
                  isReversed ? "lg:bg-white" : ""
                }`}
              >
                {/* Image Column */}
                <div
                  className={`relative overflow-hidden rounded-2xl border border-[#E0D4BE] shadow-md lg:col-span-6 ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <Image
                    src={dish.imageSrc}
                    alt={dish.name}
                    width={700}
                    height={500}
                    className="h-[300px] sm:h-[380px] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#68735A] backdrop-blur-sm border border-[#E8DFC9]">
                    {dish.categoryLabel}
                  </div>
                </div>

                {/* Content Column */}
                <div
                  className={`lg:col-span-6 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-[#B85C38]">
                    {dish.subtitle}
                  </p>

                  <div className="mt-2 flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#24221F]">
                      {dish.name}
                    </h3>
                    <span className="shrink-0 font-serif text-2xl font-bold text-[#B85C38]">
                      ₹{dish.price}
                    </span>
                  </div>

                  <p className="mt-4 text-base text-[#24221F]/80 leading-relaxed">
                    {dish.description}
                  </p>

                  <div className="mt-8">
                    <a
                      href="#menu"
                      className="group inline-flex items-center gap-2 rounded-full border border-[#24221F]/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#24221F] transition-all hover:border-[#B85C38] hover:text-[#B85C38]"
                    >
                      <span>View in Full Menu</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
