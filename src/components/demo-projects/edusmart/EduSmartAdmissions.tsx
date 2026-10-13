"use client";

import React, { useState } from "react";
import { GraduationCap, CheckCircle2, RotateCcw, AlertCircle, Info, Calendar } from "lucide-react";

interface EnquiryState {
  fullName: string;
  email: string;
  phone: string;
  program: string;
  entryTerm: string;
  contactMethod: string;
  message: string;
}

const INITIAL_FORM: EnquiryState = {
  fullName: "",
  email: "",
  phone: "",
  program: "Business Strategy & Innovation",
  entryTerm: "Autumn Cohort 2025",
  contactMethod: "Email",
  message: "",
};

export default function EduSmartAdmissions() {
  const [formData, setFormData] = useState<EnquiryState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryState, string>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const steps = [
    { num: "01", title: "Explore Programs", desc: "Review academic curriculum and research focus areas." },
    { num: "02", title: "Review Guidelines", desc: "Understand prerequisites and documentation requirements." },
    { num: "03", title: "Submit Enquiry", desc: "Connect with our admissions committee through this form." },
    { num: "04", title: "Consultation Call", desc: "Discuss next steps and personalized academic roadmap." },
  ];

  function validate() {
    const errs: Partial<Record<keyof EnquiryState, string>> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      errs.email = "Please enter an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      errs.phone = "Please provide your phone number.";
    } else if (formData.phone.trim().length < 8) {
      errs.phone = "Phone number must be at least 8 digits.";
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
      id="admissions"
      aria-labelledby="admissions-heading"
      className="relative bg-[#F7F3EB] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <GraduationCap className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Admissions Journey</span>
          </div>

          <h2
            id="admissions-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            Take the Next Step
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80">
            Explore the application journey and discover the information you may need before
            making an enquiry.
          </p>
        </div>

        {/* 4 Step Process Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className="rounded-2xl border border-[#E8E1EB] bg-white p-6 shadow-sm"
            >
              <span className="font-serif text-2xl font-bold text-[#B89557]">
                {st.num}
              </span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[#27232A]">
                {st.title}
              </h3>
              <p className="mt-1 text-xs text-[#27232A]/70 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Demo Notice Banner */}
        <div className="mt-10 rounded-2xl border border-[#E8E1EB] bg-white p-4 text-xs text-[#27232A]/80 flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-[#B89557] mt-0.5" />
          <div>
            <strong className="text-[#33243B]">Frontend Demonstration Notice:</strong> This admissions
            form is an interactive interface simulation created by Axivon Technologies. No actual
            academic application is processed, no emails are dispatched, and no personal data is stored.
          </div>
        </div>

        {/* Form Container */}
        <div className="mt-8 rounded-3xl border border-[#E8E1EB] bg-white p-6 sm:p-10 shadow-lg max-w-4xl mx-auto">
          {submitted ? (
            <div role="alert" className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E1EB] text-[#33243B]">
                <CheckCircle2 className="h-10 w-10 text-[#33243B]" />
              </div>

              <h3 className="mt-5 font-serif text-2xl sm:text-3xl font-bold text-[#27232A]">
                Demo interaction completed.
              </h3>

              <p className="mt-3 text-base text-[#27232A]/80 max-w-lg mx-auto">
                No enquiry has been sent or stored. This demonstrates client-side form validation
                and accessible user feedback.
              </p>

              <div className="mt-6 rounded-2xl border border-[#E8E1EB] bg-[#F7F3EB] p-5 max-w-md mx-auto text-left text-xs space-y-1.5 text-[#27232A]/80">
                <p><strong>Candidate:</strong> {formData.fullName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Program of Interest:</strong> {formData.program}</p>
                <p><strong>Entry Term:</strong> {formData.entryTerm}</p>
                <p><strong>Preferred Contact:</strong> {formData.contactMethod}</p>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full bg-[#33243B] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#483353] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
                >
                  <RotateCcw className="h-4 w-4 text-[#B89557]" />
                  <span>Reset Form / Submit Another Enquiry</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#27232A]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ananya Sen"
                    className={`mt-2 block w-full rounded-xl border bg-[#F7F3EB]/30 px-4 py-3 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B] ${
                      errors.fullName ? "border-red-400" : "border-[#E8E1EB]"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="admissionsEmail" className="block text-xs font-bold uppercase tracking-wider text-[#27232A]">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admissionsEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ananya@example.com"
                    className={`mt-2 block w-full rounded-xl border bg-[#F7F3EB]/30 px-4 py-3 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B] ${
                      errors.email ? "border-red-400" : "border-[#E8E1EB]"
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
                {/* Phone */}
                <div>
                  <label htmlFor="admissionsPhone" className="block text-xs font-bold uppercase tracking-wider text-[#27232A]">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admissionsPhone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className={`mt-2 block w-full rounded-xl border bg-[#F7F3EB]/30 px-4 py-3 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B] ${
                      errors.phone ? "border-red-400" : "border-[#E8E1EB]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Program selection */}
                <div>
                  <label htmlFor="program" className="block text-xs font-bold uppercase tracking-wider text-[#27232A]">
                    Program of Interest
                  </label>
                  <select
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-[#E8E1EB] bg-[#F7F3EB]/30 px-4 py-3 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B]"
                  >
                    <option value="Business Strategy & Innovation">Business Strategy & Innovation</option>
                    <option value="Computer Science & Intelligent Systems">Computer Science & Intelligent Systems</option>
                    <option value="Design Systems & Spatial Interaction">Design Systems & Spatial Interaction</option>
                    <option value="Data Science & Quantitative Economics">Data Science & Quantitative Economics</option>
                    <option value="Contemporary Communication & Media">Contemporary Communication & Media</option>
                    <option value="Interdisciplinary Foundation Studies">Interdisciplinary Foundation Studies</option>
                  </select>
                </div>

                {/* Preferred Term */}
                <div>
                  <label htmlFor="entryTerm" className="block text-xs font-bold uppercase tracking-wider text-[#27232A]">
                    Intended Term
                  </label>
                  <select
                    id="entryTerm"
                    value={formData.entryTerm}
                    onChange={(e) => setFormData({ ...formData, entryTerm: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-[#E8E1EB] bg-[#F7F3EB]/30 px-4 py-3 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B]"
                  >
                    <option value="Autumn Cohort 2025">Autumn Cohort 2025</option>
                    <option value="Spring Cohort 2026">Spring Cohort 2026</option>
                    <option value="Summer Immersion 2026">Summer Immersion 2026</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="admissionsMsg" className="block text-xs font-bold uppercase tracking-wider text-[#27232A]">
                  Academic Background or Inquiries (Optional)
                </label>
                <textarea
                  id="admissionsMsg"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share any specific questions regarding curriculum, prerequisites, or scholarship programs..."
                  className="mt-2 block w-full rounded-xl border border-[#E8E1EB] bg-[#F7F3EB]/30 px-4 py-3 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#33243B] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#483353] hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
                >
                  <GraduationCap className="h-4 w-4 text-[#B89557]" />
                  <span>Submit Demo Admissions Enquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
