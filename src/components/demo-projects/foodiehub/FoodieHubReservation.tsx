"use client";

import React, { useState } from "react";
import { UtensilsCrossed, CheckCircle2, RotateCcw, AlertCircle, Info } from "lucide-react";

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
      // Complete client-side only demo interaction
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
      className="relative border-t border-[#E8DFC9] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
            <UtensilsCrossed className="h-3.5 w-3.5 text-[#B85C38]" />
            <span>Table Reservations</span>
          </div>

          <h2
            id="reservations-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            Let's Set a Place for You.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#24221F]/80">
            Use this sample reservation form to explore how a restaurant booking
            experience could work.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mt-8 rounded-xl border border-[#E2D8C3] bg-[#F8F3EA] p-4 text-xs text-[#24221F]/80 flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-[#B85C38] mt-0.5" />
          <div>
            <span className="font-bold text-[#24221F]">Frontend Demonstration Only:</span>{" "}
            This form is an interactive UI simulation designed by Axivon Technologies.
            No real reservation is booked, no emails are dispatched, and no customer
            records are retained.
          </div>
        </div>

        {/* Form Card or Completion Card */}
        <div className="mt-8 rounded-3xl border border-[#E0D4BE] bg-[#F8F3EA]/50 p-6 sm:p-10 shadow-lg">
          {submitted ? (
            <div
              role="alert"
              className="py-8 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#68735A]/15 text-[#68735A]">
                <CheckCircle2 className="h-10 w-10 text-[#68735A]" />
              </div>

              <h3 className="mt-5 font-serif text-2xl sm:text-3xl font-bold text-[#24221F]">
                Demo interaction completed.
              </h3>

              <p className="mt-3 text-base text-[#24221F]/80 max-w-lg mx-auto">
                No reservation has been created and no information has been sent or stored.
              </p>

              <div className="mt-6 rounded-xl border border-[#E8DFC9] bg-white p-4 max-w-md mx-auto text-left text-xs space-y-1 text-[#24221F]/80">
                <p><strong>Guest:</strong> {formData.guestName}</p>
                <p><strong>Date & Time:</strong> {formData.date} at {formData.time}</p>
                <p><strong>Guests:</strong> {formData.guests} people</p>
                <p><strong>Occasion:</strong> {formData.occasion}</p>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#9E4A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Again / Reset Form</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
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
                    placeholder="e.g. Priyanshu Sharma"
                    className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                      errors.guestName ? "border-red-400" : "border-[#E8DFC9]"
                    }`}
                  />
                  {errors.guestName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.guestName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
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
                    placeholder="e.g. priyanshu@example.com"
                    className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                      errors.email ? "border-red-400" : "border-[#E8DFC9]"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {/* Contact Phone */}
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
                      errors.phone ? "border-red-400" : "border-[#E8DFC9]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Preferred Date */}
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
                      errors.date ? "border-red-400" : "border-[#E8DFC9]"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Preferred Time */}
                <div>
                  <label
                    htmlFor="time"
                    className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                  >
                    Time Slot
                  </label>
                  <select
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-[#E8DFC9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                  >
                    <option value="12:30">12:30 PM (Lunch)</option>
                    <option value="13:30">01:30 PM (Lunch)</option>
                    <option value="19:00">07:00 PM (Dinner)</option>
                    <option value="20:00">08:00 PM (Dinner)</option>
                    <option value="21:00">09:00 PM (Dinner)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Guest Count */}
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
                    className="mt-2 block w-full rounded-xl border border-[#E8DFC9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests (Table for Two)</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="6">6 Guests</option>
                    <option value="8">8+ Guests (Celebration)</option>
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
                    className="mt-2 block w-full rounded-xl border border-[#E8DFC9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                  >
                    <option value="Casual Dining">Casual Dining</option>
                    <option value="Birthday Celebration">Birthday Celebration</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Business Dinner">Business Dinner</option>
                    <option value="Family Gathering">Family Gathering</option>
                  </select>
                </div>
              </div>

              {/* Special Requests Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-bold uppercase tracking-wider text-[#24221F]"
                >
                  Special Requests / Dietary Notes (Optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. High chair needed, prefer outdoor courtyard seating if available..."
                  className="mt-2 block w-full rounded-xl border border-[#E8DFC9] bg-white px-4 py-3 text-sm text-[#24221F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#B85C38] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#9E4A28] hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Submit Demo Reservation Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
