"use client";

import React, { useState, useCallback } from "react";
import SolaraDemoStrip from "./SolaraDemoStrip";
import SolaraHeader from "./SolaraHeader";
import SolaraHero from "./SolaraHero";
import SolaraAccommodations from "./SolaraAccommodations";
import SolaraDining from "./SolaraDining";
import SolaraWellness from "./SolaraWellness";
import SolaraExperiences from "./SolaraExperiences";
import SolaraGallery from "./SolaraGallery";
import SolaraReservation from "./SolaraReservation";
import SolaraLocation from "./SolaraLocation";
import SolaraFAQ from "./SolaraFAQ";
import SolaraFooter from "./SolaraFooter";

export default function SolaraClientView() {
  const [selectedVilla, setSelectedVilla] = useState<string | undefined>(undefined);
  const [bookingDates, setBookingDates] = useState<
    { checkIn: string; checkOut: string; villa: string; guests: string } | undefined
  >(undefined);

  const scrollToReservation = useCallback(() => {
    const el = document.getElementById("reservation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollToAccommodations = useCallback(() => {
    const el = document.getElementById("accommodations");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSelectVilla = useCallback((villaName: string) => {
    setSelectedVilla(villaName);
    const el = document.getElementById("reservation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleHeroDates = useCallback(
    (dates: { checkIn: string; checkOut: string; villa: string; guests: string }) => {
      setBookingDates(dates);
      setSelectedVilla(dates.villa);
      const el = document.getElementById("reservation");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  return (
    <div className="demo-light-theme min-h-screen bg-[#f5efeb] text-[#1b1916] font-sans antialiased selection:bg-[#1f2e23] selection:text-[#faf8f5]">
      {/* 1. Axivon Demo Identifier Strip */}
      <SolaraDemoStrip />

      {/* 2. Resort Luxury Sticky Header */}
      <SolaraHeader onReserveClick={scrollToReservation} />

      <main id="main-content">
        {/* 3. Hero Section with Quick Availability Bar */}
        <SolaraHero
          onCheckAvailability={handleHeroDates}
          onExploreVillas={scrollToAccommodations}
        />

        {/* 4. Eighteen Villas & Suites Showcase */}
        <SolaraAccommodations onSelectVilla={handleSelectVilla} />

        {/* 5. Farm-to-Table Conscious Gastronomy */}
        <SolaraDining />

        {/* 6. Ayurvedic Spa & Thermal Sanctuary */}
        <SolaraWellness />

        {/* 7. Curated Wilderness & Astronomy Escapes */}
        <SolaraExperiences />

        {/* 8. Photographic Gallery */}
        <SolaraGallery />

        {/* 9. Interactive Reservation Request Desk */}
        <SolaraReservation
          initialVilla={selectedVilla}
          initialDates={bookingDates}
        />

        {/* 10. Travel & Helipad Directions */}
        <SolaraLocation />

        {/* 11. Guest Policies & Sanctuary FAQ */}
        <SolaraFAQ />
      </main>

      {/* 12. Resort Footer */}
      <SolaraFooter />
    </div>
  );
}
