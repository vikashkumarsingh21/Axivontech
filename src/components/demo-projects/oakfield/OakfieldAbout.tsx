"use client";

import React from "react";
import { Compass, Heart, Lightbulb, Shield, Flame, Wind, Droplets, Mountain } from "lucide-react";

export default function OakfieldAbout() {
  const houses = [
    {
      name: "Agni House",
      color: "#c2410c",
      bg: "#fff7ed",
      motto: "Courage & Innovation",
      icon: Flame,
      lead: "Points Standing: 1,420 (Champion 2025)",
    },
    {
      name: "Vayu House",
      color: "#0284c7",
      bg: "#f0f9ff",
      motto: "Agility & Broad Perspective",
      icon: Wind,
      lead: "Points Standing: 1,390",
    },
    {
      name: "Jal House",
      color: "#0d9488",
      bg: "#f0fdfa",
      motto: "Empathy & Adaptability",
      icon: Droplets,
      lead: "Points Standing: 1,365",
    },
    {
      name: "Prithvi House",
      color: "#15803d",
      bg: "#f0fdf4",
      motto: "Resilience & Integrity",
      icon: Mountain,
      lead: "Points Standing: 1,380",
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#faf8f4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Heritage &amp; Philosophy
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            Nurturing Young Minds for a Global Future
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            Founded on the conviction that true education transcends rote learning, Oakfield International School cultivates intellectual independence, ethical grounding, and creative confidence.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-[#e5dccb] bg-[#f4efe4] p-8 transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d] mb-6 shadow-sm">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#143d30]">Our Academic Vision</h3>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4f5e55]">
              To be an institution of global distinction where every learner develops the academic mastery, critical judgment, and self-discipline to excel in top universities worldwide.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5dccb] bg-[#f4efe4] p-8 transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d] mb-6 shadow-sm">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#143d30]">Pastoral Care &amp; Wellbeing</h3>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4f5e55]">
              Every child is known and supported. Our multi-tiered student wellness council, full-time child counselors, and house mentors ensure a nurturing, safe environment.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5dccb] bg-[#f4efe4] p-8 transition-all hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d] mb-6 shadow-sm">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#143d30]">Experiential STEM Culture</h3>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4f5e55]">
              From hands-on robotics in Grade III to research-grade biotechnology in Senior Secondary, education at Oakfield is rooted in discovery, experimentation, and design thinking.
            </p>
          </div>
        </div>

        {/* The Four Houses of Oakfield */}
        <div className="mt-16 rounded-2xl border border-[#e2d9c8] bg-[#f4efe4] p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c8a24d]">
                Community &amp; Camaraderie
              </span>
              <h3 className="mt-1 font-serif text-2xl font-bold text-[#143d30]">
                The Four House System
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4f5e55]">
                Students belong to one of four historic houses, fostering peer mentoring, healthy competition, sportsmanship, and leadership.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#143d30] bg-[#e5dccb] px-3.5 py-1.5 rounded-full self-start">
              Annual Championship Trophy 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {houses.map((house) => {
              const Icon = house.icon;
              return (
                <div
                  key={house.name}
                  className="rounded-xl border border-[#dfd4c0] p-6 transition-all hover:scale-105 bg-[#faf8f4]"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
                    style={{ backgroundColor: house.bg, color: house.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-serif text-lg font-bold" style={{ color: house.color }}>
                    {house.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#18231d] mt-1">{house.motto}</p>
                  <p className="text-[11px] text-[#718278] mt-3 pt-3 border-t border-[#ece4d5]">
                    {house.lead}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
