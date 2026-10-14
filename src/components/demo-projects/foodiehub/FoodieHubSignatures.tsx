"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SIGNATURE_DISHES } from "@/data/foodiehub-data";
import { Sparkles, ArrowRight, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodieHubSignatures() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  function handleImageError(id: string) {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <section
      id="signatures"
      aria-labelledby="signatures-heading"
      className="relative border-t border-[#D4C9B9] bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
            <span>Culinary Centrepieces</span>
          </div>

          <h2
            id="signatures-heading"
            className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            The Signatures
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#6B6560]">
            Three definitive recipes that ground Saffron & Stone's identity—celebrating the
            scorching heat of the tandoor, the patient eighteen-hour coal simmer, and the sweet perfume
            of Pampore saffron.
          </p>
        </div>

        {/* 3 Featured Dishes with Distinct Editorial Layouts */}
        <div className="mt-16 space-y-16">
          {SIGNATURE_DISHES.map((dish, index) => {
            const isReversed = index % 2 !== 0;
            const numberLabel = `0${index + 1}`;

            return (
              <motion.article
                key={dish.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className={`grid items-center gap-8 rounded-3xl border border-[#D4C9B9] bg-[#F8F3EA]/70 p-6 sm:p-10 lg:grid-cols-12 lg:gap-14 ${
                  isReversed ? "lg:bg-[#F0E8DA]/50" : ""
                }`}
              >
                {/* Image Column */}
                <div
                  className={`relative overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] shadow-lg lg:col-span-6 ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  {!imageErrors[dish.id] ? (
                    <Image
                      src={dish.imageSrc}
                      alt={dish.name}
                      width={700}
                      height={500}
                      onError={() => handleImageError(dish.id)}
                      className="h-[320px] sm:h-[400px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-[320px] sm:h-[400px] w-full flex-col items-center justify-center bg-gradient-to-br from-[#F0E8DA] to-[#E8DFC9] p-8 text-center">
                      <Award className="h-12 w-12 text-[#B85C38] mb-3" />
                      <span className="font-serif text-xl font-bold text-[#24221F]">{dish.name}</span>
                      <span className="text-xs uppercase tracking-widest text-[#6B6560] mt-1">{dish.subtitle}</span>
                    </div>
                  )}

                  {/* Editorial pill tag */}
                  <div className="absolute top-4 left-4 rounded-full border border-[#D4C9B9] bg-[#F8F3EA]/90 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#24221F] backdrop-blur-sm">
                    {dish.categoryLabel}
                  </div>

                  <div className="absolute bottom-4 right-4 rounded-full bg-[#24221F]/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#C4964C] backdrop-blur-sm">
                    Signature #{numberLabel}
                  </div>
                </div>

                {/* Content Column */}
                <div
                  className={`lg:col-span-6 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#C4964C]">
                      {numberLabel} / CULINARY SIGNATURE
                    </span>
                  </div>

                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24221F]">
                    {dish.name}
                  </h3>

                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#B85C38]">
                    {dish.subtitle}
                  </p>

                  <p className="mt-4 text-base text-[#6B6560] leading-relaxed">
                    {dish.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-[#B85C38]">
                      ₹{dish.price}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-[#9E9790]">
                      Portion for sharing
                    </span>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <a
                      href="#menu"
                      className="group inline-flex items-center gap-2 rounded-full border border-[#D4C9B9] bg-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#24221F] transition-all hover:border-[#B85C38] hover:text-[#B85C38]"
                    >
                      <span>Explore in Menu</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
