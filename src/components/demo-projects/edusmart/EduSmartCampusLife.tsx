"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, MapPin } from "lucide-react";

export default function EduSmartCampusLife() {
  const highlights = [
    {
      src: "/images/demo-projects/edusmart/campus-library.jpg",
      title: "Centennial Research Library",
      category: "Academic Study & Archives",
      description: "Quiet contemplation bays, collaborative workstations, and curated digital academic repositories.",
    },
    {
      src: "/images/demo-projects/edusmart/campus-creative-lab.jpg",
      title: "Innovation & Design Labs",
      category: "Makerspaces & Studios",
      description: "Equipped with rapid physical prototyping, computational modelling suites, and workshop zones.",
    },
    {
      src: "/images/demo-projects/edusmart/campus-quad.jpg",
      title: "The Quad & Open Commons",
      category: "Community & Green Space",
      description: "Shaded walkways and open air amphitheatre designed for informal student gatherings.",
    },
  ];

  return (
    <section
      id="campus-life"
      aria-labelledby="campus-life-heading"
      className="relative bg-[#F7F3EB] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Campus Environment</span>
          </div>

          <h2
            id="campus-life-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            A Place to Learn, Create, and Connect
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80 leading-relaxed">
            Our campus brings together contemplative natural grounds with state-of-the-art
            collaborative studios designed to cultivate everyday camaraderie and deep study.
          </p>
        </div>

        {/* 3 Editorial Campus Highlights */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-3xl border border-[#E8E1EB] bg-white shadow-sm transition-all hover:border-[#33243B]/40 hover:shadow-md"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#33243B] backdrop-blur-sm">
                  {item.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-[#27232A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#27232A]/75 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
