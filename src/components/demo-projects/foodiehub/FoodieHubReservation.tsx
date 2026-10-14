"use client";

import React, { useState } from "react";
import { UtensilsCrossed, CheckCircle2, RotateCcw, AlertCircle, Info, Calendar, Clock, Users, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReservationState {
  guestName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  occasion: string;
  message: string;
}

const INITIAL_FORM: ReservationState = {
  guestName: "",
  email: "",
  phone: "",
  date: "",
  time: "19:00",
  guests: "2",
  occasion: "Casual Dining",
  message: "",
};

export default function FoodieHubReservation() {
  const [formData, setFormData] = useState<ReservationState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationState, string>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Validate form fields
  function validate() {
    const errs: Partial<Record<keyof ReservationState, string>> = {};

    if (!formData.guestName.trim()) {
      errs.guestName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      errs.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please provide a valid email format.";
    }

    if (!formData.phone.trim()) {
      errs.phone = "Please provide a contact phone number.";
    } else if (formData.phone.trim().length < 8) {
      errs.phone = "Please enter a valid phone number (at least 8 digits).";
    }

    if (!formData.date) {
      errs.date = "Please choose a dining date.";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errs.date = "Reservation date cannot be in the past.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  }

  function handleReset() {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
  }

  return (
    <section
      id="reservations"
      aria-labelledby="reservations-heading"
      className="relative border-t border-[#D4C9B9] bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
            <UtensilsCrossed className="h-3.5 w-3.5 text-[#B85C38]" />
            <span>Table Reservations</span>
          </div>

          <h2
            id="reservations-heading"
            className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            Let's Set a Place for You.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#6B6560]">
            Experience thoughtful dining, warm hospitality, and slow cooking. Reserve your
            table in advance to guarantee an unhurried seating.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mt-8 rounded-2xl border border-[#D4C9B9] bg-[#F8F3EA] p-4 text-xs text-[#6B6560] flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-[#B85C38] mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#24221F]">Interactive Portfolio Demonstration:</strong>{" "}
            This reservation interface is engineered by Axivon Technologies to simulate a luxury
            hospitality booking workflow. No booking fee is required and no actual table is reserved.
          </div>
        </div>

        {/* Form Container Card */}
        <div className="mt-8 rounded-3xl border border-[#D4C9B9] bg-[#F8F3EA]/70 p-6 sm:p-12 shadow-lg">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* High-End Dining Pass Voucher */
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="py-4 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#B85C38]/10 text-[#B85C38] border border-[#B85C38]/30">
                  <CheckCircle2 className="h-9 w-9 text-[#B85C38]" />
                </div>

                <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.25em] text-[#C4964C]">
                  Simulation Confirmed
                </span>

                <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#24221F]">
                  Your Place Has Been Prepared.
                </h3>

                <p className="mt-2 text-sm text-[#6B6560] max-w-md mx-auto">
                  Thank you, <strong className="text-[#24221F]">{formData.guestName}</strong>. This demo workflow simulates instant table hold and confirmation.
                </p>

                {/* Voucher Pass Presentation */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-[#D4C9B9] bg-white p-6 sm:p-8 text-left shadow-sm max-w-lg mx-auto">
                  <div className="flex items-center justify-between border-b border-[#D4C9B9] pb-4">
                    <div>
                      <span className="font-serif text-lg font-bold tracking-wider text-[#24221F]">
                        SAFFRON & STONE
                      </span>
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-[#6B6560]">
                        Guest Hospitality Voucher
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#B85C38]">
                      SEAT #07 · SALON
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#9E9790]">
                        Primary Guest
                      </span>
                      <span className="font-semibold text-[#24221F]">{formData.guestName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#9E9790]">
                        Party Size
                      </span>
                      <span className="font-semibold text-[#24221F]">{formData.guests} Guests</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#9E9790]">
                        Reserved Date
                      </span>
                      <span className="font-semibold text-[#24221F]">{formData.date}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-[#9E9790]">
                        Seating Slot
                      </span>
                      <span className="font-semibold text-[#24221F]">{formData.time}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] uppercase tracking-wider text-[#9E9790]">
                        Occasion / Notes
                      </span>
                      <span className="font-semibold text-[#24221F]">
                        {formData.occasion} {formData.message ? `— “${formData.message}”` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#D4C9B9]/60 pt-3 text-[10px] text-[#6B6560] flex items-center justify-between">
                    <span>Dress Code: Smart Casual</span>
                    <span className="text-[#C4964C] font-semibold">Unhurried 2h Window</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4C9B9] bg-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#24221F] shadow-sm transition-all hover:border-[#B85C38] hover:text-[#B85C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Booking Form</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Interactive Reservation Form */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Guest Name */}
                  <div>
                    <label
                      htmlFor="guestName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Guest Name <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      id="guestName"
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      placeholder="e.g. Radhika Sen"
                      className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                        errors.guestName ? "border-red-400" : "border-[#D4C9B9]"
                      }`}
                    />
                    {errors.guestName && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.guestName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Email Address <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. radhika@example.com"
                      className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                        errors.email ? "border-red-400" : "border-[#D4C9B9]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Phone Number <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                        errors.phone ? "border-red-400" : "border-[#D4C9B9]"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Dining Date <span className="text-[#B85C38]">*</span>
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                        errors.date ? "border-red-400" : "border-[#D4C9B9]"
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Time slot */}
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Seating Slot
                    </label>
                    <select
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-2 block w-full rounded-xl border border-[#D4C9B9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                    >
                      <option value="12:30">12:30 PM — Afternoon Service</option>
                      <option value="13:30">01:30 PM — Afternoon Service</option>
                      <option value="19:00">07:00 PM — Evening Degustation</option>
                      <option value="20:00">08:00 PM — Evening Degustation</option>
                      <option value="21:15">09:15 PM — Late Hearth Seating</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Guests */}
                  <div>
                    <label
                      htmlFor="guests"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Number of Guests
                    </label>
                    <select
                      id="guests"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="mt-2 block w-full rounded-xl border border-[#D4C9B9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                    >
                      <option value="1">1 Guest · Solo Tasting</option>
                      <option value="2">2 Guests · Table for Two</option>
                      <option value="3">3 Guests · Intimate Table</option>
                      <option value="4">4 Guests · Four-Top</option>
                      <option value="6">6 Guests · Feast Table</option>
                      <option value="8">8+ Guests · Private Salon Enquiry</option>
                    </select>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label
                      htmlFor="occasion"
                      className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                    >
                      Occasion (Optional)
                    </label>
                    <select
                      id="occasion"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="mt-2 block w-full rounded-xl border border-[#D4C9B9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                    >
                      <option value="Casual Dining">Casual Dining</option>
                      <option value="Birthday Celebration">Birthday Celebration</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Business Dinner">Business Dinner</option>
                      <option value="Family Gathering">Family Gathering</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                  >
                    Special Requests or Dietary Requirements (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="e.g. Table away from draughts, strict vegetarian menu, anniversary sparkling cooler..."
                    className="mt-2 block w-full rounded-xl border border-[#D4C9B9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#B85C38] px-9 py-3.5 text-xs uppercase tracking-wider font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#9E4826] hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>Submit Demo Reservation</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
