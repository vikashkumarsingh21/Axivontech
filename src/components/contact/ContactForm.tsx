"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Mail, MessageCircle, MapPin } from "lucide-react";

interface FormData {
  service: string;
  timeline: string;
  budget: string;
  message: string;
  company: string;
  fullName: string;
  email: string;
  phone: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const INITIAL_FORM_DATA: FormData = {
  service: "",
  timeline: "",
  budget: "",
  message: "",
  company: "",
  fullName: "",
  email: "",
  phone: "",
};

const SERVICE_OPTIONS = [
  "Website Development", "Mobile App Development", "AI & ML", 
  "Business Automation", "Custom Software", "IoT & Robotics"
];

const TIMELINE_OPTIONS = ["ASAP", "1-2 Months", "3-6 Months", "Flexible"];
const BUDGET_OPTIONS = ["Under ₹25k", "₹25k - ₹50k", "₹50k - ₹1.5L", "₹1.5L+"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s-]{7,15}$/;

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName || !formData.email || !formData.phone) {
      setErrorMsg("Please fill in your personal contact details.");
      return;
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!PHONE_REGEX.test(formData.phone)) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }
    if (!formData.service || !formData.message) {
      setErrorMsg("Please provide a service category and project description.");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: `Project: ${formData.service}\nTimeline: ${formData.timeline || "Not specified"}\nBudget: ${formData.budget || "Not specified"}\nDetails: ${formData.message}`,
        }),
      });

      if (!response.ok) throw new Error("Submission Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact-form" className="bg-[#0f0f0f] py-20 sm:py-14 sm:py-20 lg:py-32 border-b border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Left Column: Contextual Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5] mb-6">
                Tell us what you're building.
              </h2>
              <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-md">
                Whether you have a clear technical specification or just a rough idea, we're here to help you navigate the technology landscape and build a solution that fits.
              </p>
              
              <div className="mt-12 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <Mail className="h-4 w-4 text-[#e8a064]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#f4f4f5]">Email Us</h3>
                    <a href="mailto:info@axivontech.in" className="mt-1 text-sm text-[#a1a1aa] hover:text-[#e8a064] transition-colors">info@axivontech.in</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <MessageCircle className="h-4 w-4 text-[#e8a064]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#f4f4f5]">WhatsApp</h3>
                    <a href="https://wa.me/919473263768" target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-[#a1a1aa] hover:text-[#e8a064] transition-colors">+91 94732 63768</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <MapPin className="h-4 w-4 text-[#e8a064]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#f4f4f5]">Location</h3>
                    <p className="mt-1 text-sm text-[#a1a1aa]">Muzaffarpur, Bihar, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Main Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 sm:p-10 shadow-xl">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-16"
                  >
                    <CheckCircle2 className="h-16 w-16 text-[#e8a064] mb-6" />
                    <h3 className="text-2xl font-bold text-[#f4f4f5] mb-3">Inquiry Received</h3>
                    <p className="text-[#a1a1aa] max-w-md mx-auto mb-8 leading-relaxed">
                      Thank you for reaching out. Our engineering team will review your requirements and reply within 24 hours to schedule a deep dive.
                    </p>
                    <button
                      onClick={() => {
                        setFormData(INITIAL_FORM_DATA);
                        setStatus("idle");
                      }}
                      className="text-sm font-medium text-[#e8a064] hover:text-[#f0b07a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] rounded-sm"
                    >
                      Start another request
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-10"
                    noValidate
                  >
                    {/* 1. Personal Details */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#e8a064] mb-6">Personal Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <label htmlFor="fullName" className="block text-sm font-medium text-[#d4d4d4] mb-2">Full Name</label>
                          <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-[#d4d4d4] mb-2">Work Email</label>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                            placeholder="john@company.com"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-[#d4d4d4] mb-2">Phone Number</label>
                          <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Project Details */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#e8a064] mb-6">Project Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <label htmlFor="company" className="block text-sm font-medium text-[#d4d4d4] mb-2">Company / Organization (Optional)</label>
                          <input
                            id="company"
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                            placeholder="Acme Corp"
                          />
                        </div>
                        <div>
                          <label htmlFor="service" className="block text-sm font-medium text-[#d4d4d4] mb-2">Primary Service</label>
                          <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors appearance-none"
                          >
                            <option value="" disabled>Select a service...</option>
                            {SERVICE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="timeline" className="block text-sm font-medium text-[#d4d4d4] mb-2">Timeline</label>
                          <select
                            id="timeline"
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors appearance-none"
                          >
                            <option value="" disabled>Select timeline...</option>
                            {TIMELINE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="budget" className="block text-sm font-medium text-[#d4d4d4] mb-2">Project Budget (Optional)</label>
                          <select
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3.5 text-[#f4f4f5] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors appearance-none"
                          >
                            <option value="" disabled>Select budget range...</option>
                            {BUDGET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 3. Requirement */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#e8a064] mb-6">Requirement</h3>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-[#d4d4d4] mb-2">Project Description</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 text-[#f4f4f5] text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors resize-none"
                          placeholder="Tell us about the problem you are trying to solve or the product you want to build..."
                        />
                      </div>
                    </div>

                    {/* Error Display */}
                    {errorMsg && (
                      <div className="flex items-start gap-2 bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#f87171] p-3.5 rounded-lg">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{errorMsg}</p>
                      </div>
                    )}
                    {status === "error" && (
                      <div className="flex items-start gap-2 bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#f87171] p-3.5 rounded-lg">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">Something went wrong submitting your request. Please try again or email us directly.</p>
                      </div>
                    )}

                    {/* Submit Area */}
                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-[#1e1e1e]">
                      <p className="text-xs text-[#a1a1aa] max-w-xs">
                        No spam. Just a genuine conversation about your requirement. Typically takes less than 2 minutes.
                      </p>
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="inline-flex items-center justify-center gap-2 bg-[#e8a064] text-[#0f0f0f] px-8 py-3.5 rounded-full font-semibold hover:bg-[#d4915c] transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] min-w-[160px]"
                      >
                        {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Inquiry"}
                      </button>
                    </div>

                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
