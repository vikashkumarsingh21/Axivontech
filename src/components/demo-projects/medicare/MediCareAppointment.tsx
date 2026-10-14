"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Lock,
  User,
  Mail,
  Phone,
  Building2,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  { label: "Morning", time: "9:00 AM – 12:00 PM" },
  { label: "Afternoon", time: "1:00 PM – 4:00 PM" },
  { label: "Evening", time: "5:00 PM – 7:30 PM" },
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
      className="bg-white py-18 sm:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <Calendar className="h-3.5 w-3.5" />
            <span>Outpatient Scheduling Interface</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Request an Outpatient Consultation
          </h2>
          <p className="mt-3 text-base text-[#4A6577] sm:text-lg max-w-2xl mx-auto">
            Experience our streamlined consultation booking workflow designed for calm, transparent, and prompt healthcare access.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D4E8E0] bg-[#EAF6F2] p-4 text-xs text-[#263746]">
          <Info className="h-5 w-5 shrink-0 text-[#147D78] mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[#147D78]">Demonstration Showcase: </span>
            This interactive interface validates your inputs locally on the client. No real appointments are booked, and no medical records or personal data are stored or transmitted.
          </div>
        </div>

        {/* Booking Container */}
        <div className="mt-8 rounded-3xl border border-[#D4E8E0] bg-white p-6 sm:p-10 shadow-[0_12px_40px_rgba(20,125,120,0.08)]">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* Honest Completion State */
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="py-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0] shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-[#147D78]" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#263746]">
                  Demonstration Booking Confirmed
                </h3>
                <p className="mt-2.5 max-w-md mx-auto text-sm leading-relaxed text-[#4A6577]">
                  No real booking was made and no personal data was retained. This demonstrates the full interactive patient scheduling journey.
                </p>

                {/* Simulated Appointment Pass */}
                <div className="mt-6 max-w-lg mx-auto rounded-2xl bg-[#F0F7F4] p-5 border border-[#D4E8E0] text-left text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D4E8E0] pb-2.5">
                    <span className="font-bold text-[#147D78] uppercase text-[10px] tracking-wider">
                      Simulated Consultation Pass
                    </span>
                    <span className="font-mono font-bold text-[#263746]">REF: MC-84920</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[#263746]">
                    <div>
                      <span className="text-[#8A9BAA] block text-[10px] uppercase font-bold">Patient Name</span>
                      <span className="font-semibold text-xs">{formData.patientName}</span>
                    </div>
                    <div>
                      <span className="text-[#8A9BAA] block text-[10px] uppercase font-bold">Department</span>
                      <span className="font-semibold text-xs text-[#147D78]">{formData.department}</span>
                    </div>
                    <div>
                      <span className="text-[#8A9BAA] block text-[10px] uppercase font-bold">Preferred Date</span>
                      <span className="font-semibold text-xs">{formData.preferredDate}</span>
                    </div>
                    <div>
                      <span className="text-[#8A9BAA] block text-[10px] uppercase font-bold">Time Window</span>
                      <span className="font-semibold text-xs">{formData.preferredTime}</span>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="pt-2 border-t border-[#D4E8E0]/70 text-[11px] text-[#4A6577]">
                      <span className="font-bold text-[#263746]">Notes:</span> {formData.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#D4E8E0] bg-white px-5 py-3 text-xs font-bold text-[#263746] hover:bg-[#F0F7F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset &amp; Test Again</span>
                  </button>

                  <Link
                    href="/contact?project=MediCare#contact-form"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0F5C55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Build This Booking Experience with Axivon</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Interactive Booking Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Patient Name */}
                  <div>
                    <label
                      htmlFor="patientName"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                    >
                      <User className="h-3.5 w-3.5 text-[#147D78]" />
                      <span>Patient Full Name</span>
                      <span className="text-[#E8735A]">*</span>
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
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-[#263746] placeholder-[#8A9BAA] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.patientName ? "border-red-400 bg-red-50/30" : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
                      }`}
                    />
                    {errors.patientName && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errors.patientName}</span>
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="email"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#147D78]" />
                      <span>Email Address</span>
                      <span className="text-[#E8735A]">*</span>
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
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-[#263746] placeholder-[#8A9BAA] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.email ? "border-red-400 bg-red-50/30" : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#147D78]" />
                      <span>Contact Phone Number</span>
                      <span className="text-[#E8735A]">*</span>
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
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-[#263746] placeholder-[#8A9BAA] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.phone ? "border-red-400 bg-red-50/30" : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Department Selection */}
                  <div>
                    <label
                      htmlFor="department"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                    >
                      <Building2 className="h-3.5 w-3.5 text-[#147D78]" />
                      <span>Medical Department</span>
                      <span className="text-[#E8735A]">*</span>
                    </label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => {
                        setFormData({ ...formData, department: e.target.value });
                        if (errors.department) setErrors({ ...errors, department: undefined });
                      }}
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-[#263746] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.department ? "border-red-400 bg-red-50/30" : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
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
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errors.department}</span>
                      </p>
                    )}
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label
                      htmlFor="preferredDate"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#147D78]" />
                      <span>Preferred Date</span>
                      <span className="text-[#E8735A]">*</span>
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
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-[#263746] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.preferredDate ? "border-red-400 bg-red-50/30" : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errors.preferredDate}</span>
                      </p>
                    )}
                  </div>

                  {/* Preferred Time Window Chips / Select */}
                  <div>
                    <label
                      htmlFor="preferredTime"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                    >
                      <Clock className="h-3.5 w-3.5 text-[#147D78]" />
                      <span>Preferred Time Window</span>
                      <span className="text-[#E8735A]">*</span>
                    </label>
                    <select
                      id="preferredTime"
                      value={formData.preferredTime}
                      onChange={(e) => {
                        setFormData({ ...formData, preferredTime: e.target.value });
                        if (errors.preferredTime) setErrors({ ...errors, preferredTime: undefined });
                      }}
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm text-[#263746] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.preferredTime ? "border-red-400 bg-red-50/30" : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
                      }`}
                    >
                      <option value="">Select a Time Window...</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.label} value={`${slot.label} (${slot.time})`}>
                          {slot.label} ({slot.time})
                        </option>
                      ))}
                    </select>
                    {errors.preferredTime && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
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
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#263746]"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#147D78]" />
                    <span>Optional Notes (Non-sensitive general enquiries only)</span>
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Requesting a first-time routine health consultation or annual follow-up."
                    className="mt-2 block w-full rounded-xl border border-[#D4E8E0] bg-white px-4 py-3 text-sm text-[#263746] placeholder-[#8A9BAA] transition-all focus:outline-none focus:ring-2 focus:ring-[#147D78]"
                  />
                </div>

                {/* Privacy & Guarantee note */}
                <div className="flex items-center gap-2 text-[11px] text-[#4A6577] bg-[#F0F7F4] p-3 rounded-xl border border-[#D4E8E0]">
                  <Lock className="h-3.5 w-3.5 text-[#147D78] shrink-0" />
                  <span>
                    Your privacy is protected. MediCare does not share patient details with third parties.
                  </span>
                </div>

                {/* Form Action Button: Prominent Warm Coral */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#E8735A] py-4 text-sm font-bold text-white shadow-[0_6px_20px_rgba(232,115,90,0.32)] transition-all duration-200 hover:bg-[#D96047] hover:shadow-[0_8px_25px_rgba(232,115,90,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8735A] focus-visible:ring-offset-2 active:scale-[0.99]"
                  >
                    Confirm Demonstration Appointment Request
                  </button>
                  <p className="mt-2.5 text-center text-[11px] text-[#8A9BAA]">
                    Client-side validation test · Zero server records created
                  </p>
                </div>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
