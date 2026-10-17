"use client";

import React, { useState, useEffect, useCallback } from "react";
import EstateVistaDemoStrip from "./EstateVistaDemoStrip";
import EstateVistaHeader from "./EstateVistaHeader";
import EstateVistaHero from "./EstateVistaHero";
import EstateVistaPropertyListings from "./EstateVistaPropertyListings";
import EstateVistaPropertyModal from "./EstateVistaPropertyModal";
import EstateVistaComparisonModal from "./EstateVistaComparisonModal";
import EstateVistaNeighborhoods from "./EstateVistaNeighborhoods";
import EstateVistaMortgageCalculator from "./EstateVistaMortgageCalculator";
import EstateVistaPrivateTour from "./EstateVistaPrivateTour";
import EstateVistaTestimonials from "./EstateVistaTestimonials";
import EstateVistaFAQ from "./EstateVistaFAQ";
import EstateVistaFooter from "./EstateVistaFooter";
import { Property } from "./types";
import { ESTATEVISTA_PROPERTIES } from "@/data/estatevista-properties";

export default function EstateVistaClientView() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [modalProperty, setModalProperty] = useState<Property | null>(null);
  const [tourProperty, setTourProperty] = useState<Property | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [heroFilters, setHeroFilters] = useState<{
    query: string;
    type: string;
    price: string;
    bedrooms: string;
  }>({
    query: "",
    type: "ALL",
    price: "ALL",
    bedrooms: "ALL",
  });

  // Safe localStorage persistence for saved properties demo
  useEffect(() => {
    try {
      const stored = localStorage.getItem("estatevista_saved_properties");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore fallback
    }
  }, []);

  const handleToggleSave = useCallback((propertyId: string) => {
    setSavedIds((prev) => {
      const updated = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      try {
        localStorage.setItem("estatevista_saved_properties", JSON.stringify(updated));
      } catch (e) {
        // Ignore
      }
      return updated;
    });
  }, []);

  const handleToggleCompare = useCallback((propertyId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      if (prev.length >= 3) {
        // Replace oldest or cap at 3
        return [...prev.slice(1), propertyId];
      }
      return [...prev, propertyId];
    });
  }, []);

  const handleHeroSearch = (filters: {
    query: string;
    type: string;
    price: string;
    bedrooms: string;
  }) => {
    setHeroFilters(filters);
  };

  const handleSelectNeighborhoodFilter = (neighborhoodName: string) => {
    setHeroFilters((prev) => ({
      ...prev,
      query: neighborhoodName,
    }));
    const el = document.querySelector("#residences");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBookTourFromCard = (property: Property) => {
    setTourProperty(property);
    const el = document.querySelector("#tour");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const comparedProperties = ESTATEVISTA_PROPERTIES.filter((p) => compareIds.includes(p.id));

  return (
    <div className="demo-light-theme min-h-screen bg-[#F9F8F5] text-[#1A211E] font-sans antialiased selection:bg-[#123C32]/15 selection:text-[#123C32]">
      {/* 1. Axivon Demo Strip */}
      <EstateVistaDemoStrip />

      {/* 2. EstateVista Brand Header */}
      <EstateVistaHeader
        savedCount={savedIds.length}
        compareCount={compareIds.length}
        onOpenFavorites={() => {
          // Filter listings to show only saved properties by updating query or scrolling
          const el = document.querySelector("#residences");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onOpenComparison={() => setIsComparisonOpen(true)}
      />

      {/* 3. Main Page Flow */}
      <main id="main-content">
        {/* Hero with interactive Quick Search */}
        <EstateVistaHero onSearch={handleHeroSearch} />

        {/* Dynamic Property Listings & Multi-facet Filter Grid */}
        <EstateVistaPropertyListings
          properties={ESTATEVISTA_PROPERTIES}
          savedIds={savedIds}
          compareIds={compareIds}
          onToggleSave={handleToggleSave}
          onToggleCompare={handleToggleCompare}
          onViewDetails={(prop) => setModalProperty(prop)}
          onBookTour={handleBookTourFromCard}
          initialFilters={heroFilters}
        />

        {/* Curated Neighborhoods & Enclave Dossiers */}
        <EstateVistaNeighborhoods
          onSelectNeighborhoodFilter={handleSelectNeighborhoodFilter}
        />

        {/* Interactive Financing & Carrying Cost Calculator */}
        <EstateVistaMortgageCalculator />

        {/* Multi-step Private Viewing & Consultation Scheduler */}
        <EstateVistaPrivateTour
          properties={ESTATEVISTA_PROPERTIES}
          selectedPropertyForTour={tourProperty}
          onClearSelectedProperty={() => setTourProperty(null)}
        />

        {/* Sample Client Case Vignettes */}
        <EstateVistaTestimonials />

        {/* Advisory FAQ */}
        <EstateVistaFAQ />
      </main>

      {/* 4. Footer & Axivon Conversion Banner */}
      <EstateVistaFooter />

      {/* 5. Modals & Drawers */}
      <EstateVistaPropertyModal
        property={modalProperty}
        onClose={() => setModalProperty(null)}
        onBookTourForProperty={(prop) => {
          handleBookTourFromCard(prop);
        }}
      />

      <EstateVistaComparisonModal
        isOpen={isComparisonOpen}
        comparedProperties={comparedProperties}
        onClose={() => setIsComparisonOpen(false)}
        onRemoveFromCompare={(id) => handleToggleCompare(id)}
        onClearComparison={() => setCompareIds([])}
        onViewProperty={(prop) => {
          setIsComparisonOpen(false);
          setModalProperty(prop);
        }}
      />
    </div>
  );
}
