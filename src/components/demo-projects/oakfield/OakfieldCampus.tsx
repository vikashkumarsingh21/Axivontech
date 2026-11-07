"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CampusFacility } from "./types";
import { CheckCircle2, Monitor, Cpu, BookOpen, Trophy, Music, Bus } from "lucide-react";

export default function OakfieldCampus() {
  const facilities: CampusFacility[] = [
    {
      id: "smart-classes",
      title: "Interactive Smart Classrooms",
      subtitle: "Digital Learning & Collaborative Acoustics",
      description:
        "Every learning studio features interactive 4K touch panels, ergonomic birchwood modular furniture, dual air-circulation systems, and acoustic ceiling baffles for optimal voice clarity.",
      image: "/demo-assets/education/oakfield/smart-classroom.webp",
      stats: "48 Fully Digitized Classrooms",
      highlights: [
        "75-inch ViewSonic 4K interactive display in every room",
        "Ergonomically tuned seating for student spinal posture",
        "Abundant natural daylight with energy-efficient LED daylight fixtures",
        "High-bandwidth filtered campus Wi-Fi network",
      ],
    },
    {
      id: "robotics-lab",
      title: "STEM Robotics & AI Prototyping Lab",
      subtitle: "Hands-on Engineering from Grade IV Upwards",
      description:
        "Equipped with 3D printers, laser cutters, Arduino micro-controllers, drone testing cages, and high-spec coding workstations to nurture budding inventors and engineers.",
      image: "/demo-assets/education/oakfield/stem-robotics.webp",
      stats: "32 High-Spec Workstations + 3D Printing Station",
      highlights: [
        "Dedicated Arduino, Raspberry Pi, and IoT electronics benches",
        "Dual Creality 3D printers for rapid student prototyping",
        "Python, ROS, and computational design software suite",
        "Safety-shielded soldering and mechanical assembly area",
      ],
    },
    {
      id: "library",
      title: "The Central Ashoka Library",
      subtitle: "22,000+ Volumes, Digital Archives & Quiet Carrels",
      description:
        "A double-height sanctuary of literature featuring rare regional manuscripts, young-adult fiction, academic research journals, audio-book listening pods, and quiet research carrels.",
      image: "/demo-assets/education/oakfield/school-library.webp",
      stats: "22,000+ Physical Books + JSTOR Digital Access",
      highlights: [
        "Automated RFID check-in and book reservation kiosk",
        "Dedicated cozy reading pit for kindergarten and primary children",
        "Subscription to national newspapers, JSTOR, and scientific periodicals",
        "Quiet mezzanine study carrels for Senior Secondary board students",
      ],
    },
    {
      id: "sports-complex",
      title: "Olympic-Grade Athletics Complex",
      subtitle: "400m Synthetic Track, Football Turf & Semi-Olympic Pool",
      description:
        "Physical vitality is integral to character. Our 6-acre outdoor sports hub features an all-weather 400m synthetic running track, floodlit basketball and tennis courts, and a heated 25m swimming pool.",
      image: "/demo-assets/education/oakfield/sports-ground.webp",
      stats: "6 Acres Dedicated Sports Grounds",
      highlights: [
        "400m 8-lane IAAF certified synthetic running track",
        "FIFA standard natural grass football and cricket oval",
        "Heated 25m semi-Olympic swimming pool with life-guards",
        "Two indoor wooden badminton courts and squash pavilion",
      ],
    },
  ];

  const [activeFacilityId, setActiveFacilityId] = useState("smart-classes");
  const activeFacility = facilities.find((f) => f.id === activeFacilityId) || facilities[0];

  return (
    <section id="campus" className="py-20 bg-[#f4efe4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            World-Class Infrastructure
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            A 15-Acre Green Campus Designed for Wonder
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            Nestled amid mature rain trees, our campus provides safe, modern spaces where young scholars learn, invent, play, and discover their potential.
          </p>
        </div>

        {/* Facility Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {facilities.map((fac) => {
            const isSelected = fac.id === activeFacilityId;
            return (
              <button
                key={fac.id}
                onClick={() => setActiveFacilityId(fac.id)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-[#143d30] text-[#faf8f4] shadow-md border border-[#c8a24d]/40 scale-105"
                    : "bg-[#faf8f4] text-[#4f5e55] hover:bg-[#ece4d5] hover:text-[#143d30] border border-[#dfd4c0]"
                }`}
              >
                <span>{fac.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Facility Spotlight Showcase */}
        <div className="rounded-3xl border border-[#dfd4c0] bg-[#faf8f4] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Visual Preview Left */}
            <div className="lg:col-span-7 relative aspect-[16/10] bg-[#143d30] overflow-hidden">
              <Image
                src={activeFacility.image}
                alt={activeFacility.title}
                fill
                className="object-cover object-center transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="rounded-md bg-black/70 backdrop-blur-md px-3 py-1 font-mono text-[#c8a24d]">
                  {activeFacility.stats}
                </span>
                <span className="rounded-md bg-black/70 backdrop-blur-md px-3 py-1">
                  Oakfield Campus Masterplan
                </span>
              </div>
            </div>

            {/* Details Right */}
            <div className="lg:col-span-5 p-8 sm:p-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c8a24d]">
                Featured Facility
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#143d30] mt-1">
                {activeFacility.title}
              </h3>
              <p className="text-xs font-semibold text-[#4f5e55] mt-1">
                {activeFacility.subtitle}
              </p>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#4f5e55]">
                {activeFacility.description}
              </p>

              <div className="mt-6 space-y-2 border-t border-[#ece4d5] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#143d30]">
                  Key Architectural Features:
                </h4>
                {activeFacility.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#2c3d33]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#c8a24d] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Campus Features Mini Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d]">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-[#143d30]">
                Performing Arts Auditorium
              </h4>
              <p className="text-xs text-[#4f5e55] mt-1">
                600-seater acoustically engineered hall for drama, music festivals, debates, and annual convocations.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d]">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-[#143d30]">
                GPS Fleet &amp; Transport
              </h4>
              <p className="text-xs text-[#4f5e55] mt-1">
                Air-conditioned school buses with live CCTV, female attendants, speed governors, and parent GPS tracking app.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d]">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-[#143d30]">
                Medical Infirmary &amp; Care
              </h4>
              <p className="text-xs text-[#4f5e55] mt-1">
                4-bed air-conditioned medical center with full-time registered nursing staff and 24/7 tie-up with city multispeciality hospital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
