"use client";

import React from "react";
import Link from "next/link";
import { Dumbbell, Flame, MapPin, Phone, Mail, Clock, Shield, Sparkles } from "lucide-react";

export default function FitZoneFooter() {
  return (
    <footer className="border-t border-[#2B3137] bg-[#070809] text-[#B5BBC2]">
      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="#hero" className="inline-flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7138] to-[#FF934D] text-[#0B0D0F] shadow-lg shadow-[#FF7138]/20">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-[#F6F4F0] uppercase">
                  FIT<span className="text-[#FF7138]">ZONE</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-[#858D96] uppercase">
                  Athletic Club & 3D Lab
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#858D96] leading-relaxed max-w-sm">
              Engineered for progressive overload, metabolic conditioning, and
              biological longevity. 100% Eleiko certified power racks, sub-zero
              contrast recovery, and master-level sports science.
            </p>

            <div className="space-y-2 text-xs text-[#B5BBC2] pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#FF7138] shrink-0" />
                <span>480 Olympic Way, Performance District</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#FF7138] shrink-0" />
                <span>+1 (800) 555-FITZ (Front Desk Concierge)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#FF7138] shrink-0" />
                <span>concierge@fitzoneclub.demo</span>
              </div>
            </div>
          </div>

          {/* Col 3: Disciplines & Protocols */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F6F4F0]">
              Training Protocols
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#programs" className="hover:text-[#FF7138] transition-colors">
                  IronForge™ Hypertrophy
                </Link>
              </li>
              <li>
                <Link href="#programs" className="hover:text-[#FF7138] transition-colors">
                  VelocityX™ Metabolic Burn
                </Link>
              </li>
              <li>
                <Link href="#programs" className="hover:text-[#FF7138] transition-colors">
                  Spartan Rig™ Calisthenics
                </Link>
              </li>
              <li>
                <Link href="#programs" className="hover:text-[#FF7138] transition-colors">
                  ZenFlex™ Structural Recovery
                </Link>
              </li>
              <li>
                <Link href="#programs" className="hover:text-[#FF7138] transition-colors">
                  Apex Strike™ Heavy Bag
                </Link>
              </li>
              <li>
                <Link href="#programs" className="hover:text-[#FF7138] transition-colors">
                  Precision™ 1-on-1 Coaching
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Facility & Schedule */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F6F4F0]">
              Club & Amenities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#facilities" className="hover:text-[#FF7138] transition-colors">
                  The Iron Pit (Barbell Pavilion)
                </Link>
              </li>
              <li>
                <Link href="#facilities" className="hover:text-[#FF7138] transition-colors">
                  Performance Turf & 40ft Rig
                </Link>
              </li>
              <li>
                <Link href="#facilities" className="hover:text-[#FF7138] transition-colors">
                  38°F Sub-Zero Cryo Plunges
                </Link>
              </li>
              <li>
                <Link href="#facilities" className="hover:text-[#FF7138] transition-colors">
                  195°F Nordic Cedar Sauna
                </Link>
              </li>
              <li>
                <Link href="#schedule" className="hover:text-[#FF7138] transition-colors">
                  7-Day Class Timetable
                </Link>
              </li>
              <li>
                <Link href="#planner" className="hover:text-[#FF7138] transition-colors">
                  Custom Split Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Operating Hours & Passes */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F6F4F0]">
              Facility Access Hours
            </h4>
            <div className="space-y-2 rounded-xl border border-[#2B3137] bg-[#111417] p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#FF7138] font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>Open 7 Days a Week</span>
              </div>
              <p className="text-[11px] text-[#B5BBC2]">
                Mon–Fri: 05:00 AM – 11:00 PM <br />
                Sat–Sun: 07:00 AM – 09:00 PM
              </p>
              <div className="pt-2 border-t border-[#2B3137] text-[10px] text-[#48D597] font-semibold">
                * Pro & Elite: 24/7 App Keyless Access
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="#trial"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF7138] hover:bg-[#e65d26] py-2 text-xs font-bold uppercase tracking-wider text-[#0B0D0F] shadow-sm transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Claim Free Pass</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Axivon Attribution Strip */}
        <div className="mt-14 pt-8 border-t border-[#2B3137] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858D96]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} FitZone Club. All rights reserved.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">Frontend Interactive Demo</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Designed & Engineered by</span>
            <Link
              href="/demo-projects"
              className="font-bold text-[#FF7138] hover:underline"
            >
              Axivon Technologies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
