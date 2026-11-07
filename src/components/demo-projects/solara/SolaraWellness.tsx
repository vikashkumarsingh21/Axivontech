"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Heart, Sun, Droplets, CheckCircle2 } from "lucide-react";

export default function SolaraWellness() {
  const therapies = [
    {
      title: "Traditional Abhyanga & Shirodhara",
      duration: "90 Minutes",
      focus: "Nervous System Reset & Deep Cellular Rejuvenation",
      description:
        "Full-body rhythmic synchronized massage using warm, cold-pressed medicinal oils infused with 28 forest herbs, followed by a continuous soothing stream of herbal oil over the third eye center.",
      benefits: ["Alleviates deep muscular tension", "Calms sleep disorders and sensory overload", "Balances Vata & Pitta doshas"],
    },
    {
      title: "Shinrin-Yoku (Forest Canopy Immersion)",
      duration: "120 Minutes",
      focus: "Immune Enhancement & Eco-Mindfulness",
      description:
        "A guided contemplative walk through our protected rainforest canopy led by our naturalist and certified mindfulness guide, immersing the senses in natural phytoncides that measurably lower cortisol.",
      benefits: ["Lowers baseline heart rate & blood pressure", "Boosts natural killer (NK) immune cell activity", "Cultivates profound mental clarity"],
    },
    {
      title: "Sunrise Prana & Kundalini Yoga",
      duration: "60 Minutes",
      focus: "Vital Energy Activation & Mobility",
      description:
        "Greet the morning mountain sunrise on our open-air teak yoga deck overlooking the mist-filled valley. Suitable for both beginners and experienced practitioners.",
      benefits: ["Spinal alignment and joint mobility", "Pranayama breath expansion", "Energizing morning awakening"],
    },
    {
      title: "Cedar Hot Soak & Herbal Steam Bath",
      duration: "45 Minutes",
      focus: "Detoxification & Lymphatic Circulation",
      description:
        "Private Japanese-style aromatic cedar tubs filled with wild mountain spring water, eucalyptus leaves, and organic vetiver root to encourage deep cutaneous detoxification.",
      benefits: ["Purifies skin tissue", "Stimulates lymphatic drainage", "Relieves joint stiffness"],
    },
  ];

  return (
    <section id="wellness" className="py-20 bg-[#f5efeb] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            Holistic Healing Sanctuary
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
            Ayurveda, Mountain Prana &amp; Thermal Wellness
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b665f]">
            Under the guidance of our resident Ayurvedic Vaidya and holistic therapists, Solara offers bespoke wellness paths tailored to your body constitution and mental recovery.
          </p>
        </div>

        {/* Visual & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-14">
          <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden border-4 border-[#faf8f5] shadow-xl bg-[#1f2e23]">
            <Image
              src="/demo-assets/hospitality/solara/ayurvedic-spa.webp"
              alt="Ayurvedic Spa and Floating Lotus Water Basin at Solara"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          <div className="lg:col-span-7">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b57a42]">
              Therapeutic Lineage
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1f2e23] mt-1">
              Ancient Wisdom in Modern Sanctuary
            </h3>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#6b665f]">
              Our therapy oils are custom-formulated in small batches using herbs harvested ethically from the Western Ghats biodiversity hotspot. Each therapy takes place in standalone open-air wooden pavilions surrounded by bamboo groves and flowing mountain water.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#3b3630]">
              <div className="rounded-xl bg-[#ede5db] p-4">
                <strong className="block text-[#1f2e23] mb-1 font-semibold">
                  Personalized Dosha Diagnosis:
                </strong>
                Every guest receives a 30-minute private consultation with our Vaidya to determine optimal diet, therapies, and botanical infusions.
              </div>
              <div className="rounded-xl bg-[#ede5db] p-4">
                <strong className="block text-[#1f2e23] mb-1 font-semibold">
                  100% Organic Formulations:
                </strong>
                Completely devoid of synthetic mineral oils, parabens, artificial fragrances, or chemical solvents.
              </div>
            </div>
          </div>
        </div>

        {/* Therapies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {therapies.map((therapy, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#dfd7cc] bg-[#faf8f5] p-6 sm:p-7 shadow-sm transition-all hover:border-[#b57a42]/40"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-serif text-lg font-bold text-[#1f2e23]">
                  {therapy.title}
                </h4>
                <span className="rounded-full bg-[#1f2e23] text-[#c48b56] px-3 py-1 text-[11px] font-bold">
                  {therapy.duration}
                </span>
              </div>

              <p className="text-xs font-semibold text-[#b57a42] mb-3">
                Focus: {therapy.focus}
              </p>

              <p className="text-xs leading-relaxed text-[#6b665f] mb-4">
                {therapy.description}
              </p>

              <div className="space-y-1.5 border-t border-[#ede5db] pt-3 text-xs text-[#3b3630]">
                {therapy.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#b57a42] shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
