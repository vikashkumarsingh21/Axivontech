"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Mail, Phone, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

export default function EduSmartContact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please complete all fields before sending.");
      return;
    }
    setError("");
    setSent(true);
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative border-t border-[#E8E1EB] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Campus Information */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
              <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
              <span>Campus & Inquiries</span>
            </div>

            <h2
              id="contact-heading"
              className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
            >
              Connect with Aurevia Academy
            </h2>

            <p className="mt-4 text-base text-[#27232A]/80 leading-relaxed">
              We welcome dialogue with future scholars, institutional collaborators, and
              academic partners. Below are illustrative campus inquiry guidelines for this demonstration.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4 rounded-2xl border border-[#E8E1EB] bg-[#F7F3EB]/60 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#33243B] shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#27232A]">
                    Campus Location (Illustrative)
                  </h3>
                  <p className="mt-1 text-xs text-[#27232A]/70 leading-relaxed">
                    Aurevia Academic Estate, Knowledge Park III, Greater Noida 201310
                    <br />
                    <span className="italic text-[#B89557]">*Fictional demonstration address</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[#E8E1EB] bg-[#F7F3EB]/60 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#33243B] shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#27232A]">
                    Admissions Directorate
                  </h3>
                  <p className="mt-1 text-xs text-[#27232A]/70">
                    Online consultation requests:{" "}
                    <a href="#admissions" className="text-[#33243B] font-semibold underline">
                      Jump to Admissions Form
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Axivon Agency Card */}
            <div className="mt-8 rounded-2xl border border-[#B89557]/40 bg-[#F7F3EB] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#33243B]">
                <Sparkles className="h-4 w-4 text-[#B89557]" />
                <span>Axivon Technologies Showcase</span>
              </div>
              <p className="mt-2 text-sm text-[#27232A]/80">
                Are you looking to build an accessible, beautifully engineered digital portal
                for your university, academy, or EdTech platform?
              </p>
              <div className="mt-4">
                <Link
                  href="/contact?project=EduSmart#contact-form"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#33243B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#483353]"
                >
                  <span>Build an Education Website Like This</span>
                  <ArrowUpRight className="h-4 w-4 text-[#B89557]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: General Academic Inquiries Form */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#E8E1EB] bg-[#F7F3EB]/40 p-6 sm:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#27232A]">
                General Inquiry
              </h3>
              <p className="mt-2 text-xs text-[#27232A]/70">
                Reach out for interdisciplinary questions, symposium invites, or media notes.
              </p>

              {sent ? (
                <div className="mt-6 rounded-2xl bg-white p-6 text-center border border-[#E8E1EB]">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#33243B]" />
                  <h4 className="mt-3 font-serif text-lg font-bold text-[#27232A]">
                    Demo Message Recorded
                  </h4>
                  <p className="mt-2 text-xs text-[#27232A]/70">
                    Thank you. This is an interactive demo; no emails are dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm({ name: "", email: "", message: "" });
                    }}
                    className="mt-4 inline-flex items-center rounded-full bg-[#33243B] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#483353]"
                  >
                    Submit another note
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
                    <label htmlFor="inquiryName" className="block text-xs font-bold uppercase text-[#27232A]">
                      Full Name
                    </label>
                    <input
                      id="inquiryName"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Vikramaditya Joshi"
                      className="mt-1.5 block w-full rounded-xl border border-[#E8E1EB] bg-white px-4 py-2.5 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B]"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryEmail" className="block text-xs font-bold uppercase text-[#27232A]">
                      Email Address
                    </label>
                    <input
                      id="inquiryEmail"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. vikram@example.com"
                      className="mt-1.5 block w-full rounded-xl border border-[#E8E1EB] bg-white px-4 py-2.5 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B]"
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryMsg" className="block text-xs font-bold uppercase text-[#27232A]">
                      Message
                    </label>
                    <textarea
                      id="inquiryMsg"
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Your inquiry or feedback regarding Aurevia Academy..."
                      className="mt-1.5 block w-full rounded-xl border border-[#E8E1EB] bg-white px-4 py-2.5 text-sm text-[#27232A] focus:outline-none focus:ring-2 focus:ring-[#33243B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#33243B] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#483353] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
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
