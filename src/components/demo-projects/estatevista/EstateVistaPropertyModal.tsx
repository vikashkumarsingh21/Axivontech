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
  ChevronLeft,
  ChevronRight,
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (property) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setActiveImageIndex(0);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [property, onClose]);

  if (!property) return null;

  const images = property.images && property.images.length > 0 ? property.images : [
    {
      url: "/images/demo-projects/estatevista/prop-1-exterior.svg",
      alt: property.title,
      caption: property.tagline,
      gradientClass: "from-[#153D32] to-[#102C25]",
    },
  ];

  const currentImage = images[activeImageIndex] || images[0];

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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#FAF8F2] shadow-2xl border border-[#D5CEC1] overflow-hidden"
        >
          {/* ── Modal Header ──────────────────────────────────────────── */}
          <div className="flex items-start justify-between border-b border-[#D5CEC1] p-5 sm:p-6 bg-[#F0EDE5]">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="rounded-full bg-[#153D32] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {property.propertyType}
                </span>
                <span className="text-xs font-semibold text-[#B89A63]">
                  {property.statusTag}
                </span>
                <span className="text-xs text-[#7B817A]">&bull;</span>
                <span className="text-xs text-[#7B817A]">{property.architecturalStyle}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#222A25] tracking-tight">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#626B63] mt-1">
                <MapPin className="h-3.5 w-3.5 text-[#B89A63] shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5CEC1] bg-white text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#153D32] mt-3">
                {property.formattedPrice}
              </div>
            </div>
          </div>

          {/* ── Tab Navigation ────────────────────────────────────────── */}
          <div className="flex items-center gap-1 border-b border-[#D5CEC1] px-5 sm:px-6 bg-[#FAF8F2] overflow-x-auto text-xs font-semibold">
            {[
              { id: "overview", label: "Overview & Gallery" },
              { id: "floorplans", label: "CAD Floor Plans" },
              { id: "amenities", label: "Features & Amenities" },
              { id: "financing", label: "Mortgage & Costs" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#153D32] text-[#153D32] font-bold"
                    : "border-transparent text-[#626B63] hover:text-[#222A25]"
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
                {/* Visual Banner Preview with Real Photography */}
                <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-[#102C25] shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102C25]/85 via-transparent to-black/20" />

                  {/* Previous / Next buttons */}
                  {images.length > 1 && (
                    <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89A63]">
                      View {activeImageIndex + 1} of {images.length}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#FAF8F2]">
                      {currentImage.caption}
                    </h3>
                  </div>
                </div>

                {/* Thumbnails Strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-[16/10] w-20 sm:w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === activeImageIndex
                            ? "border-[#153D32] shadow-md scale-105"
                            : "border-transparent opacity-65 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Narrative Overview */}
                <div>
                  <h4 className="font-serif text-base font-bold text-[#222A25] mb-2">
                    Architectural Narrative
                  </h4>
                  <p className="text-sm text-[#626B63] leading-relaxed">
                    {property.overview}
                  </p>
                </div>

                {/* Core Specifications Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#D5CEC1] bg-[#F0EDE5] p-4 text-xs">
                  <div>
                    <span className="text-[#7B817A] uppercase text-[10px] font-bold">
                      Living Area
                    </span>
                    <p className="font-bold text-[#222A25] text-sm mt-0.5">
                      {property.areaSqFt.toLocaleString()} SQ FT
                    </p>
                  </div>
                  <div>
                    <span className="text-[#7B817A] uppercase text-[10px] font-bold">
                      Bed / Bath
                    </span>
                    <p className="font-bold text-[#222A25] text-sm mt-0.5">
                      {property.bedrooms} Beds / {property.bathrooms} Baths
                    </p>
                  </div>
                  <div>
                    <span className="text-[#7B817A] uppercase text-[10px] font-bold">
                      Price / SQ FT
                    </span>
                    <p className="font-bold text-[#222A25] text-sm mt-0.5">
                      ${property.pricePerSqFt.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#7B817A] uppercase text-[10px] font-bold">
                      Year Completed
                    </span>
                    <p className="font-bold text-[#222A25] text-sm mt-0.5">
                      {property.yearBuilt}
                    </p>
                  </div>
                </div>

                {/* Highlights Checklist */}
                <div>
                  <h4 className="font-serif text-base font-bold text-[#222A25] mb-3">
                    Bespoke Architectural Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#222A25]">
                    {property.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#153D32] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FLOOR PLANS */}
            {activeTab === "floorplans" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5CEC1] pb-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#222A25]">
                      Precision CAD Space Allocation
                    </h4>
                    <p className="text-xs text-[#626B63]">
                      Measured interior volumes and structural dimension schedules.
                    </p>
                  </div>

                  {/* Level Switcher */}
                  <div className="flex items-center gap-1.5 bg-[#DCD5C8] p-1 rounded-xl">
                    {property.floorPlans.map((plan, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPlanIndex(idx)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          selectedPlanIndex === idx
                            ? "bg-[#153D32] text-white shadow-xs"
                            : "text-[#626B63] hover:text-[#222A25]"
                        }`}
                      >
                        Level {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Plan Details */}
                {currentPlan && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs bg-[#F0EDE5] p-3 rounded-xl border border-[#D5CEC1]">
                      <span className="font-bold text-[#222A25]">
                        {currentPlan.levelName}
                      </span>
                      <span className="font-mono text-[#153D32] font-semibold">
                        Total Level Footprint: {currentPlan.totalAreaSqFt.toLocaleString()} SQ FT
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {currentPlan.zones.map((zone) => (
                        <div
                          key={zone.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-[#D5CEC1] bg-white hover:border-[#153D32]/40 transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-xs text-[#222A25]">
                              {zone.name}
                            </div>
                            <div className="text-[11px] text-[#626B63] mt-0.5">
                              {zone.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                            <span className="bg-[#FAF8F2] px-2 py-0.5 rounded border border-[#D5CEC1] text-[#626B63]">
                              {zone.dimensions}
                            </span>
                            <span className="font-bold text-[#153D32]">
                              {zone.areaSqFt} SQ FT
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AMENITIES */}
            {activeTab === "amenities" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#222A25] mb-2">
                    Key Estate Amenities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.keyAmenities.map((amenity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-[#D5CEC1] bg-white p-3 text-xs text-[#222A25]"
                      >
                        <Sparkles className="h-4 w-4 text-[#B89A63] shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#D5CEC1] bg-[#F0EDE5] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#153D32]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Fiduciary Due Diligence Standards</span>
                  </div>
                  <p className="text-[#626B63] leading-relaxed">
                    Title integrity audited, boundary survey confirmed, environmental geotech
                    inspection reports available for qualified private buyers upon NDA execution.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: FINANCING */}
            {activeTab === "financing" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#222A25] mb-1">
                    Carrying Cost & Mortgage Modeler
                  </h4>
                  <p className="text-xs text-[#626B63]">
                    Estimated monthly carrying outlay based on 20% down payment and 6.50% 30-year fixed terms.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-[#D5CEC1] bg-white p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B817A]">
                      List Price
                    </span>
                    <p className="font-serif text-xl font-bold text-[#153D32] mt-1">
                      {property.formattedPrice}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#D5CEC1] bg-white p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B817A]">
                      20% Down Payment
                    </span>
                    <p className="font-serif text-xl font-bold text-[#222A25] mt-1">
                      ${Math.round(downPayment).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#153D32] bg-[#F0EDE5] p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#153D32]">
                      Est. Total Monthly
                    </span>
                    <p className="font-serif text-xl font-bold text-[#153D32] mt-1">
                      ${Math.round(totalMonthly).toLocaleString()} / MO
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-[#D5CEC1] pt-4">
                  <div className="flex justify-between text-[#626B63]">
                    <span>Principal & Interest (Loan: ${Math.round(loanAmount).toLocaleString()})</span>
                    <span className="font-bold text-[#222A25]">${Math.round(monthlyPI).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#626B63]">
                    <span>Estimated Property Taxes (1.2% annual rate)</span>
                    <span className="font-bold text-[#222A25]">${Math.round(monthlyTax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#626B63]">
                    <span>Homeowners Insurance & Hazard Protection</span>
                    <span className="font-bold text-[#222A25]">${Math.round(monthlyInsurance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#626B63]">
                    <span>Monthly HOA & Enclave Security Assessment</span>
                    <span className="font-bold text-[#222A25]">${property.hoaMonthly.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Modal Footer ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#D5CEC1] p-4 sm:p-6 bg-[#F0EDE5]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadDossier}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5CEC1] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-[#153D32]" />
                <span>{downloadSuccess ? "Dossier Prepared!" : "Download PDF Dossier"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial rounded-xl border border-[#D5CEC1] bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#626B63] hover:text-[#222A25]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookTourForProperty(property);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#153D32] hover:bg-[#102C25] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Calendar className="h-3.5 w-3.5 text-[#B89A63]" />
                <span>Book Private Viewing</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
