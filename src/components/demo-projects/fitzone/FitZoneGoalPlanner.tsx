"use client";

import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Dumbbell,
  HeartPulse,
  Target,
  RefreshCw,
} from "lucide-react";

interface FitZoneGoalPlannerProps {
  onStartTrialWithGoal?: (goalDetails: string) => void;
}

interface SplitDay {
  day: string;
  focus: string;
  suggestedClass: string;
}

export default function FitZoneGoalPlanner({
  onStartTrialWithGoal,
}: FitZoneGoalPlannerProps) {
  const [goal, setGoal] = useState<string>("hypertrophy");
  const [frequency, setFrequency] = useState<number>(4);
  const [experience, setExperience] = useState<string>("intermediate");

  // Goals definitions
  const goalOptions = [
    {
      id: "hypertrophy",
      title: "Hypertrophy & Strength",
      desc: "Pack on lean muscular tissue and elevate 1RM compound lifts.",
      icon: Dumbbell,
    },
    {
      id: "fatloss",
      title: "Fat Shred & Conditioning",
      desc: "Accelerate metabolic burn, VO2 max, and stamina.",
      icon: Flame,
    },
    {
      id: "functional",
      title: "Functional & Agility",
      desc: "Gymnastics rings, sandbag carries, and rotational core power.",
      icon: Target,
    },
    {
      id: "mobility",
      title: "Mobility & Restoration",
      desc: "Joint decompression, spine health, and chronic stiffness relief.",
      icon: HeartPulse,
    },
  ];

  // Frequency options
  const frequencyOptions = [
    { days: 3, label: "3 Days / Week", sub: "Sustainable Baseline" },
    { days: 4, label: "4-5 Days / Week", sub: "Optimal Progression" },
    { days: 6, label: "6 Days / Week", sub: "Elite Competitive" },
  ];

  // Experience options
  const experienceOptions = [
    { id: "beginner", label: "Foundational (0–1 Years)" },
    { id: "intermediate", label: "Intermediate (1–3 Years)" },
    { id: "advanced", label: "Advanced Athlete (3+ Years)" },
  ];

  // Dynamic calculation of weekly split
  const generateSplit = (): {
    split: SplitDay[];
    nutrition: string;
    cardio: string;
    summary: string;
  } => {
    if (goal === "hypertrophy") {
      if (frequency === 3) {
        return {
          split: [
            { day: "Monday", focus: "Upper Body Heavy Barbell", suggestedClass: "IronForge™ Barbell Clinic" },
            { day: "Wednesday", focus: "Lower Body Squat & Posterior Chain", suggestedClass: "IronForge™ Hypertrophy" },
            { day: "Friday", focus: "Full Body Structural Density", suggestedClass: "IronForge™ Full-Body Friday" },
          ],
          nutrition: "1.0g – 1.2g protein per lb of bodyweight. Modest caloric surplus (+250 kcal) to facilitate tissue synthesis.",
          cardio: "20 min low-intensity steady state (Zone 2) incline walk post-training.",
          summary: "A high-frequency full-body/upper-lower protocol prioritizing barbell compound mastery and adequate nervous system recovery.",
        };
      } else if (frequency === 4) {
        return {
          split: [
            { day: "Monday", focus: "Upper Body Strength (Chest & Back)", suggestedClass: "IronForge™ Hypertrophy" },
            { day: "Tuesday", focus: "Lower Body Squat & Quadriceps", suggestedClass: "IronForge™ Heavy Barbell" },
            { day: "Thursday", focus: "Upper Body Hypertrophy (Shoulders & Arms)", suggestedClass: "IronForge™ Upper Body Density" },
            { day: "Saturday", focus: "Posterior Chain Deadlift & Hamstrings", suggestedClass: "IronForge™ Olympic Clinic" },
          ],
          nutrition: "High carb around training windows (pre & post workout) to fuel progressive barbell overload.",
          cardio: "15 min SkiErg flush plus contrast cold plunge therapy on recovery days.",
          summary: "The classic Upper/Lower 4-day periodization model. Maximizes weekly training volume per muscle group with 72-hour recovery windows.",
        };
      } else {
        return {
          split: [
            { day: "Monday", focus: "Push (Chest, Shoulders, Triceps)", suggestedClass: "IronForge™ Hypertrophy" },
            { day: "Tuesday", focus: "Pull (Lats, Upper Back, Biceps)", suggestedClass: "IronForge™ Barbell" },
            { day: "Wednesday", focus: "Legs (Quad & Calves)", suggestedClass: "IronForge™ Squat Volume" },
            { day: "Thursday", focus: "Push Hypertrophy", suggestedClass: "Precision™ 1-on-1 Coaching" },
            { day: "Friday", focus: "Pull & Deadlifts", suggestedClass: "IronForge™ Deadlift Mastery" },
            { day: "Saturday", focus: "Legs & Posterior Chain", suggestedClass: "ZenFlex™ Structural Recovery" },
          ],
          nutrition: "Dedicated macro titration with bi-weekly InBody scans to ensure lean gains without fat spillover.",
          cardio: "Daily 8,000 baseline steps + 10 min cold plunge contrast therapy.",
          summary: "Elite Push-Pull-Legs (PPL) 6-day split designed for advanced lifters seeking maximum muscular detail and density.",
        };
      }
    } else if (goal === "fatloss") {
      return {
        split: [
          { day: "Monday", focus: "High-Cadence Anaerobic Sprints", suggestedClass: "VelocityX™ Morning Blast" },
          { day: "Tuesday", focus: "Functional Strength & Barbell Complexes", suggestedClass: "Spartan Rig™ Calisthenics" },
          { day: "Thursday", focus: "Heavy Bag Rounds & Core Slams", suggestedClass: "Apex Strike™ Bag Rounds" },
          { day: "Saturday", focus: "Full Club Team Gauntlet", suggestedClass: "Super Saturday Spartan Gauntlet" },
        ],
        nutrition: "Moderate caloric deficit (-400 kcal) with high protein (1.2g/lb) to spare lean mass while dropping subcutaneous fat.",
        cardio: "High-output HIIT intervals paired with steady-state Zone 2 fat-oxidation walks.",
        summary: "An aggressive metabolic system leveraging EPOC post-exercise oxygen burn to elevate resting energy expenditure.",
      };
    } else if (goal === "functional") {
      return {
        split: [
          { day: "Monday", focus: "Ring Gymnastics & Bodyweight Pulls", suggestedClass: "Spartan Rig™ Ring Gymnastics" },
          { day: "Wednesday", focus: "Loaded Carries & Multi-Planar Core", suggestedClass: "Spartan Rig™ Loaded Carries" },
          { day: "Friday", focus: "Obstacle Athletics & Rope Climbs", suggestedClass: "Spartan Rig™ Obstacle Athletics" },
          { day: "Saturday", focus: "Metabolic Turf Prowler Sleds", suggestedClass: "VelocityX™ 90-Minute Endurance" },
        ],
        nutrition: "Balanced macro split supporting explosive power output and rapid glycogen replenishment.",
        cardio: "Dynamic assault bike sprints and turf sled pushes integrated directly into training rounds.",
        summary: "Multi-planar athletic mastery. Emphasizes gymnastics ring control, grip endurance, and injury-proof rotatory power.",
      };
    } else {
      return {
        split: [
          { day: "Monday", focus: "Hip Capsule & Pelvic Floor Mobility", suggestedClass: "ZenFlex™ Deep Hip Restoration" },
          { day: "Wednesday", focus: "Thoracic Spine Decompression", suggestedClass: "ZenFlex™ Thoracic Opening" },
          { day: "Friday", focus: "Fascial Release & Contrast Sauna", suggestedClass: "ZenFlex™ Sunset Breath & Unwind" },
          { day: "Sunday", focus: "Complete 75-Min Joint Recovery", suggestedClass: "ZenFlex™ 75-Min Complete Mobility" },
        ],
        nutrition: "Anti-inflammatory whole-food nutrition, magnesium glycinate supplementation, and optimal hydration.",
        cardio: "Low-impact nasal breathing walks and gentle stationary cycling.",
        summary: "Restorative longevity protocol designed to open tight thoracic spine angles, decompress discs, and flush cortisol.",
      };
    }
  };

  const plan = generateSplit();

  const handleStartTrial = () => {
    const selectedGoalName = goalOptions.find((g) => g.id === goal)?.title || "Athletic Training";
    const details = `${selectedGoalName} (${frequency} Days/Week, ${experience})`;
    if (onStartTrialWithGoal) {
      onStartTrialWithGoal(details);
    }
  };

  return (
    <section
      id="planner"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
            <Compass className="h-3.5 w-3.5" />
            <span>AI-Driven Training Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
            CUSTOM WEEKLY SPLIT & <br />
            <span className="text-[#FF7138]">ATHLETIC ROADMAP GENERATOR.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#B5BBC2] leading-relaxed">
            Select your targets below. Our training algorithm will configure an
            optimized weekly training schedule, recommended FitZone sessions,
            and nutritional directives.
          </p>
        </div>

        {/* Step Selector Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Left 5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#2B3137] bg-[#171B1F] p-6 sm:p-7 space-y-7 shadow-xl">
            {/* Step 1: Goal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF7138]">
                  Step 01 &bull; Primary Target
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {goalOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = goal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGoal(opt.id)}
                      className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? "border-[#FF7138] bg-[#FF7138]/10 text-white shadow-md shadow-[#FF7138]/10"
                          : "border-[#2B3137] bg-[#111417] text-[#B5BBC2] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? "text-[#FF7138]" : "text-[#858D96]"
                          }`}
                        />
                        <span className="text-xs font-bold uppercase tracking-tight text-[#F6F4F0]">
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#858D96] leading-snug">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Frequency */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF7138]">
                  Step 02 &bull; Training Frequency
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {frequencyOptions.map((freq) => {
                  const isSelected = frequency === freq.days;
                  return (
                    <button
                      key={freq.days}
                      type="button"
                      onClick={() => setFrequency(freq.days)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-[#FF7138] bg-[#FF7138]/10 text-white shadow-md shadow-[#FF7138]/10"
                          : "border-[#2B3137] bg-[#111417] text-[#858D96] hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#F6F4F0]">
                        {freq.label}
                      </span>
                      <span className="text-[9px] text-[#858D96] mt-0.5">
                        {freq.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Experience */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF7138]">
                  Step 03 &bull; Lifting Experience
                </span>
              </div>
              <div className="space-y-2">
                {experienceOptions.map((exp) => {
                  const isSelected = experience === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExperience(exp.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#FF7138] bg-[#FF7138]/10 text-white"
                          : "border-[#2B3137] bg-[#111417] text-[#B5BBC2] hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold">{exp.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-[#FF7138]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result Output Column (Right 7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[#FF7138]/40 bg-[#171B1F] p-6 sm:p-8 space-y-6 shadow-2xl shadow-[#FF7138]/10">
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2B3137] pb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7138]">
                  Custom Periodization Roadmap
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#F6F4F0] mt-0.5">
                  {goalOptions.find((g) => g.id === goal)?.title} Protocol
                </h3>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#48D597]/15 border border-[#48D597]/30 px-3 py-1 text-xs font-bold text-[#48D597]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Optimized &bull; 98.4% Match</span>
              </div>
            </div>

            {/* Plan Summary */}
            <p className="text-xs sm:text-sm text-[#B5BBC2] leading-relaxed">
              {plan.summary}
            </p>

            {/* Weekly Split Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F6F4F0] mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF7138]" />
                <span>Recommended Weekly Session Schedule</span>
              </h4>
              <div className="space-y-2.5">
                {plan.split.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#2B3137] bg-[#111417] p-3.5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-[#FF7138]/20 px-2.5 py-1 font-bold font-mono text-[#FF7138]">
                        {item.day}
                      </span>
                      <span className="font-semibold text-[#F6F4F0]">
                        {item.focus}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#FF934D] sm:text-right">
                      Class: {item.suggestedClass}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition & Cardio Directives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-[#2B3137] bg-[#111417] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7138] mb-1">
                  Nutritional Macro Focus:
                </p>
                <p className="text-xs text-[#B5BBC2] leading-relaxed">
                  {plan.nutrition}
                </p>
              </div>

              <div className="rounded-xl border border-[#2B3137] bg-[#111417] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF934D] mb-1">
                  Cardio & Recovery Strategy:
                </p>
                <p className="text-xs text-[#B5BBC2] leading-relaxed">
                  {plan.cardio}
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-[#2B3137] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-[#858D96] text-center sm:text-left">
                Test drive this split with our complimentary 1-Day Trial Pass.
              </p>

              <button
                type="button"
                onClick={handleStartTrial}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Test This Split On Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
