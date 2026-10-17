"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Layers,
  Sparkles,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  Download,
  CheckCircle2,
  DollarSign,
  Calculator,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Property, FloorPlan } from "./types";

interface EstateVistaPropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onBookTourForProperty: (property: Property) => void;
}

export default function EstateVistaPropertyModal({
  property,
  onClose,
  onBookTourForProperty,
}: EstateVistaPropertyModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "floorplans" | "amenities" | "financing">("overview");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (property) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [property, onClose]);

  if (!property) return null;

  // Monthly financing calculation estimation
  const downPayment = property.price * 0.2;
  const loanAmount = property.price - downPayment;
  const interestRate = 0.065 / 12; // 6.5% annual
  const totalMonths = 30 * 12; // 30 years
  const monthlyPI =
    (loanAmount * (interestRate * Math.pow(1 + interestRate, totalMonths))) /
    (Math.pow(1 + interestRate, totalMonths) - 1);
  const monthlyTax = (property.price * 0.012) / 12; // 1.2% property tax
  const monthlyInsurance = (property.price * 0.0035) / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + property.hoaMonthly;

  const handleDownloadDossier = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const currentPlan: FloorPlan | undefined = property.floorPlans[selectedPlanIndex] || property.floorPlans[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#E4E0D7] overflow-hidden"
        >
          {/* ── Modal Header ──────────────────────────────────────────── */}
          <div className="flex items-start justify-between border-b border-[#E4E0D7] p-5 sm:p-6 bg-[#F9F8F5]">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="rounded-full bg-[#123C32] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {property.propertyType}
                </span>
                <span className="text-xs font-semibold text-[#C59B63]">
                  {property.statusTag}
                </span>
                <span className="text-xs text-[#7C8882]">&bull;</span>
                <span className="text-xs text-[#7C8882]">{property.architecturalStyle}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A211E] tracking-tight">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#5C6661] mt-1">
                <MapPin className="h-3.5 w-3.5 text-[#C59B63] shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E0D7] bg-white text-[#1A211E] hover:bg-[#F1EFEA] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#123C32] mt-3">
                {property.formattedPrice}
              </div>
            </div>
          </div>

          {/* ── Tab Navigation ────────────────────────────────────────── */}
          <div className="flex items-center gap-1 border-b border-[#E4E0D7] px-5 sm:px-6 bg-white overflow-x-auto text-xs font-semibold">
            {[
              { id: "overview", label: "Overview & Specs" },
              { id: "floorplans", label: "Architectural Floor Plans" },
              { id: "amenities", label: "Features & Amenities" },
              { id: "financing", label: "Mortgage & Costs" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#123C32] text-[#123C32] font-bold"
                    : "border-transparent text-[#5C6661] hover:text-[#1A211E]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Modal Body Content ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* TAB 1: OVERVIEW & SPECS */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Visual Banner Preview */}
                <div
                  className={`relative aspect-[21/9] w-full rounded-xl bg-gradient-to-r ${property.images[0].gradientClass} p-6 flex flex-col justify-end text-white overflow-hidden shadow-xs`}
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B63]">
                      Primary View
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      {property.images[0].caption}
                    </h3>
                  </div>
                </div>

                {/* Narrative Overview */}
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1A211E] mb-2">
                    Architectural Narrative
                  </h4>
                  <p className="text-sm text-[#5C6661] leading-relaxed">
                    {property.overview}
                  </p>
                </div>

                {/* Key Technical Specifications Grid */}
                <div className="rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#123C32] mb-3">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Bedrooms
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        {property.bedrooms} Beds
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Bathrooms
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        {property.bathrooms} Baths
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Total Area
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        {property.areaSqFt.toLocaleString()} sq.ft
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Price / sq.ft
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        ${property.pricePerSqFt.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Year Built
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        {property.yearBuilt}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Monthly HOA
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        ${property.hoaMonthly.toLocaleString()}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Property Type
                      </span>
                      <span className="font-semibold text-[#1A211E] mt-0.5 block">
                        {property.propertyType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C8882] block">
                        Title Status
                      </span>
                      <span className="font-semibold text-[#2E6B56] mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Freehold
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FLOOR PLANS */}
            {activeTab === "floorplans" && (
              <div className="space-y-6">
                {/* Level Switcher (if multiple) */}
                {property.floorPlans.length > 1 && (
                  <div className="flex gap-2 border-b border-[#E4E0D7] pb-3">
                    {property.floorPlans.map((plan, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPlanIndex(idx)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedPlanIndex === idx
                            ? "bg-[#123C32] text-white shadow-2xs"
                            : "bg-[#F1EFEA] text-[#5C6661] hover:text-[#1A211E]"
                        }`}
                      >
                        {plan.levelName}
                      </button>
                    ))}
                  </div>
                )}

                {/* Plan Details & Zone Breakdown */}
                {currentPlan && (
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <h4 className="font-serif text-lg font-bold text-[#1A211E]">
                        {currentPlan.levelName}
                      </h4>
                      <span className="text-xs font-semibold text-[#123C32]">
                        Total Floor Area: {currentPlan.totalAreaSqFt.toLocaleString()} sq.ft
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {currentPlan.zones.map((zone) => (
                        <div
                          key={zone.id}
                          className="rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] p-3.5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-bold text-[#1A211E]">{zone.name}</h5>
                            <span className="text-[11px] font-mono font-semibold text-[#C59B63]">
                              {zone.dimensions}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5C6661] line-clamp-2">
                            {zone.description}
                          </p>
                          <div className="mt-2 text-[10px] font-medium text-[#7C8882]">
                            Area: {zone.areaSqFt} sq.ft
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Blueprint Visual Demonstration Notice */}
                    <div className="flex items-center gap-3 rounded-xl border border-[#123C32]/15 bg-[#123C32]/5 p-3.5 text-xs text-[#123C32]">
                      <Layers className="h-4 w-4 text-[#C59B63] shrink-0" />
                      <span>
                        CAD architectural blue prints and engineering schematics are available in the
                        complete property dossier.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FEATURES & AMENITIES */}
            {activeTab === "amenities" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1A211E] mb-3">
                    Private Amenities & Resort Infrastructure
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {property.keyAmenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] px-3.5 py-2.5 text-xs font-medium text-[#1A211E]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#2E6B56] shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-[#1A211E] mb-3">
                    Architectural & Structural Highlights
                  </h4>
                  <div className="space-y-2">
                    {property.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-[#5C6661]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C59B63] mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FINANCING & EXPENSE PROJECTION */}
            {activeTab === "financing" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#1A211E]">
                        Estimated Monthly Ownership Projection
                      </h4>
                      <p className="text-xs text-[#5C6661]">
                        Based on 20% down payment, 30-year fixed loan at 6.50% APR.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-[#7C8882] block">
                        Estimated Total
                      </span>
                      <span className="font-serif text-2xl font-bold text-[#123C32]">
                        ${Math.round(totalMonthly).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Monthly Cost Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-[#E4E0D7]">
                    <div>
                      <span className="text-[10px] text-[#7C8882] block">Principal & Interest</span>
                      <span className="font-bold text-[#1A211E]">
                        ${Math.round(monthlyPI).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7C8882] block">Est. Property Tax</span>
                      <span className="font-bold text-[#1A211E]">
                        ${Math.round(monthlyTax).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7C8882] block">Homeowners Insurance</span>
                      <span className="font-bold text-[#1A211E]">
                        ${Math.round(monthlyInsurance).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7C8882] block">Monthly HOA Fee</span>
                      <span className="font-bold text-[#1A211E]">
                        ${property.hoaMonthly.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-[#E4E0D7] bg-white">
                  <div>
                    <h5 className="text-xs font-bold text-[#1A211E]">
                      Need custom financing or offshore advisory?
                    </h5>
                    <p className="text-[11px] text-[#5C6661]">
                      Our private banking associates can structure jumbo loans and family office
                      acquisitions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBookTourForProperty(property)}
                    className="rounded-lg bg-[#123C32] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0D2D25] transition-colors"
                  >
                    Inquire Privately
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Modal Footer ──────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E0D7] bg-[#F9F8F5] p-4 sm:p-5">
            {/* Simulated Dossier Download */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadDossier}
                className="flex items-center gap-1.5 rounded-xl border border-[#E4E0D7] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A211E] hover:border-[#123C32] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-[#C59B63]" />
                <span>Download Dossier (PDF)</span>
              </button>

              {downloadSuccess && (
                <span className="text-xs font-semibold text-[#2E6B56] animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Dossier generated successfully
                </span>
              )}
            </div>

            {/* Direct Booking Action */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E4E0D7] bg-white px-4 py-2 text-xs font-semibold text-[#5C6661] hover:text-[#1A211E] hover:bg-[#F1EFEA] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookTourForProperty(property);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#123C32] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0D2D25] transition-all"
              >
                <Calendar className="h-3.5 w-3.5 text-[#C59B63]" />
                <span>Schedule Private Viewing</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
