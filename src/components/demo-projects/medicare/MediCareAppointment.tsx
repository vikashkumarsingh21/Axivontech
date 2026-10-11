"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, AlertCircle, Info, Sparkles, RefreshCw } from "lucide-react";

interface AppointmentForm {
  patientName: string;
  email: string;
  phone: string;
  department: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

const INITIAL_FORM: AppointmentForm = {
  patientName: "",
  email: "",
  phone: "",
  department: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

const DEPARTMENTS = [
  "Cardiology",
  "Orthopaedics",
  "Dermatology",
  "Paediatrics",
  "Neurology",
  "General Medicine",
];

const TIME_SLOTS = [
  "Morning (9:00 AM – 12:00 PM)",
  "Afternoon (1:00 PM – 4:00 PM)",
  "Evening (5:00 PM – 7:00 PM)",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s-]{7,15}$/;

export default function MediCareAppointment() {
  const [formData, setFormData] = useState<AppointmentForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Minimum date = today
  const todayStr = new Date().toISOString().split("T")[0];

  const validate = (): boolean => {
    const errs: Partial<Record<keyof AppointmentForm, string>> = {};

    if (!formData.patientName.trim() || formData.patientName.trim().length < 2) {
      errs.patientName = "Please enter patient name (minimum 2 characters).";
    }

    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = "Please provide a valid email address.";
    }

    if (!formData.phone.trim() || !PHONE_REGEX.test(formData.phone.trim())) {
      errs.phone = "Please enter a valid contact phone number.";
    }

    if (!formData.department) {
      errs.department = "Please select a medical department.";
    }

    if (!formData.preferredDate) {
      errs.preferredDate = "Please choose your preferred consultation date.";
    } else if (formData.preferredDate < todayStr) {
      errs.preferredDate = "Consultation date cannot be in the past.";
    }

    if (!formData.preferredTime) {
      errs.preferredTime = "Please select a preferred consultation time window.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section
      id="appointment"
      aria-label="Appointment Request Interface"
      className="bg-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <Calendar className="h-3.5 w-3.5" />
            <span>Interactive Booking Showcase</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Request an Outpatient Consultation
          </h2>
          <p className="mt-3 text-base text-[#263746]/80 sm:text-lg">
            Experience our sample appointment request interface designed for straightforward, calm scheduling.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#C9DED6] bg-[#EAF6F2] p-4 text-xs text-[#263746]/85">
          <Info className="h-5 w-5 shrink-0 text-[#147D78] mt-0.5" />
          <div>
            <span className="font-bold text-[#147D78]">Frontend Showcase Notice: </span>
            This is an interactive user-experience demonstration. No real appointments are booked, and no medical records or personal data are transmitted or stored on any server. Please do not input real sensitive medical details.
          </div>
        </div>

        {/* Booking Container */}
        <div className="mt-8 rounded-2xl border border-[#C9DED6] bg-white p-6 sm:p-10 shadow-sm">
          {submitted ? (
            /* Honest Completion Notice */
            <div className="py-8 text-center animate-in fade-in duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF6F2] text-[#147D78] border border-[#C9DED6]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-[#263746]">
                Demo Interaction Completed
              </h3>
              <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed text-[#263746]/80">
                No appointment has been booked and no information has been sent or stored. This demonstrates the user validation and feedback journey.
              </p>

              {/* Summary of submitted sample data */}
              <div className="mt-6 max-w-md mx-auto rounded-xl bg-[#EAF6F2]/40 p-4 border border-[#C9DED6] text-left text-xs text-[#263746] space-y-1.5">
                <div className="font-semibold text-[#147D78] uppercase text-[10px] tracking-wider mb-2">
                  Sample Request Parameters
                </div>
                <div><span className="font-medium">Name:</span> {formData.patientName}</div>
                <div><span className="font-medium">Department:</span> {formData.department}</div>
                <div><span className="font-medium">Selected Date:</span> {formData.preferredDate}</div>
                <div><span className="font-medium">Time Window:</span> {formData.preferredTime}</div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#C9DED6] bg-white px-5 py-2.5 text-xs font-semibold text-[#263746] hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Test Form Again</span>
                </button>

                <Link
                  href="/contact?project=MediCare#contact-form"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#147D78] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f605c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Build This Scheduling System With Axivon</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Interactive Booking Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Patient Name */}
                <div>
                  <label
                    htmlFor="patientName"
                    className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    Patient Full Name <span className="text-[#E58A70]">*</span>
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => {
                      setFormData({ ...formData, patientName: e.target.value });
                      if (errors.patientName) setErrors({ ...errors, patientName: undefined });
                    }}
                    placeholder="e.g. Maya Sharma"
                    className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                      errors.patientName ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                    }`}
                  />
                  {errors.patientName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.patientName}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    Email Address <span className="text-[#E58A70]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="e.g. maya@example.com"
                    className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                      errors.email ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    Contact Phone Number <span className="text-[#E58A70]">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="e.g. +91 98765 43210"
                    className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                      errors.phone ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Department Selection */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    Medical Department <span className="text-[#E58A70]">*</span>
                  </label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value });
                      if (errors.department) setErrors({ ...errors, department: undefined });
                    }}
                    className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                      errors.department ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                    }`}
                  >
                    <option value="">Select a Department...</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.department}</span>
                    </p>
                  )}
                </div>

                {/* Preferred Date */}
                <div>
                  <label
                    htmlFor="preferredDate"
                    className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    Preferred Date <span className="text-[#E58A70]">*</span>
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    min={todayStr}
                    value={formData.preferredDate}
                    onChange={(e) => {
                      setFormData({ ...formData, preferredDate: e.target.value });
                      if (errors.preferredDate) setErrors({ ...errors, preferredDate: undefined });
                    }}
                    className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                      errors.preferredDate ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                    }`}
                  />
                  {errors.preferredDate && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.preferredDate}</span>
                    </p>
                  )}
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label
                    htmlFor="preferredTime"
                    className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    Preferred Time Window <span className="text-[#E58A70]">*</span>
                  </label>
                  <select
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(e) => {
                      setFormData({ ...formData, preferredTime: e.target.value });
                      if (errors.preferredTime) setErrors({ ...errors, preferredTime: undefined });
                    }}
                    className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                      errors.preferredTime ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                    }`}
                  >
                    <option value="">Select a Time Window...</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.preferredTime && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.preferredTime}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-xs font-bold uppercase tracking-wider text-[#263746]"
                >
                  Optional Notes (Non-sensitive general enquiries only)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Requesting a first-time consultation review."
                  className="mt-2 block w-full rounded-lg border border-[#C9DED6] bg-white px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78]"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#147D78] py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0f605c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] active:scale-[0.99]"
                >
                  Submit Demonstration Request
                </button>
                <p className="mt-2 text-center text-[11px] text-[#263746]/60">
                  Client-side validation test · No backend records created
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
