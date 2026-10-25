"use client";

import React from "react";
import { 
  Briefcase, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";

interface PaletteOptionProps {
  id: string;
  name: string;
  tagline: string;
  themeDescription: string;
  recommended?: boolean;
  colors: {
    accent: string;
    accentHover: string;
    accentSoft: string;
    accentBorder: string;
    bgPage: string;
    bgCard: string;
    bgRaised: string;
    border: string;
    textPrimary: string;
    textMuted: string;
  };
}

const palettes: PaletteOptionProps[] = [
  {
    id: "warm-gold",
    name: "Option 1: Warm Sand / Brass Gold",
    tagline: "Private Wealth & Enterprise Partner",
    themeDescription: "Calm, prestigious, and financial. Evokes high-value client engagements, trust, and transparent commission settlement without visual fatigue.",
    recommended: true,
    colors: {
      accent: "#C2A878",
      accentHover: "#D4BE92",
      accentSoft: "rgba(194, 168, 120, 0.12)",
      accentBorder: "rgba(194, 168, 120, 0.28)",
      bgPage: "#0A0B0D",
      bgCard: "#111317",
      bgRaised: "#171A1F",
      border: "#22262D",
      textPrimary: "#E6E8EB",
      textMuted: "#8B94A1",
    },
  },
  {
    id: "sage-teal",
    name: "Option 2: Muted Sage Teal",
    tagline: "Institutional Capital & Modern Tech",
    themeDescription: "Nordic, balanced, and serene. Fits technical architecture partnerships with a focused, analytical tone that feels clean and modern.",
    colors: {
      accent: "#5FA8A0",
      accentHover: "#72B8B0",
      accentSoft: "rgba(95, 168, 160, 0.12)",
      accentBorder: "rgba(95, 168, 160, 0.28)",
      bgPage: "#0A0B0E",
      bgCard: "#101418",
      bgRaised: "#161B21",
      border: "#1F2630",
      textPrimary: "#E6E8EB",
      textMuted: "#8B94A1",
    },
  },
  {
    id: "slate-bronze",
    name: "Option 3: Muted Slate Bronze",
    tagline: "Executive Alliance & Advisory",
    themeDescription: "Grounded, warm, and architectural. Provides deep warmth with understated contrast, feeling like a bespoke corporate boardroom portal.",
    colors: {
      accent: "#B89578",
      accentHover: "#C8A78C",
      accentSoft: "rgba(184, 149, 120, 0.12)",
      accentBorder: "rgba(184, 149, 120, 0.28)",
      bgPage: "#090A0C",
      bgCard: "#121316",
      bgRaised: "#181A1E",
      border: "#25272E",
      textPrimary: "#E6E8EB",
      textMuted: "#8B94A1",
    },
  },
];

export default function PalettePreviewPage() {
  return (
    <div className="min-h-screen bg-[#07080A] text-[#E6E8EB] p-8 md:p-12 font-sans selection:bg-[#C2A878]/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-[#1F232B] pb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B94A1] mb-2 font-mono">
            <span>AXIVON TECHNOLOGIES</span>
            <span>/</span>
            <span>DESIGN SYSTEM PROPOSAL</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#E6E8EB]">
            Broker / Business Partner Portal — Color Palette Options
          </h1>
          <p className="text-sm text-[#8B94A1] mt-2 max-w-3xl leading-relaxed">
            Review the 3 curated desaturated palette options for the broker portal redesign. Each option maintains 
            the layered dark aesthetic (near-black #0A0B0D surfaces, 1px subtle borders, no harsh pure black, no neon gradients) 
            while applying a dedicated calm accent for actions, badges, navigation, and metrics.
          </p>
        </header>

        {/* 3 Palette Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {palettes.map((p) => {
            const { colors } = p;
            return (
              <div
                key={p.id}
                id={`palette-${p.id}`}
                className="rounded-xl border p-6 flex flex-col justify-between transition-all"
                style={{
                  backgroundColor: colors.bgPage,
                  borderColor: colors.border,
                }}
              >
                <div>
                  {/* Option Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="text-xs font-mono font-medium px-2.5 py-1 rounded-md border"
                      style={{
                        backgroundColor: colors.accentSoft,
                        borderColor: colors.accentBorder,
                        color: colors.accent,
                      }}
                    >
                      {p.name.split(":")[0]}
                    </span>
                    {p.recommended && (
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#E6E8EB] bg-[#1E2530] px-2 py-0.5 rounded border border-[#2E3644]">
                        Recommended
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-[#E6E8EB] mb-1">
                    {p.name.split(":")[1]?.trim()}
                  </h2>
                  <p className="text-xs text-[#8B94A1] mb-4 font-mono">
                    {p.tagline}
                  </p>
                  <p className="text-xs text-[#8B94A1] leading-relaxed mb-6">
                    {p.themeDescription}
                  </p>

                  {/* Palette Swatches */}
                  <div className="grid grid-cols-5 gap-2 mb-6 p-3 rounded-lg border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                    <div className="text-center">
                      <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: colors.accent }}></div>
                      <span className="text-[10px] font-mono block text-[#8B94A1]">Accent</span>
                      <span className="text-[9px] font-mono block text-[#566171]">{colors.accent}</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: colors.bgPage, border: `1px solid ${colors.border}` }}></div>
                      <span className="text-[10px] font-mono block text-[#8B94A1]">Base</span>
                      <span className="text-[9px] font-mono block text-[#566171]">{colors.bgPage}</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}></div>
                      <span className="text-[10px] font-mono block text-[#8B94A1]">Card</span>
                      <span className="text-[9px] font-mono block text-[#566171]">{colors.bgCard}</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: colors.bgRaised, border: `1px solid ${colors.border}` }}></div>
                      <span className="text-[10px] font-mono block text-[#8B94A1]">Raised</span>
                      <span className="text-[9px] font-mono block text-[#566171]">{colors.bgRaised}</span>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: colors.border }}></div>
                      <span className="text-[10px] font-mono block text-[#8B94A1]">Border</span>
                      <span className="text-[9px] font-mono block text-[#566171]">{colors.border}</span>
                    </div>
                  </div>

                  {/* UI Simulation: Metrics Card */}
                  <div 
                    className="rounded-lg p-4 border mb-4 shadow-sm"
                    style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                  >
                    <div className="flex items-center justify-between text-xs text-[#8B94A1] mb-2">
                      <span className="font-medium">Total Settled Earnings</span>
                      <span 
                        className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-mono"
                        style={{ backgroundColor: colors.accentSoft, color: colors.accent }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        +14.2%
                      </span>
                    </div>
                    <div className="text-2xl font-semibold tracking-tight text-[#E6E8EB] font-mono">
                      ₹4,85,000
                    </div>
                    <div className="text-[11px] text-[#8B94A1] mt-1 flex items-center justify-between">
                      <span>Eligible for Payout: <strong className="text-[#E6E8EB] font-mono">₹40,000</strong></span>
                      <span className="text-[10px] text-[#566171]">TDS 5% Net: ₹38,000</span>
                    </div>
                  </div>

                  {/* UI Simulation: Active Navigation Item */}
                  <div 
                    className="rounded-lg p-2.5 border mb-4 flex items-center justify-between text-xs transition"
                    style={{ 
                      backgroundColor: colors.bgRaised, 
                      borderColor: colors.border,
                      borderLeft: `3px solid ${colors.accent}`
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4" style={{ color: colors.accent }} />
                      <span className="font-medium text-[#E6E8EB]">Projects Pipeline</span>
                    </div>
                    <span 
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                      style={{ backgroundColor: colors.accentSoft, color: colors.accent }}
                    >
                      3 Active
                    </span>
                  </div>

                  {/* UI Simulation: Status Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Verified
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Pending Review
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      Contract Sent
                    </span>
                  </div>

                  {/* UI Simulation: Form Field with Focus */}
                  <div className="mb-4">
                    <label className="block text-[11px] text-[#8B94A1] mb-1 font-medium">Estimated Client Budget (₹)</label>
                    <div 
                      className="w-full px-3 py-2 rounded-md border text-xs font-mono flex items-center justify-between"
                      style={{ 
                        backgroundColor: colors.bgRaised, 
                        borderColor: colors.accent,
                        boxShadow: `0 0 0 1px ${colors.accentBorder}`
                      }}
                    >
                      <span className="text-[#E6E8EB]">5,00,000</span>
                      <span className="text-[11px] text-[#8B94A1]">INR</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-medium tracking-wide transition flex items-center justify-center gap-2 font-sans"
                      style={{
                        backgroundColor: colors.accent,
                        color: "#0A0B0D",
                      }}
                    >
                      Request Commission Payout
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="w-full py-2 px-4 rounded-lg text-xs font-medium transition border flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "transparent",
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      }}
                    >
                      <Download className="w-3.5 h-3.5 text-[#8B94A1]" />
                      Download Commission Statement
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4 mt-6 text-center" style={{ borderColor: colors.border }}>
                  <span className="text-[11px] text-[#8B94A1]">
                    Ideal for: {p.id === "warm-gold" ? "Earnings transparency & partnership prestige" : p.id === "sage-teal" ? "Engineering focus & long dashboard sessions" : "Classic corporate alliance & understated luxury"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Details Table */}
        <section className="rounded-xl border border-[#22262D] bg-[#111317] p-6">
          <h3 className="text-base font-semibold text-[#E6E8EB] mb-4">
            Theme Token Architecture
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#22262D] text-[#8B94A1]">
                  <th className="pb-3 font-normal">Token</th>
                  <th className="pb-3 font-normal">Option 1 (Warm Gold)</th>
                  <th className="pb-3 font-normal">Option 2 (Sage Teal)</th>
                  <th className="pb-3 font-normal">Option 3 (Slate Bronze)</th>
                  <th className="pb-3 font-normal">Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2128] text-[#E6E8EB]">
                <tr>
                  <td className="py-2.5 text-[#8B94A1]">--bp-accent</td>
                  <td className="py-2.5"><span className="text-[#C2A878]">#C2A878</span> (Warm Brass Gold)</td>
                  <td className="py-2.5"><span className="text-[#5FA8A0]">#5FA8A0</span> (Nordic Teal)</td>
                  <td className="py-2.5"><span className="text-[#B89578]">#B89578</span> (Hazel Bronze)</td>
                  <td className="py-2.5 text-[#8B94A1]">Primary CTA, Active Link, Focus Outline</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#8B94A1]">--bp-bg-page</td>
                  <td className="py-2.5">#0A0B0D</td>
                  <td className="py-2.5">#0A0B0E</td>
                  <td className="py-2.5">#090A0C</td>
                  <td className="py-2.5 text-[#8B94A1]">Global page viewport background</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#8B94A1]">--bp-bg-card</td>
                  <td className="py-2.5">#111317</td>
                  <td className="py-2.5">#101418</td>
                  <td className="py-2.5">#121316</td>
                  <td className="py-2.5 text-[#8B94A1]">Card containers, metric widgets, drawers</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#8B94A1]">--bp-bg-raised</td>
                  <td className="py-2.5">#171A1F</td>
                  <td className="py-2.5">#161B21</td>
                  <td className="py-2.5">#181A1E</td>
                  <td className="py-2.5 text-[#8B94A1]">Table row hover, inputs, secondary tags</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#8B94A1]">--bp-border</td>
                  <td className="py-2.5">#22262D</td>
                  <td className="py-2.5">#1F2630</td>
                  <td className="py-2.5">#25272E</td>
                  <td className="py-2.5 text-[#8B94A1]">1px structural divisions and outlines</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
