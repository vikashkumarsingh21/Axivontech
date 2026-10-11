"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  enquiryType: string;
  message: string;
}

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  enquiryType: "",
  message: "",
};

const ENQUIRY_TYPES = [
  "General Enquiry",
  "Department Information",
  "Appointment Assistance",
  "Patient Services",
  "Feedback & Suggestions",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MediCareContact() {
  const [formData, setFormData] = useState<ContactForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ContactForm, string>> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Please enter your name (minimum 2 characters).";
    }

    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = "Please provide a valid email address.";
    }

    if (!formData.enquiryType) {
      errs.enquiryType = "Please select an enquiry type.";
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Please provide a message (minimum 10 characters).";
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
      id="contact"
      aria-label="Contact MediCare Health Centre"
      className="bg-[#EAF6F2]/30 py-16 sm:py-24 border-t border-[#C9DED6]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <Mail className="h-3.5 w-3.5" />
              <span>Get in Touch</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
              Contact MediCare
            </h2>
            <p className="mt-3 text-base text-[#263746]/80 sm:text-lg">
              Have a question about our demonstration services or need more information? Use the contact form to send a sample enquiry.
            </p>

            {/* Demo Notice */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#C9DED6] bg-white p-4 text-xs text-[#263746]/85">
              <Info className="h-5 w-5 shrink-0 text-[#147D78] mt-0.5" />
              <div>
                <span className="font-bold text-[#147D78]">Demonstration Only: </span>
                This contact form is a frontend showcase. No messages are transmitted, stored, or delivered to any email address. Do not submit sensitive personal or medical information.
              </div>
            </div>

            {/* Axivon CTA */}
            <div className="mt-8 rounded-xl border border-[#C9DED6] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#263746]">
                Want a Healthcare Website Like This?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#263746]/75">
                Axivon Technologies designs and develops premium medical websites with accessible navigation, clean visual identities, and patient-first information architecture.
              </p>
              <Link
                href="/contact?project=MediCare#contact-form"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#147D78] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0f605c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Contact Axivon Technologies</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#C9DED6] bg-white p-6 sm:p-8 shadow-sm">
              {submitted ? (
                /* Honest Completion State */
                <div className="py-8 text-center animate-in fade-in duration-300">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6F2] text-[#147D78] border border-[#C9DED6]">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#263746]">
                    Demo Interaction Completed
                  </h3>
                  <p className="mt-2 max-w-sm mx-auto text-sm text-[#263746]/80">
                    No message has been sent and no data has been stored. This demonstrates the contact form user experience.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9DED6] bg-white px-4 py-2 text-xs font-semibold text-[#263746] hover:bg-gray-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Test Again</span>
                    </button>
                    <Link
                      href="/contact?project=MediCare#contact-form"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#147D78] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0f605c]"
                    >
                      <span>Contact Axivon (Real)</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[#263746]">
                      Your Name <span className="text-[#E58A70]">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      placeholder="e.g. Priya Desai"
                      className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.name ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-[#263746]">
                      Email Address <span className="text-[#E58A70]">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="e.g. priya@example.com"
                      className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.email ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Enquiry Type */}
                  <div>
                    <label htmlFor="contact-enquiry" className="block text-xs font-bold uppercase tracking-wider text-[#263746]">
                      Enquiry Type <span className="text-[#E58A70]">*</span>
                    </label>
                    <select
                      id="contact-enquiry"
                      value={formData.enquiryType}
                      onChange={(e) => {
                        setFormData({ ...formData, enquiryType: e.target.value });
                        if (errors.enquiryType) setErrors({ ...errors, enquiryType: undefined });
                      }}
                      className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.enquiryType ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                      }`}
                    >
                      <option value="">Select Enquiry Type...</option>
                      {ENQUIRY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.enquiryType && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.enquiryType}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[#263746]">
                      Message <span className="text-[#E58A70]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      placeholder="How can we help you today?"
                      className={`mt-2 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#263746] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#147D78] ${
                        errors.message ? "border-red-400 bg-red-50/30" : "border-[#C9DED6] bg-white"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#147D78] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0f605c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] active:scale-[0.99]"
                  >
                    Send Demonstration Enquiry
                  </button>
                  <p className="text-center text-[11px] text-[#263746]/60">
                    Frontend validation only · No server transmission
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
