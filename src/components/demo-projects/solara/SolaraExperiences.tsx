"use client";

import React from "react";
import Image from "next/image";
import { Compass, Sparkles, Moon, Coffee, Palette, Trees } from "lucide-react";

export default function SolaraExperiences() {
  const experiences = [
    {
      title: "Dark Sky Stargazing Observatory",
      category: "Astronomy",
      time: "8:30 PM – 10:00 PM (Clear Nights)",
      icon: Moon,
      image: "/demo-assets/hospitality/solara/stargazing-deck.webp",
      description:
        "Far removed from urban light pollution at 1,850m elevation, Solara’s timber observatory deck features an 11-inch Schmidt-Cassegrain telescope and an astronomer guide to observe Saturn’s rings, nebulae, and stellar constellations.",
    },
    {
      title: "Canopy Biodiversity Walk & Stream Trek",
      category: "Nature",
      time: "6:30 AM & 4:00 PM Daily",
      icon: Trees,
      image: "/demo-assets/hospitality/solara/hero-resort.webp",
      description:
        "Explore private nature trails through primeval Shola forests. Discover endemic orchids, rare hornbills, medicinal ferns, and secluded natural mountain pools with our resident botanist.",
    },
    {
      title: "Estate Coffee Roasting & Botanical Tea Walk",
      category: "Culinary",
      time: "11:00 AM – 12:30 PM",
      icon: Coffee,
      image: "/demo-assets/hospitality/solara/harvest-dining.webp",
      description:
        "Trace the aroma of shade-grown Arabica from estate bushes to manual roasting drums. Sample single-estate pour-overs alongside wild mountain forest honey harvested by indigenous tribes.",
    },
    {
      title: "Clay Studio & Traditional Hand Pottery",
      category: "Culture",
      time: "3:00 PM – 4:30 PM",
      icon: Palette,
      image: "/demo-assets/hospitality/solara/ayurvedic-spa.webp",
      description:
        "Sit at a manual pottery wheel under an open-air thatch pavilion. Learn the meditative art of shaping river clay into planters, tea bowls, and traditional oil lamps.",
    },
  ];

  return (
    <section id="experiences" className="py-20 bg-[#faf8f5] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            Immersion &amp; Wonder
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
            Curated Wilderness &amp; Cultural Escapes
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b665f]">
            Beyond relaxation, Solara invites you to forge meaningful bonds with mountain biodiversity, rural artisan traditions, and the silent cosmos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiences.map((exp, i) => {
            const Icon = exp.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-[#dfd7cc] bg-[#f5efeb] overflow-hidden shadow-sm transition-all hover:border-[#b57a42]/40 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-[#1f2e23]">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/20">
                      {exp.category}
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-full bg-[#1f2e23]/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#c48b56]">
                      {exp.time}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f2e23] text-[#c48b56]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#1f2e23]">
                        {exp.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#6b665f]">
                      {exp.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-0 flex items-center justify-between text-xs text-[#1f2e23] border-t border-[#ede5db]">
                  <span className="font-semibold text-[#b57a42]">
                    ● Included with all Multi-Night Stays
                  </span>
                  <span className="text-[11px] text-[#6b665f]">
                    Pre-booking advised
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
