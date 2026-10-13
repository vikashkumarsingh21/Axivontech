"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Clock, MapPin, Mail, Phone, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

export default function FoodieHubContact() {
  const [formSent, setFormSent] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!enquiry.name || !enquiry.email || !enquiry.message) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setFormSent(true);
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-[#F8F3EA] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Opening hours & Illustrative Location info */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
              <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
              <span>Location & Hours</span>
            </div>

            <h2
              id="contact-heading"
              className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
            >
              Visit Saffron & Stone
            </h2>

            <p className="mt-4 text-base text-[#24221F]/80 leading-relaxed">
              We look forward to welcoming you to our tables. Below are illustrative dining
              hours and location details for this restaurant demonstration.
            </p>

            <div className="mt-8 space-y-6">
              {/* Illustrative Hours */}
              <div className="flex items-start gap-4 rounded-2xl border border-[#E8DFC9] bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F3EA] text-[#B85C38]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#24221F]">
                    Dining Service Hours
                  </h3>
                  <div className="mt-1 space-y-0.5 text-xs text-[#24221F]/70">
                    <p><strong className="text-[#24221F]">Lunch:</strong> Tuesday – Sunday · 12:30 PM – 03:30 PM</p>
                    <p><strong className="text-[#24221F]">Dinner:</strong> Daily · 07:00 PM – 11:30 PM</p>
                    <p className="text-[#68735A] font-medium">*Monday Lunch closed for kitchen stock curation</p>
                  </div>
                </div>
              </div>

              {/* Sample Location Notice */}
              <div className="flex items-start gap-4 rounded-2xl border border-[#E8DFC9] bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F3EA] text-[#B85C38]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#24221F]">
                    Location Architecture
                  </h3>
                  <p className="mt-1 text-xs text-[#24221F]/70 leading-relaxed">
                    Heritage Courtyard Quarter, Metro Arts District, New Delhi 110001
                    <br />
                    <span className="italic text-[#68735A]">(Fictional illustrative demonstration address)</span>
                  </p>
                </div>
              </div>

              {/* Inquiries */}
              <div className="flex items-start gap-4 rounded-2xl border border-[#E8DFC9] bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F3EA] text-[#B85C38]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#24221F]">
                    Dining Inquiries
                  </h3>
                  <p className="mt-1 text-xs text-[#24221F]/70">
                    Direct hospitality table bookings:{" "}
                    <a href="#reservations" className="text-[#B85C38] font-semibold underline">
                      Use Online Reservation Form
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Axivon Agency CTA */}
            <div className="mt-8 rounded-2xl border border-[#C9A86A]/40 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B85C38]">
                <Sparkles className="h-4 w-4" />
                <span>Axivon Technologies Showcase</span>
              </div>
              <p className="mt-2 text-sm text-[#24221F]/80">
                Are you looking to build an editorial, high-converting digital presence for your
                restaurant, boutique hotel, or dining group?
              </p>
              <div className="mt-4">
                <Link
                  href="/contact?project=FoodieHub#contact-form"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#24221F] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#B85C38]"
                >
                  <span>Build a Restaurant Website Like This</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Direct General Enquiry Form */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#E0D4BE] bg-white p-6 sm:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#24221F]">
                General Dining Inquiries
              </h3>
              <p className="mt-2 text-xs text-[#24221F]/70">
                For private dining buyouts, culinary press inquiries, or hospitality notes.
              </p>

              {formSent ? (
                <div className="mt-6 rounded-2xl bg-[#F8F3EA] p-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#68735A]" />
                  <h4 className="mt-3 font-serif text-lg font-bold text-[#24221F]">
                    Demo Message Recorded
                  </h4>
                  <p className="mt-2 text-xs text-[#24221F]/70">
                    Thank you. This is an interactive demo; no emails are dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSent(false);
                      setEnquiry({ name: "", email: "", message: "" });
                    }}
                    className="mt-4 inline-flex items-center rounded-full bg-[#B85C38] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#9E4A28]"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="enquiryName" className="block text-xs font-bold uppercase text-[#24221F]">
                      Your Name
                    </label>
                    <input
                      id="enquiryName"
                      type="text"
                      value={enquiry.name}
                      onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                      placeholder="e.g. Radhika Sen"
                      className="mt-1.5 block w-full rounded-xl border border-[#E8DFC9] bg-[#F8F3EA]/30 px-4 py-2.5 text-sm text-[#24221F] focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiryEmail" className="block text-xs font-bold uppercase text-[#24221F]">
                      Email Address
                    </label>
                    <input
                      id="enquiryEmail"
                      type="email"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      placeholder="e.g. radhika@example.com"
                      className="mt-1.5 block w-full rounded-xl border border-[#E8DFC9] bg-[#F8F3EA]/30 px-4 py-2.5 text-sm text-[#24221F] focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiryMsg" className="block text-xs font-bold uppercase text-[#24221F]">
                      Message
                    </label>
                    <textarea
                      id="enquiryMsg"
                      rows={4}
                      value={enquiry.message}
                      onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                      placeholder="How can we assist your dining plans?"
                      className="mt-1.5 block w-full rounded-xl border border-[#E8DFC9] bg-[#F8F3EA]/30 px-4 py-2.5 text-sm text-[#24221F] focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#B85C38] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#9E4A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
                  >
                    Submit Demo Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
