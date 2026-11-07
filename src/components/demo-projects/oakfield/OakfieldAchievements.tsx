"use client";

import React from "react";
import { Trophy, Award, Star, Medal } from "lucide-react";

export default function OakfieldAchievements() {
  const achievements = [
    {
      metric: "100%",
      label: "CBSE Class X & XII Pass Rate",
      sub: "Zero failures for 12 consecutive years; 42% scored >90%",
      icon: Award,
    },
    {
      metric: "14",
      label: "National Science Olympiad Medals",
      sub: "Gold & silver citations in Physics, Astronomy, and Cybernetics",
      icon: Trophy,
    },
    {
      metric: "Rank 1",
      label: "CBSE Regional Sports Meet",
      sub: "Under-17 Basketball and Track Champions 2025",
      icon: Medal,
    },
    {
      metric: "38+",
      label: "Ivy League & Top Indian Admits",
      sub: "Graduates enrolled at IITs, AIIMS, Ashoka, NUS, and Oxford",
      icon: Star,
    },
  ];

  return (
    <section id="achievements" className="py-20 bg-[#faf8f4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Hall of Distinction
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            A Tradition of Academic &amp; Co-Curricular Excellence
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            Our students consistently demonstrate that with dedicated mentorship, intellectual curiosity, and rigorous discipline, exceptional results naturally follow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-[#dfd4c0] bg-[#f4efe4] p-8 text-center transition-all hover:scale-105 shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d] mb-4 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="font-serif text-4xl font-extrabold text-[#143d30] tracking-tight">
                  {item.metric}
                </div>
                <h3 className="font-serif text-base font-bold text-[#18231d] mt-2">
                  {item.label}
                </h3>
                <p className="text-xs text-[#718278] mt-2 leading-relaxed">
                  {item.sub}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
