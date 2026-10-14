"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Send, ShieldCheck, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

interface FormData {
  fullName: string;
  email: string;
  company: string;
  service: string;
  timeframe: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

export default function NorthlineContact() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    company: "",
    service: "Strategy & Growth",
    timeframe: "Next 30–60 Days",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "Please provide your full executive name.";
    }

    if (!formData.email.trim()) {
      errs.email = "Please provide your corporate email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid corporate email format.";
    }

    if (!formData.message.trim()) {
      errs.message = "Please describe the business challenges or mandate context.";
    } else if (formData.message.trim().length < 15) {
      errs.message = "Please provide at least 15 characters describing your strategic inquiry.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate responsive frontend demonstration handling
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      company: "",
      service: "Strategy & Growth",
      timeframe: "Next 30–60 Days",
      message: "",
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact"
      aria-label="Contact & Inquiries"
      className="relative bg-[#F7F5EF] py-20 sm:py-28 border-b border-[#29483B]/10 overflow-hidden"
    >
      {/* Background Architectural Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#29483B 1px, transparent 1px), linear-gradient(90deg, #29483B 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Context, Protocols & Axivon CTA */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-7 bg-[#B87352]" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
                  START A CONVERSATION
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#252925] leading-tight mb-6">
                Let&apos;s evaluate what&apos;s next for your enterprise.
              </h2>

              <p className="text-base text-[#252925]/80 leading-relaxed mb-8 font-normal">
                Share a concise overview of your operational transition or strategic questions. We review prospective client engagements with rigorous confidentiality and objectivity.
              </p>

              {/* Advisory Discretion Protocol */}
              <div className="space-y-4 pt-6 border-t border-[#29483B]/10 text-xs sm:text-sm text-[#252925]/80">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-[#E2E9E0] text-[#29483B] shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-[#252925] font-semibold text-xs uppercase tracking-wider mb-0.5">
                      Mutual Discretion
                    </strong>
                    <span className="text-xs text-[#252925]/75">
                      All introductory consultations are strictly confidential and governed by non-disclosure standards.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-[#E2E9E0] text-[#29483B] shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-[#252925] font-semibold text-xs uppercase tracking-wider mb-0.5">
                      Direct Partner Review
                    </strong>
                    <span className="text-xs text-[#252925]/75">
                      A senior advisory partner reviews your inquiry and provides candid feedback within one business day.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-[#E2E9E0] text-[#29483B] shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-[#252925] font-semibold text-xs uppercase tracking-wider mb-0.5">
                      Direct Partner Discovery
                    </strong>
                    <span className="text-xs text-[#252925]/75">
                      Your introductory diagnostic is conducted directly with partners, not business development surrogates.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Axivon Banner */}
            <div className="mt-12 rounded-xs border border-[#29483B]/18 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-[#B87352]">
                <Sparkles className="h-4 w-4 text-[#B87352]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                  Axivon Demo Showcase
                </span>
              </div>
              <p className="text-xs text-[#252925]/80 leading-relaxed mb-4 font-normal">
                Looking to commission a bespoke corporate web platform like <strong className="font-semibold text-[#29483B]">CorporatePro</strong> for your consulting firm or enterprise?
              </p>
              <Link
                href="/contact?project=CorporatePro#contact-form"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#29483B] hover:text-[#1e352b]"
              >
                <span>Commission this build with Axivon</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#B87352] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Form Styling with Warm Copper Accents */}
          <div className="lg:col-span-7">
            <div className="rounded-xs border border-[#29483B]/18 bg-white p-8 sm:p-10 shadow-lg relative">
              {/* Frontend Demo Banner */}
              <div className="mb-6 rounded-xs bg-[#E2E9E0]/60 p-3.5 border border-[#29483B]/10 flex items-center gap-2.5 text-xs text-[#29483B]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#B87352]" />
                <p className="leading-tight font-normal">
                  <span className="font-semibold">Interactive Showcase:</span> Validation executes client-side for demonstration purposes. No private communications are dispatched.
                </p>
              </div>

              {isSubmitted ? (
                /* Honest Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="py-10 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xs bg-[#29483B] text-[#F7F5EF] mb-5 shadow-xs">
                    <CheckCircle2 className="h-7 w-7 text-[#B87352]" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87352] block mb-2">
                    DEMO VALIDATION COMPLETE
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#252925] mb-3">
                    Inquiry Verified Successfully
                  </h3>

                  <p className="text-sm text-[#252925]/80 max-w-md mx-auto leading-relaxed mb-3 font-normal">
                    Thank you, <strong className="text-[#252925]">{formData.fullName}</strong>. Your test inquiry for <strong className="text-[#29483B]">{formData.service}</strong> has been structured and validated against corporate requirements.
                  </p>

                  <p className="text-xs text-[#77796F] max-w-sm mx-auto mb-8 leading-relaxed font-normal">
                    This is a fictional advisory firm demonstration designed by Axivon Technologies.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-xs border border-[#29483B]/25 bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#252925] hover:bg-[#F7F5EF] transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-[#B87352]" />
                      <span>Reset Form</span>
                    </button>

                    <Link
                      href="/contact?project=CorporatePro#contact-form"
                      className="inline-flex items-center gap-2 rounded-xs bg-[#29483B] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] hover:bg-[#1e352b] transition-colors shadow-xs"
                    >
                      <span>Engage Axivon Team</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#B87352]" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Form Fields */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#252925] mb-2"
                      >
                        Executive Name <span className="text-[#B87352]">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                        }}
                        placeholder="e.g. Eleanor Vance"
                        className={`w-full rounded-xs border px-4 py-3 text-sm text-[#252925] bg-[#F7F5EF]/40 placeholder-[#77796F]/60 transition-all focus:bg-white focus:outline-none focus:border-[#B87352] focus:ring-1 focus:ring-[#B87352] ${
                          errors.fullName ? "border-[#B87352] bg-red-50/20" : "border-[#29483B]/20"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 text-xs text-[#B87352] font-medium">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#252925] mb-2"
                      >
                        Corporate Email <span className="text-[#B87352]">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        placeholder="e.g. eleanor@company.com"
                        className={`w-full rounded-xs border px-4 py-3 text-sm text-[#252925] bg-[#F7F5EF]/40 placeholder-[#77796F]/60 transition-all focus:bg-white focus:outline-none focus:border-[#B87352] focus:ring-1 focus:ring-[#B87352] ${
                          errors.email ? "border-[#B87352] bg-red-50/20" : "border-[#29483B]/20"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-[#B87352] font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Company */}
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#252925] mb-2"
                      >
                        Enterprise / Organization <span className="text-[10px] text-[#77796F] lowercase font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Apex Industrial Group"
                        className="w-full rounded-xs border border-[#29483B]/20 px-4 py-3 text-sm text-[#252925] bg-[#F7F5EF]/40 placeholder-[#77796F]/60 transition-all focus:bg-white focus:outline-none focus:border-[#B87352] focus:ring-1 focus:ring-[#B87352]"
                      />
                    </div>

                    {/* Service Selection */}
                    <div>
                      <label
                        htmlFor="service"
                        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#252925] mb-2"
                      >
                        Primary Advisory Vector
                      </label>
                      <select
                        id="service"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full rounded-xs border border-[#29483B]/20 px-4 py-3 text-sm text-[#252925] bg-[#F7F5EF]/40 transition-all focus:bg-white focus:outline-none focus:border-[#B87352] focus:ring-1 focus:ring-[#B87352]"
                      >
                        <option value="Strategy & Growth">Strategy & Growth Architecture</option>
                        <option value="Operational Excellence">Operational Excellence & RACI</option>
                        <option value="Digital Transformation">Digital Transformation Governance</option>
                        <option value="Diagnostic Assessment">Focused 4-Week Diagnostic Assessment</option>
                        <option value="General Corporate Advisory">General Corporate Advisory Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Mandate Horizon / Urgency Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#252925] mb-2">
                      Anticipated Mandate Horizon
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["Immediate (Next 30 Days)", "Next 30–60 Days", "Exploratory / H2"].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, timeframe: time })}
                          className={`rounded-xs px-3 py-2 text-xs font-medium text-center transition-all ${
                            formData.timeframe === time
                              ? "bg-[#29483B] text-[#F7F5EF] shadow-xs"
                              : "bg-[#F7F5EF]/50 text-[#252925]/80 border border-[#29483B]/15 hover:bg-[#E2E9E0]"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Context */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#252925] mb-2"
                    >
                      Mandate Overview & Operational Context <span className="text-[#B87352]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      placeholder="Briefly describe the business challenges, transitions, or operational bottlenecks you are looking to address..."
                      className={`w-full rounded-xs border px-4 py-3 text-sm text-[#252925] bg-[#F7F5EF]/40 placeholder-[#77796F]/60 transition-all focus:bg-white focus:outline-none focus:border-[#B87352] focus:ring-1 focus:ring-[#B87352] ${
                        errors.message ? "border-[#B87352] bg-red-50/20" : "border-[#29483B]/20"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-[#B87352] font-medium">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xs bg-[#29483B] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F5EF] shadow-sm transition-all hover:bg-[#1e352b] hover:shadow-md disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-[#B87352]" />
                          <span>Validating Client Mandate...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Advisory Inquiry</span>
                          <Send className="h-3.5 w-3.5 text-[#B87352] transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
