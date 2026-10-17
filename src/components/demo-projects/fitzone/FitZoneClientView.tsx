"use client";

import React, { useState } from "react";
import { Program, Trainer, ScheduleClassSession } from "./types";
import FitZoneDemoStrip from "./FitZoneDemoStrip";
import FitZoneHeader from "./FitZoneHeader";
import FitZoneHero from "./FitZoneHero";
import FitZonePhilosophy from "./FitZonePhilosophy";
import FitZonePrograms from "./FitZonePrograms";
import FitZoneProgramModal from "./FitZoneProgramModal";
import FitZoneTrainingCards from "./FitZoneTrainingCards";
import FitZoneTrainers from "./FitZoneTrainers";
import FitZoneTrainerModal from "./FitZoneTrainerModal";
import FitZoneClassSchedule from "./FitZoneClassSchedule";
import FitZoneClassModal from "./FitZoneClassModal";
import FitZoneMembership from "./FitZoneMembership";
import FitZoneGallery from "./FitZoneGallery";
import FitZoneGoalPlanner from "./FitZoneGoalPlanner";
import FitZoneAbout from "./FitZoneAbout";
import FitZoneTestimonials from "./FitZoneTestimonials";
import FitZoneFAQ from "./FitZoneFAQ";
import FitZoneTrialBooking from "./FitZoneTrialBooking";
import FitZoneClosingCTA from "./FitZoneClosingCTA";
import FitZoneFooter from "./FitZoneFooter";

export default function FitZoneClientView() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedClass, setSelectedClass] = useState<ScheduleClassSession | null>(null);
  const [trialProgramPreference, setTrialProgramPreference] = useState<string>("");

  const scrollToTrial = (preferredDiscipline?: string) => {
    if (preferredDiscipline) {
      setTrialProgramPreference(preferredDiscipline);
    }
    const trialSection = document.getElementById("trial");
    if (trialSection) {
      trialSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F6F4F0] selection:bg-[#FF7138]/20 selection:text-[#FF7138] antialiased">
      {/* Demo Project Identifier Context Bar */}
      <FitZoneDemoStrip />

      {/* Main Athletic Sticky Header */}
      <FitZoneHeader onBookTrialClick={() => scrollToTrial()} />

      <main>
        {/* 3D Immersive Hero with Pointer Tracking Perspective */}
        <FitZoneHero onBookTrialClick={() => scrollToTrial()} />

        {/* 4 Pillars of Athletic Supremacy */}
        <FitZonePhilosophy />

        {/* Training Programs & Filterable Protocols */}
        <FitZonePrograms
          onSelectProgram={(program) => setSelectedProgram(program)}
          onBookTrial={(progName) => scrollToTrial(progName)}
        />

        {/* Interactive 3D Arena Cards with Depth Movement */}
        <FitZoneTrainingCards />

        {/* Master Coaches Roster & Biographies */}
        <FitZoneTrainers
          onSelectTrainer={(trainer) => setSelectedTrainer(trainer)}
          onBookTrial={(note) => scrollToTrial(note)}
        />

        {/* 7-Day Class Timetable & Spot Reservation */}
        <FitZoneClassSchedule
          onSelectClass={(session) => setSelectedClass(session)}
        />

        {/* Memberships & Monthly/Annual Pass Toggle */}
        <FitZoneMembership
          onSelectPlan={(plan) => scrollToTrial(`Membership Interest: ${plan}`)}
        />

        {/* 21,900 SQ FT Facility Pavilions & Equipment */}
        <FitZoneGallery />

        {/* Interactive Weekly Split & AI-Driven Planner */}
        <FitZoneGoalPlanner
          onStartTrialWithGoal={(details) => scrollToTrial(details)}
        />

        {/* The FitZone Manifesto & Blueprint */}
        <FitZoneAbout />

        {/* Proven Transformation Metrics & Case Studies */}
        <FitZoneTestimonials />

        {/* Facility Transparency & FAQs */}
        <FitZoneFAQ />

        {/* Free 1-Day Trial Booking with Pass Generation */}
        <FitZoneTrialBooking
          initialProgramPreference={trialProgramPreference}
        />

        {/* High-Impact Conversion Closing CTA */}
        <FitZoneClosingCTA onBookTrialClick={() => scrollToTrial()} />
      </main>

      {/* Complete Athletic Footer */}
      <FitZoneFooter />

      {/* Program Phase & Curriculum Modal */}
      <FitZoneProgramModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
        onBookTrial={(progName) => scrollToTrial(progName)}
      />

      {/* Trainer Credentials & Bio Modal */}
      <FitZoneTrainerModal
        trainer={selectedTrainer}
        onClose={() => setSelectedTrainer(null)}
        onBookTrial={(note) => scrollToTrial(note)}
      />

      {/* Class Spot Reservation Confirmation Modal */}
      <FitZoneClassModal
        session={selectedClass}
        onClose={() => setSelectedClass(null)}
      />
    </div>
  );
}
