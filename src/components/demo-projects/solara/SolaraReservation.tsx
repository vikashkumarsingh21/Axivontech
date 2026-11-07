"use client";

import React, { useState } from "react";
import {
  Calendar,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Clock,
} from "lucide-react";

interface ReservationProps {
  initialVilla?: string;
  initialDates?: { checkIn: string; checkOut: string; villa: string; guests: string };
}

export default function SolaraReservation({ initialVilla, initialDates }: ReservationProps) {
  const [formState, setFormState] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkIn: initialDates?.checkIn || "2026-12-10",
    checkOut: initialDates?.checkOut || "2026-12-14",
    villa: initialVilla || initialDates?.villa || "The Forest Villa with Private Plunge Pool",
    adults: "2 Adults",
    children: "0 Children",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  // Calculate nights
  const getNights = () => {
    try {
      const d1 = new Date(formState.checkIn);
      const d2 = new Date(formState.checkOut);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formState.guestName.trim()) errs.guestName = "Guest name is required.";
    if (!formState.email.trim() || !/^\S+@\S+\.\S+$/.test(formState.email)) {
      errs.email = "Valid email is required.";
    }
    if (!formState.phone.trim() || formState.phone.length < 10) {
      errs.phone = "Valid 10-digit phone number is required.";
    }
    if (new Date(formState.checkOut) <= new Date(formState.checkIn)) {
      errs.checkOut = "Check-out date must be after check-in.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ref = `SOL-2026-RES-${Math.floor(1000 + Math.random() * 9000)}`;
      setConfirmedRef(ref);
    }, 850);
  };

  const resetForm = () => {
    setConfirmedRef(null);
    setFormState({
      guestName: "",
      email: "",
      phone: "",
      checkIn: "2026-12-10",
      checkOut: "2026-12-14",
      villa: "The Forest Villa with Private Plunge Pool",
      adults: "2 Adults",
      children: "0 Children",
      specialRequests: "",
    });
    setErrors({});
  };

  return (
    <section id="reservation" className="py-20 bg-[#faf8f5] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            Reserve Your Sanctuary
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
            Curated Stay &amp; Retreat Enquiry
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b665f]">
            Due to our intimate scale of just eighteen villas, we invite prospective guests to submit their preferred dates for personalized concierge coordination.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-3xl border border-[#dfd7cc] bg-[#f5efeb] p-8 sm:p-12 shadow-sm">
          {/* Demo Strip Notice */}
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#1f2e23]/10 border border-[#1f2e23]/20 px-4 py-2.5 text-xs text-[#1f2e23]">
            <Sparkles className="h-4 w-4 text-[#b57a42] shrink-0" />
            <span>
              <strong>Demonstration Notice:</strong> This is a client website demonstration. No real financial transaction takes place and no payment details are requested.
            </span>
          </div>

          {confirmedRef ? (
            <div className="text-center py-10 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f2e23] text-[#c48b56] mx-auto shadow-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1f2e23]">
                Reservation Request Simulated!
              </h3>
              <p className="text-xs sm:text-sm text-[#6b665f] max-w-md mx-auto">
                Thank you, <strong>{formState.guestName}</strong>. Your stay request for <strong>{getNights()} nights</strong> in <strong>{formState.villa}</strong> ({formState.checkIn} to {formState.checkOut}) has been logged successfully.
              </p>
              <div className="inline-block rounded-xl bg-[#faf8f5] border border-[#dfd7cc] px-6 py-3 font-mono text-sm font-bold text-[#1f2e23]">
                Simulated Booking Reference: {confirmedRef}
              </div>
              <p className="text-[11px] text-[#6b665f]">
                In a live hospitality implementation, this immediately triggers a branded WhatsApp/email summary to the guest and locks the provisional dates in the Property Management System (PMS).
              </p>
              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="rounded-full bg-[#1f2e23] px-6 py-2.5 text-xs font-bold text-[#faf8f5] hover:bg-[#283d2e]"
                >
                  Submit Another Demonstration Stay Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Check In */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={formState.checkIn}
                    onChange={(e) => setFormState({ ...formState, checkIn: e.target.value })}
                    className="w-full rounded-xl border border-[#dfd7cc] bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] focus:outline-none focus:ring-1 focus:ring-[#1f2e23]"
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={formState.checkOut}
                    onChange={(e) => setFormState({ ...formState, checkOut: e.target.value })}
                    className={`w-full rounded-xl border bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] focus:outline-none focus:ring-1 focus:ring-[#1f2e23] ${
                      errors.checkOut ? "border-rose-500" : "border-[#dfd7cc]"
                    }`}
                  />
                  {errors.checkOut && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.checkOut}</p>
                  )}
                </div>
              </div>

              {/* Villa Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                  Villa / Suite Category *
                </label>
                <select
                  value={formState.villa}
                  onChange={(e) => setFormState({ ...formState, villa: e.target.value })}
                  className="w-full rounded-xl border border-[#dfd7cc] bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] focus:outline-none focus:ring-1 focus:ring-[#1f2e23]"
                >
                  <option value="The Forest Villa with Private Plunge Pool">The Forest Villa with Private Plunge Pool (INR 32,000/night)</option>
                  <option value="The Canopy Valley Suite">The Canopy Valley Suite (INR 24,000/night)</option>
                  <option value="The Heritage Courtyard Cottage">The Heritage Courtyard Cottage (INR 22,000/night)</option>
                  <option value="Riverside Glamping Pavilion">Riverside Glamping Pavilion (INR 18,000/night)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guest Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                    Primary Guest Name *
                  </label>
                  <input
                    type="text"
                    value={formState.guestName}
                    onChange={(e) => setFormState({ ...formState, guestName: e.target.value })}
                    placeholder="e.g. Vikram Mehra"
                    className={`w-full rounded-xl border bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] placeholder:text-[#999288] focus:outline-none focus:ring-1 focus:ring-[#1f2e23] ${
                      errors.guestName ? "border-rose-500" : "border-[#dfd7cc]"
                    }`}
                  />
                  {errors.guestName && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.guestName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className={`w-full rounded-xl border bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] placeholder:text-[#999288] focus:outline-none focus:ring-1 focus:ring-[#1f2e23] ${
                      errors.phone ? "border-rose-500" : "border-[#dfd7cc]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="e.g. vikram.mehra@example.com"
                  className={`w-full rounded-xl border bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] placeholder:text-[#999288] focus:outline-none focus:ring-1 focus:ring-[#1f2e23] ${
                    errors.email ? "border-rose-500" : "border-[#dfd7cc]"
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-[#1b1916] mb-1">
                  Dietary Preferences / Special Occasion / Flight Arrival (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formState.specialRequests}
                  onChange={(e) => setFormState({ ...formState, specialRequests: e.target.value })}
                  placeholder="e.g. Celebrating 10th anniversary; vegetarian dietary preferences; chauffeur requested from Coimbatore..."
                  className="w-full rounded-xl border border-[#dfd7cc] bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1b1916] placeholder:text-[#999288] focus:outline-none focus:ring-1 focus:ring-[#1f2e23]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f2e23] py-3 text-xs font-bold text-[#faf8f5] hover:bg-[#283d2e] transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <span>Processing Demo Request...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 text-[#c48b56]" />
                      <span>Submit Demonstration Stay Enquiry</span>
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
