"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  Building,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Property } from "./types";

interface EstateVistaPrivateTourProps {
  properties: Property[];
  selectedPropertyForTour: Property | null;
  onClearSelectedProperty: () => void;
}

export default function EstateVistaPrivateTour({
  properties,
  selectedPropertyForTour,
  onClearSelectedProperty,
}: EstateVistaPrivateTourProps) {
  const [tourType, setTourType] = useState<"in-person" | "virtual">("in-person");
  const [propertyId, setPropertyId] = useState<string>(
    selectedPropertyForTour ? selectedPropertyForTour.id : "all"
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("30-90-days");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  // Sync when selectedPropertyForTour updates from parent modal/card
  useEffect(() => {
    if (selectedPropertyForTour) {
      setPropertyId(selectedPropertyForTour.id);
    }
  }, [selectedPropertyForTour]);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!phone.trim()) errs.phone = "Phone number is required for security clearance";
    if (!selectedDate) errs.selectedDate = "Please choose a viewing date";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate frontend scheduling
    setTimeout(() => {
      setIsSubmitting(false);
      const randomCode = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
      setConfirmationCode(randomCode);
    }, 900);
  };

  const handleReset = () => {
    setConfirmationCode(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    onClearSelectedProperty();
  };

  const chosenProperty = properties.find((p) => p.id === propertyId);

  return (
    <section id="tour" className="py-16 sm:py-24 bg-white border-b border-[#E4E0D7] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C59B63] mb-2">
            <Calendar className="h-3 w-3" />
            <span>Private Viewing Concierge</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1A211E]">
            Schedule a Private Viewing or Consultation
          </h2>
          <p className="text-sm text-[#5C6661] mt-2 leading-relaxed">
            Select your preferred viewing format, scheduling window, and specific residence of
            interest. All consultations and property walkthroughs are executed under strict
            nondisclosure protocols.
          </p>
        </div>

        {/* ── Main Booking Form Card ────────────────────────────────── */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#E4E0D7] bg-[#F9F8F5] p-6 sm:p-10 shadow-sm">
          {confirmationCode ? (
            /* Simulated Booking Confirmation State */
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#123C32]/10 text-[#123C32]">
                <CheckCircle2 className="h-8 w-8 text-[#2E6B56]" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C59B63]">
                  Viewing Request Registered
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A211E] mt-1">
                  Private Itinerary Confirmed: {confirmationCode}
                </h3>
                <p className="text-xs text-[#5C6661] max-w-md mx-auto mt-2">
                  Thank you, <span className="font-semibold text-[#1A211E]">{fullName}</span>. A
                  senior associate from EstateVista will contact you via {email} to coordinate
                  gate access and verification.
                </p>
              </div>

              {/* Itinerary Summary Card */}
              <div className="rounded-xl border border-[#E4E0D7] bg-white p-5 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7C8882]">Viewing Format:</span>
                  <span className="font-semibold text-[#123C32] capitalize">
                    {tourType === "in-person"
                      ? "In-Person Escorted Tour"
                      : "4K Guided Drone Conference"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8882]">Residence:</span>
                  <span className="font-semibold text-[#1A211E]">
                    {chosenProperty ? chosenProperty.title : "General Portfolio Consultation"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8882]">Scheduled Date:</span>
                  <span className="font-semibold text-[#1A211E]">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8882]">Time Slot:</span>
                  <span className="font-semibold text-[#1A211E]">
                    {selectedTime === "10:00"
                      ? "10:00 AM (Morning Natural Light)"
                      : selectedTime === "14:00"
                      ? "2:00 PM (Afternoon)"
                      : "5:30 PM (Sunset Twilight Lighting)"}
                  </span>
                </div>
              </div>

              {/* Honest Demo Disclaimer Notice */}
              <div className="rounded-xl border border-[#C59B63]/25 bg-[#C59B63]/10 p-3.5 text-xs text-[#123C32] max-w-md mx-auto">
                <span className="font-bold block mb-0.5">Frontend Demonstration Note:</span>
                <span>
                  This is an interactive simulation demonstrating Axivon Technologies&apos; real
                  estate appointment scheduling workflow. No real booking was placed.
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#123C32] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D2D25] transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#C59B63]" />
                  <span>Schedule Another Demonstration Tour</span>
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Booking Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Format Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#123C32] mb-3">
                  Step 1 &middot; Select Viewing Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTourType("in-person")}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      tourType === "in-person"
                        ? "border-[#123C32] bg-white shadow-xs ring-1 ring-[#123C32]"
                        : "border-[#E4E0D7] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <Building className="h-5 w-5 text-[#123C32] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#1A211E]">
                        In-Person Escorted Viewing
                      </div>
                      <div className="text-[11px] text-[#5C6661] mt-0.5">
                        Private walkthrough with an architectural specialist and managing partner.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTourType("virtual")}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      tourType === "virtual"
                        ? "border-[#123C32] bg-white shadow-xs ring-1 ring-[#123C32]"
                        : "border-[#E4E0D7] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <Video className="h-5 w-5 text-[#C59B63] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#1A211E]">
                        4K Drone & Video Conference
                      </div>
                      <div className="text-[11px] text-[#5C6661] mt-0.5">
                        Live guided virtual tour with floor plan CAD overlays for remote buyers.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Property of Interest */}
              <div>
                <label htmlFor="property-tour-select" className="block text-xs font-bold uppercase tracking-wider text-[#123C32] mb-2">
                  Step 2 &middot; Residence of Interest
                </label>
                <select
                  id="property-tour-select"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs font-semibold text-[#1A211E] focus:border-[#123C32] focus:outline-none cursor-pointer"
                >
                  <option value="all">General Portfolio Consultation (Multiple Residences)</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} &mdash; {p.formattedPrice} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Date & Preferred Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="viewing-date" className="block text-xs font-bold uppercase tracking-wider text-[#123C32] mb-2">
                    Step 3A &middot; Viewing Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="viewing-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none cursor-pointer"
                  />
                  {errors.selectedDate && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.selectedDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="viewing-time" className="block text-xs font-bold uppercase tracking-wider text-[#123C32] mb-2">
                    Step 3B &middot; Preferred Time Window
                  </label>
                  <select
                    id="viewing-time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none cursor-pointer"
                  >
                    <option value="10:00">10:00 AM (Morning Architectural Light)</option>
                    <option value="14:00">2:00 PM (Midday Solar Clarity)</option>
                    <option value="17:30">5:30 PM (Sunset Twilight Ambiance)</option>
                  </select>
                </div>
              </div>

              {/* Step 4: Client Contact Information */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#123C32] mb-3">
                  Step 4 &middot; Client Credentials & Verification
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="client-name" className="block text-[11px] font-semibold text-[#5C6661] mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none"
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="client-email" className="block text-[11px] font-semibold text-[#5C6661] mb-1">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. evance@familyoffice.com"
                      className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="client-phone" className="block text-[11px] font-semibold text-[#5C6661] mb-1">
                      Mobile / Direct Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="client-timeline" className="block text-[11px] font-semibold text-[#5C6661] mb-1">
                      Anticipated Acquisition Timeline
                    </label>
                    <select
                      id="client-timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none cursor-pointer"
                    >
                      <option value="immediate">Immediate (0 &ndash; 30 Days)</option>
                      <option value="30-90-days">Within 30 &ndash; 90 Days</option>
                      <option value="longterm">6+ Months / Strategic Portfolio Hold</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="client-notes" className="block text-[11px] font-semibold text-[#5C6661] mb-1">
                    Confidential Requirements or Specific Architectural Inquiries
                  </label>
                  <textarea
                    id="client-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Please arrange for private helipad arrival, or focus walkthrough on subterranean parking..."
                    className="w-full rounded-xl border border-[#E4E0D7] bg-white py-2.5 px-3 text-xs text-[#1A211E] focus:border-[#123C32] focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Submit Button & Discretion Notice */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E4E0D7]">
                <div className="flex items-center gap-2 text-xs text-[#5C6661]">
                  <ShieldCheck className="h-4 w-4 text-[#2E6B56] shrink-0" />
                  <span>Strict Nondisclosure Protocol &bull; No Spam Guarantee</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#123C32] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#0D2D25] disabled:opacity-70 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#C59B63]" />
                      <span>Transmitting Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Private Viewing Request</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#C59B63]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
