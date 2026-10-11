"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Send, ShieldCheck } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  company: string;
  service: string;
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
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "Please provide your full name.";
    }

    if (!formData.email.trim()) {
      errs.email = "Please provide your work email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      errs.message = "Please describe your business inquiry.";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Please provide at least 10 characters describing your inquiry.";
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
    }, 700);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      company: "",
      service: "Strategy & Growth",
      message: "",
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact"
      aria-label="Contact & Inquiries"
      className="relative bg-[#F7F5EF] py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Context & Axivon CTA */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-6 bg-[#B87352]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87352]">
                  START A CONVERSATION
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#252925] leading-tight mb-6">
                Let&apos;s talk about what&apos;s next.
              </h2>

              <p className="text-base text-[#252925]/80 leading-relaxed mb-8">
                Share a little about your business and the challenge you&apos;re looking to solve. We review every prospective advisory mandate with rigorous confidentiality.
              </p>

              {/* Advisory Details */}
              <div className="space-y-4 pt-6 border-t border-[#29483B]/10 text-xs sm:text-sm text-[#252925]/80">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#29483B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#252925] font-semibold">Strict Confidentiality</strong>
                    <span>All introductory discussions are protected by reciprocal mutual discretion.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#29483B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#252925] font-semibold">Prompt Partner Review</strong>
                    <span>An experienced partner responds within one business day with objective feedback.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Axivon Banner */}
            <div className="mt-12 rounded-sm border border-[#29483B]/20 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[#e8a064]">
                <Sparkles className="h-4 w-4 text-[#B87352]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B87352]">
                  Axivon Technologies Portfolio Demo
                </span>
              </div>
              <p className="text-xs text-[#252925]/80 leading-relaxed mb-4">
                Looking to build a sophisticated corporate website like <span className="font-semibold text-[#29483B]">CorporatePro</span> for your own consulting or enterprise firm?
              </p>
              <Link
                href="/contact?project=CorporatePro#contact-form"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#29483B] hover:text-[#1f372d] uppercase tracking-wider"
              >
                <span>Request this website blueprint with Axivon</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Form & Demo Validation */}
          <div className="lg:col-span-7">
            <div className="rounded-sm border border-[#29483B]/15 bg-white p-8 sm:p-10 shadow-sm relative">
              {/* Frontend Demo Banner */}
              <div className="mb-6 rounded-sm bg-[#E2E9E0]/50 p-3.5 border border-[#29483B]/10 flex items-center gap-2.5 text-xs text-[#29483B]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#B87352]" />
                <p className="leading-tight">
                  <span className="font-semibold">Interactive Frontend Demonstration:</span> Form submission operates purely client-side. No private data is transmitted.
                </p>
              </div>

              {isSubmitted ? (
                /* Honest Success State */
                <div className="py-8 text-center animate-in fade-in duration-300">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E2E9E0] text-[#29483B] mb-5">
                    <CheckCircle2 className="h-8 w-8 text-[#29483B]" />
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-[#252925] mb-3">
                    Demo Interaction Completed
                  </h3>

                  <p className="text-sm text-[#252925]/80 max-w-md mx-auto leading-relaxed mb-4">
                    Thank you, <strong className="text-[#252925]">{formData.fullName}</strong>. Your test inquiry for <strong className="text-[#29483B]">{formData.service}</strong> was validated successfully.
                  </p>

                  <p className="text-xs text-[#77796F] max-w-sm mx-auto mb-8 leading-relaxed">
                    As this is a fictional corporate website demonstration, no actual email has been dispatched or stored.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-sm border border-[#29483B]/20 bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#252925] hover:bg-[#F7F5EF] transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset Form</span>
                    </button>

                    <Link
                      href="/contact?project=CorporatePro#contact-form"
                      className="inline-flex items-center gap-2 rounded-sm bg-[#29483B] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F5EF] hover:bg-[#1f372d] transition-colors shadow-sm"
                    >
                      <span>Inquire with Axivon Team</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form Fields */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#252925] mb-2">
                        Full Name <span className="text-[#B87352]">*</span>
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
                        className={`w-full rounded-sm border px-3.5 py-2.5 text-sm text-[#252925] bg-[#F7F5EF]/30 placeholder-[#77796F]/60 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#29483B] ${
                          errors.fullName ? "border-[#B87352]" : "border-[#29483B]/20"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-[#B87352]">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#252925] mb-2">
                        Work Email <span className="text-[#B87352]">*</span>
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
                        className={`w-full rounded-sm border px-3.5 py-2.5 text-sm text-[#252925] bg-[#F7F5EF]/30 placeholder-[#77796F]/60 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#29483B] ${
                          errors.email ? "border-[#B87352]" : "border-[#29483B]/20"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-[#B87352]">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Company */}
                    <div>
                      <label htmlFor="company" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#252925] mb-2">
                        Company Name <span className="text-xs text-[#77796F] lowercase font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Apex Industrial Group"
                        className="w-full rounded-sm border border-[#29483B]/20 px-3.5 py-2.5 text-sm text-[#252925] bg-[#F7F5EF]/30 placeholder-[#77796F]/60 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#29483B]"
                      />
                    </div>

                    {/* Service Selection */}
                    <div>
                      <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#252925] mb-2">
                        Area of Interest
                      </label>
                      <select
                        id="service"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full rounded-sm border border-[#29483B]/20 px-3.5 py-2.5 text-sm text-[#252925] bg-[#F7F5EF]/30 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#29483B]"
                      >
                        <option value="Strategy & Growth">Strategy & Growth</option>
                        <option value="Operational Excellence">Operational Excellence</option>
                        <option value="Digital Transformation">Digital Transformation</option>
                        <option value="Diagnostic Assessment">Focused Diagnostic Assessment</option>
                        <option value="General Advisory Inquiry">General Advisory Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#252925] mb-2">
                      Inquiry & Context <span className="text-[#B87352]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      placeholder="Briefly describe the business challenges, transitions, or strategic questions you would like to explore..."
                      className={`w-full rounded-sm border px-3.5 py-2.5 text-sm text-[#252925] bg-[#F7F5EF]/30 placeholder-[#77796F]/60 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#29483B] ${
                        errors.message ? "border-[#B87352]" : "border-[#29483B]/20"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-[#B87352]">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#29483B] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] shadow-sm transition-all hover:bg-[#1f372d] hover:shadow-md disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Advisory Inquiry</span>
                          <Send className="h-3.5 w-3.5" />
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
