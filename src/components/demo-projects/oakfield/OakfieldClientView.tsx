"use client";

import React, { useCallback } from "react";
import OakfieldDemoStrip from "./OakfieldDemoStrip";
import OakfieldHeader from "./OakfieldHeader";
import OakfieldHero from "./OakfieldHero";
import OakfieldAbout from "./OakfieldAbout";
import OakfieldPrincipal from "./OakfieldPrincipal";
import OakfieldAcademics from "./OakfieldAcademics";
import OakfieldAdmissions from "./OakfieldAdmissions";
import OakfieldFaculty from "./OakfieldFaculty";
import OakfieldCampus from "./OakfieldCampus";
import OakfieldAchievements from "./OakfieldAchievements";
import OakfieldNoticeBoard from "./OakfieldNoticeBoard";
import OakfieldGallery from "./OakfieldGallery";
import OakfieldContact from "./OakfieldContact";
import OakfieldFooter from "./OakfieldFooter";

export default function OakfieldClientView() {
  const scrollToAdmissions = useCallback(() => {
    const el = document.getElementById("admissions");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollToAcademics = useCallback(() => {
    const el = document.getElementById("academics");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="demo-light-theme min-h-screen bg-[#faf8f4] text-[#18231d] font-sans antialiased selection:bg-[#143d30] selection:text-[#faf8f4]">
      {/* 1. Axivon Demo Identifier Strip */}
      <OakfieldDemoStrip />

      {/* 2. Institutional Navigation Header */}
      <OakfieldHeader onApplyClick={scrollToAdmissions} />

      <main id="main-content">
        {/* 3. Hero Section with Key Metrics & Badges */}
        <OakfieldHero
          onApplyClick={scrollToAdmissions}
          onExploreAcademics={scrollToAcademics}
        />

        {/* 4. Heritage, Mission & Four House System */}
        <OakfieldAbout />

        {/* 5. Principal's Welcome Address */}
        <OakfieldPrincipal />

        {/* 6. Four Academic Wings & Curriculum Selector */}
        <OakfieldAcademics />

        {/* 7. Admissions Center with Interactive Form */}
        <OakfieldAdmissions />

        {/* 8. Faculty Roster & Department Heads */}
        <OakfieldFaculty />

        {/* 9. 15-Acre Green Campus & Laboratories */}
        <OakfieldCampus />

        {/* 10. Board Results & Hall of Distinction */}
        <OakfieldAchievements />

        {/* 11. Real-Time Digital Notice Board */}
        <OakfieldNoticeBoard />

        {/* 12. Visual Campus & Life Gallery */}
        <OakfieldGallery />

        {/* 13. Contact & Guided Campus Walk Booking */}
        <OakfieldContact />
      </main>

      {/* 14. Comprehensive Institutional Footer */}
      <OakfieldFooter />
    </div>
  );
}
