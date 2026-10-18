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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#FAF8F2] shadow-2xl border border-[#D5CEC1] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D5CEC1] bg-[#F0EDE5] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#153D32] text-[#B89A63]">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#222A25]">
                  Architectural Comparison
                </h3>
                <p className="text-xs text-[#626B63]">
                  Compare specifications, valuations, and spatial metrics side-by-side.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comparedProperties.length > 0 && (
                <button
                  type="button"
                  onClick={onClearComparison}
                  className="rounded-lg border border-[#D5CEC1] bg-white px-3 py-1.5 text-xs font-semibold text-[#626B63] hover:text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close comparison modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D5CEC1] bg-white text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7">
            {comparedProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Scale className="h-12 w-12 text-[#B89A63] mb-3 opacity-60" />
                <h4 className="font-serif text-lg font-bold text-[#222A25] mb-1">
                  No properties selected for comparison
                </h4>
                <p className="text-xs text-[#626B63] max-w-sm mb-4">
                  Click the balance scale icon on any property card to select up to 3 residences and
                  compare their architectural attributes.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-[#153D32] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#102C25] transition-all"
                >
                  Explore Residences
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D5CEC1]">
                      <th className="py-3 px-4 font-bold text-[#7B817A] uppercase tracking-wider w-40">
                        Attribute
                      </th>
                      {comparedProperties.map((prop) => (
                        <th key={prop.id} className="py-3 px-4 min-w-[240px]">
                          {/* Thumbnail Image */}
                          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-3 bg-[#102C25] border border-[#D5CEC1]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prop.images[0]?.url || "/images/demo-projects/estatevista/prop-1-exterior.svg"}
                              alt={prop.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveFromCompare(prop.id)}
                              aria-label={`Remove ${prop.title} from comparison`}
                              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89A63]">
                                {prop.propertyType}
                              </span>
                              <h4 className="font-serif text-base font-bold text-[#222A25] mt-0.5 line-clamp-1">
                                {prop.title}
                              </h4>
                              <div className="font-serif text-lg font-bold text-[#153D32] mt-1">
                                {prop.formattedPrice}
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5CEC1]/70">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Location</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#222A25]">
                          {prop.location}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Price / SQ FT</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 font-semibold text-[#222A25]">
                          ${prop.pricePerSqFt.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Total Living Area</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 font-semibold text-[#153D32]">
                          {prop.areaSqFt.toLocaleString()} SQ FT
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Bedrooms / Baths</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#222A25]">
                          {prop.bedrooms} Beds / {prop.bathrooms} Baths
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Architectural Style</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#626B63]">
                          {prop.architecturalStyle}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Year Built</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#222A25]">
                          {prop.yearBuilt}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Monthly HOA</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4 text-[#222A25]">
                          ${prop.hoaMonthly.toLocaleString()} / mo
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#7B817A]">Detailed Dossier</td>
                      {comparedProperties.map((prop) => (
                        <td key={prop.id} className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => onViewProperty(prop)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#153D32] hover:bg-[#102C25] text-white px-3.5 py-1.5 text-xs font-bold transition-all"
                          >
                            <span>Open Dossier</span>
                            <ArrowRight className="h-3 w-3 text-[#B89A63]" />
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
