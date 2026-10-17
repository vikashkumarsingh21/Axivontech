"use client";

import React, { useEffect } from "react";
import { X, Scale, Trash2, CheckCircle2, ArrowRight, Building2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Property } from "./types";

interface EstateVistaComparisonModalProps {
  isOpen: boolean;
  comparedProperties: Property[];
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
  onClearComparison: () => void;
  onViewProperty: (property: Property) => void;
}

export default function EstateVistaComparisonModal({
  isOpen,
  comparedProperties,
  onClose,
  onRemoveFromCompare,
  onClearComparison,
  onViewProperty,
}: EstateVistaComparisonModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#E4E0D7] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E0D7] bg-[#F9F8F5] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123C32] text-[#C59B63]">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A211E]">
                  Architectural Comparison
                </h3>
                <p className="text-xs text-[#5C6661]">
                  Compare specifications, valuations, and spatial metrics side-by-side.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comparedProperties.length > 0 && (
                <button
                  type="button"
                  onClick={onClearComparison}
                  className="rounded-lg border border-[#E4E0D7] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C6661] hover:text-red-700 hover:border-red-200 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close comparison modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E0D7] bg-white text-[#1A211E] hover:bg-[#F1EFEA] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7">
            {comparedProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Scale className="h-12 w-12 text-[#C59B63] mb-3 opacity-60" />
                <h4 className="font-serif text-lg font-bold text-[#1A211E] mb-1">
                  No properties selected for comparison
                </h4>
                <p className="text-xs text-[#5C6661] max-w-sm mb-4">
                  Click the balance scale icon on any property card to select up to 3 residences and
                  compare their architectural attributes.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-[#123C32] px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Explore Residences
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E0D7]">
                      <th className="py-3 px-4 font-bold text-[#7C8882] uppercase tracking-wider w-40">
                        Attribute
                      </th>
                      {comparedProperties.map((prop) => (
                        <th key={prop.id} className="py-3 px-4 min-w-[240px]">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B63]">
                                {prop.propertyType}
                              </span>
                              <h4 className="font-serif text-base font-bold text-[#1A211E] mt-0.5">
                                {prop.title}
                              </h4>
                              <div className="font-serif text-lg font-bold text-[#123C32] mt-1">
                                {prop.formattedPrice}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveFromCompare(prop.id)}
                              aria-label={`Remove ${prop.title} from comparison`}
                              className="text-[#7C8882] hover:text-red-600 transition-colors p-1"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E0D7]/60">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Location</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#1A211E]">
                          {prop.location}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Price / sq.ft</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 font-semibold text-[#1A211E]">
                          ${prop.pricePerSqFt.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Total Living Area</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 font-semibold text-[#123C32]">
                          {prop.areaSqFt.toLocaleString()} sq.ft
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Bedrooms / Baths</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#1A211E]">
                          {prop.bedrooms} Beds / {prop.bathrooms} Baths
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Architectural Style</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#5C6661]">
                          {prop.architecturalStyle}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Year Built</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#1A211E]">
                          {prop.yearBuilt}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882]">Monthly HOA</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#1A211E]">
                          ${prop.hoaMonthly.toLocaleString()}/mo
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7C8882] align-top">Key Amenities</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 align-top">
                          <ul className="space-y-1">
                            {prop.keyAmenities.slice(0, 4).map((amenity, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 text-[11px] text-[#5C6661]">
                                <span className="h-1 w-1 rounded-full bg-[#C59B63]" />
                                <span>{amenity}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-bold text-[#7C8882]">Action</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onViewProperty(prop);
                            }}
                            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#123C32] py-2 text-xs font-bold text-white hover:bg-[#0D2D25] transition-all"
                          >
                            <span>Inspect Dossier</span>
                            <ArrowRight className="h-3 w-3 text-[#C59B63]" />
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
