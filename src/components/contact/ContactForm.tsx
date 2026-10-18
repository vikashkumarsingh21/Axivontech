"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageCircle,
  Globe2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  Building2,
  Clock,
  Layers,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { trackLeadSubmission, trackWhatsAppClick } from "@/lib/analytics";

interface FormData {
  service: string;
  industry: string;
  timeline: string;
  budget: string;
  message: string;
  company: string;
  website: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContact: string;
  demoProject: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const INITIAL_FORM_DATA: FormData = {
  service: "",
  industry: "",
  timeline: "",
  budget: "",
  message: "",
  company: "",
  website: "",
  fullName: "",
  email: "",
  phone: "",
  preferredContact: "Email",
  demoProject: "",
};

const SERVICE_OPTIONS = [
  "Web Development",
  "Mobile App Development",
  "AI Solutions",
  "Cloud Solutions",
  "SEO Services",
  "Digital Marketing",
  "UI/UX Design",
  "Custom Software Development",
  "Workflow Automation",
  "Robotics & IoT",
];

const SERVICE_SLUG_MAP: Record<string, string> = {
  "web-development": "Web Development",
  "mobile-app-development": "Mobile App Development",
  "ai-solutions": "AI Solutions",
  "cloud-solutions": "Cloud Solutions",
  "seo-services": "SEO Services",
  "digital-marketing": "Digital Marketing",
  "ui-ux-design": "UI/UX Design",
  "custom-software-development": "Custom Software Development",
  "automation": "Workflow Automation",
  "robotics-iot": "Robotics & IoT",
};

const INDUSTRY_OPTIONS = [
  "Healthcare & Medical",
  "Real Estate & PropTech",
  "E-Commerce & Retail",
  "Education & EdTech",
  "Fitness & Athletics",
  "Hospitality & Dining",
  "Corporate & Consulting",
  "SaaS & Software",
  "Manufacturing & Logistics",
  "Agriculture & IoT",
  "Other Industry",
];

const TIMELINE_OPTIONS = ["Immediate (ASAP)", "1-2 Months", "3-6 Months", "Flexible / Exploratory"];
const BUDGET_OPTIONS = ["Under ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,50,000", "₹1,50,000 - ₹5,00,000", "₹5,00,000+"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s-]{7,15}$/;

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [assignedLeadCode, setAssignedLeadCode] = useState<string | null>(null);
  const [contextSource, setContextSource] = useState<{ label: string; type: "demo" | "service" | "industry" } | null>(null);

  useEffect(() => {
    const demoParam = searchParams.get("demo") || searchParams.get("project");
    const serviceParam = searchParams.get("service");
    const industryParam = searchParams.get("industry");

    let mappedService = "";
    if (serviceParam) {
      mappedService = SERVICE_SLUG_MAP[serviceParam.toLowerCase()] || serviceParam;
    }

    if (demoParam) {
      setContextSource({ label: `Demo: ${demoParam}`, type: "demo" });
      setFormData((prev) => ({
        ...prev,
        demoProject: demoParam,
        service: prev.service || mappedService || "Web Development",
        industry: prev.industry || industryParam || "",
        message: prev.message || `We are interested in building a solution similar to your ${demoParam} demo project.`,
      }));
    } else if (serviceParam) {
      setContextSource({ label: `Service: ${mappedService}`, type: "service" });
      setFormData((prev) => ({
        ...prev,
        service: mappedService,
        industry: prev.industry || industryParam || "",
      }));
    } else if (industryParam) {
      setContextSource({ label: `Industry: ${industryParam}`, type: "industry" });
      setFormData((prev) => ({
        ...prev,
        industry: industryParam,
      }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg("");
  };

  const handleClearContext = () => {
    setContextSource(null);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
  };

  const validateStep1 = (): boolean => {
    if (!formData.service) {
      setErrorMsg("Please select a primary service.");
      return false;
    }
    if (!formData.message || formData.message.trim().length < 10) {
      setErrorMsg("Please provide a brief description of your project (minimum 10 characters).");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.fullName || formData.fullName.trim().length === 0) {
      setErrorMsg("Please enter your full name.");
      return false;
    }
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (!formData.phone || !PHONE_REGEX.test(formData.phone.trim())) {
      setErrorMsg("Please enter a valid phone number (7 to 15 digits).");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const goToStep = (step: 1 | 2 | 3) => {
    if (step === 2 && !validateStep1()) return;
    if (step === 3 && (!validateStep1() || !validateStep2())) return;
    setErrorMsg("");
    setCurrentStep(step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setStatus("loading");
    try {
      const payload = {
        name: formData.fullName.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        companyName: formData.company.trim() || undefined,
        website: formData.website.trim() || undefined,
        service: formData.service,
        serviceInterest: formData.service,
        industry: formData.industry || undefined,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
        message: formData.message.trim(),
        demoProject: formData.demoProject || undefined,
        source: formData.demoProject ? "DEMO_SHOWCASE" : (contextSource?.type === "service" ? "SERVICE_PAGE" : "WEBSITE_CONTACT"),
        sourcePage: typeof window !== "undefined" ? window.location.pathname + window.location.search : "/contact",
        landingPage: typeof window !== "undefined" ? window.location.href : "/contact",
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
        utm_source: searchParams.get("utm_source") || undefined,
        utm_medium: searchParams.get("utm_medium") || undefined,
        utm_campaign: searchParams.get("utm_campaign") || undefined,
        referralCode: searchParams.get("ref") || searchParams.get("referralCode") || undefined,
      };

      const response = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Submission failed. Please check your inputs.");
      }

      setAssignedLeadCode(responseData.leadCode || null);
      setStatus("success");

      // Track confirmed conversion event without PII
      trackLeadSubmission({
        leadCode: responseData.leadCode,
        service: formData.service,
        timeline: formData.timeline,
        budget: formData.budget,
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong submitting your request. Please try again or email us directly.");
    }
  };

  return (
    <section id="contact-form" className="bg-[#0f0f0f] py-16 sm:py-20 lg:py-28 border-b border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Contextual Guidance */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8a064]/20 bg-[#e8a064]/10 px-3.5 py-1 text-xs font-mono font-semibold tracking-wider text-[#e8a064] mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Client Inquiries &amp; Project Estimates</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F5F7] mb-6 text-balance">
                Let&apos;s build a solution tailored to your goals.
              </h2>
              <p className="text-[#A7B0BC] text-base sm:text-lg leading-relaxed max-w-md font-light text-pretty">
                Whether you have a full functional specification, want to build on one of our live demo architectures, or just have an idea, we&apos;re here to engineer a system that delivers measurable results.
              </p>
              
              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <Mail className="h-4 w-4 text-[#e8a064]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-[#F3F5F7]">Direct Inquiries</h3>
                    <a href="mailto:contact@axivontech.in" className="mt-0.5 text-sm text-[#A7B0BC] hover:text-[#e8a064] transition-colors block">
                      contact@axivontech.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <MessageCircle className="h-4 w-4 text-[#e8a064]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-[#F3F5F7]">WhatsApp Consultation</h3>
                    <a
                      href="https://wa.me/919157226367"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick("contact_form")}
                      className="mt-0.5 text-sm text-[#A7B0BC] hover:text-[#e8a064] transition-colors block"
                    >
                      +91 91572 26367
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <Globe2 className="h-4 w-4 text-[#e8a064]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-[#F3F5F7]">Delivery Model</h3>
                    <p className="mt-0.5 text-sm text-[#A7B0BC]">Remote-first engineering collaborating with clients across India &amp; globally</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Re-route Hint */}
            <div className="mt-12 p-4 rounded-xl border border-white/5 bg-[#141414]/60 text-xs text-[#7E8997]">
              <span className="font-semibold text-[#A7B0BC] block mb-1">Looking for Inspiration?</span>
              Explore our{" "}
              <Link href="/demo-projects" className="text-[#e8a064] hover:underline font-medium">
                interactive live demo portfolio
              </Link>{" "}
              featuring healthcare, real estate, e-commerce, athletic, and SaaS architectures.
            </div>
          </div>

          {/* Right Column: Multi-Step Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6 sm:p-10 shadow-2xl">
              
              {/* Context Preselection Banner */}
              {contextSource && status !== "success" && (
                <div className="mb-8 flex items-center justify-between rounded-xl border border-[#e8a064]/30 bg-[#e8a064]/10 p-4 text-xs text-[#e8a064]">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 text-[#e8a064]" />
                    <span>
                      Inquiry preselected for: <strong>{contextSource.label}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearContext}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#e8a064] hover:underline"
                    title="Reset pre-filled context"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              )}

              {/* Step Navigation Pill Indicator */}
              {status !== "success" && (
                <div className="mb-8 border-b border-[#222] pb-5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    {[
                      { step: 1, label: "1. Project Scope" },
                      { step: 2, label: "2. Contact Info" },
                      { step: 3, label: "3. Review & Submit" },
                    ].map((s) => (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => goToStep(s.step as 1 | 2 | 3)}
                        className={`transition-colors pb-1 border-b-2 -mb-[21px] ${
                          currentStep === s.step
                            ? "border-[#e8a064] text-[#e8a064]"
                            : currentStep > s.step
                            ? "border-emerald-500/50 text-emerald-400"
                            : "border-transparent text-gray-500 hover:text-gray-400"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-[#F3F5F7] mb-2">
                      Inquiry Successfully Received
                    </h3>

                    {assignedLeadCode && (
                      <div className="my-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-[#e8a064]">
                        <span>Reference ID:</span>
                        <strong className="tracking-wider">{assignedLeadCode}</strong>
                      </div>
                    )}

                    <p className="text-[#A7B0BC] max-w-md mx-auto mb-8 leading-relaxed font-light text-sm">
                      Thank you for contacting Axivon Technologies. Our engineering leads will review your requirements and reach out within 24 hours to discuss the next steps.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setFormData(INITIAL_FORM_DATA);
                          setStatus("idle");
                          setCurrentStep(1);
                          setAssignedLeadCode(null);
                        }}
                        className="text-xs font-semibold px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-[#F3F5F7] hover:bg-white/10 transition-colors"
                      >
                        Submit another inquiry
                      </button>

                      <Link
                        href="/demo-projects"
                        className="text-xs font-semibold px-5 py-2.5 rounded-full bg-[#e8a064] text-[#0f0f0f] hover:bg-[#d4915c] transition-colors"
                      >
                        Browse Interactive Demos
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    noValidate
                  >
                    {/* STEP 1: Project Scope */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#e8a064] mb-4">
                            Step 1 &middot; Project Scope &amp; Requirements
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Service Selection */}
                            <div>
                              <label htmlFor="service" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Required Service <span className="text-[#e8a064]">*</span>
                              </label>
                              <select
                                id="service"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                              >
                                <option value="" disabled>Select primary service...</option>
                                {SERVICE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            {/* Industry Selection */}
                            <div>
                              <label htmlFor="industry" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Industry Sector (Optional)
                              </label>
                              <select
                                id="industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                              >
                                <option value="">Select industry sector...</option>
                                {INDUSTRY_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            {/* Timeline */}
                            <div>
                              <label htmlFor="timeline" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Target Timeline (Optional)
                              </label>
                              <select
                                id="timeline"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                              >
                                <option value="">Select target timeline...</option>
                                {TIMELINE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            {/* Budget Range */}
                            <div>
                              <label htmlFor="budget" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Estimated Budget (Optional)
                              </label>
                              <select
                                id="budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                              >
                                <option value="">Select budget range...</option>
                                {BUDGET_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            {/* Project Description */}
                            <div className="sm:col-span-2">
                              <label htmlFor="message" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Project Brief &amp; Requirements <span className="text-[#e8a064]">*</span>
                              </label>
                              <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3.5 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors resize-none"
                                placeholder="Describe what you want to build, key features, business objectives, or reference links..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Step 1 CTA */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="inline-flex items-center gap-2 bg-[#e8a064] text-[#0f0f0f] px-6 py-3 rounded-full text-xs font-semibold hover:bg-[#d4915c] transition-colors"
                          >
                            <span>Next: Contact Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Contact Information */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#e8a064] mb-4">
                            Step 2 &middot; Your Contact Information
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="sm:col-span-2">
                              <label htmlFor="fullName" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Full Name <span className="text-[#e8a064]">*</span>
                              </label>
                              <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                                placeholder="e.g. John Doe"
                              />
                            </div>

                            {/* Work Email */}
                            <div>
                              <label htmlFor="email" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Business / Work Email <span className="text-[#e8a064]">*</span>
                              </label>
                              <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                                placeholder="name@company.com"
                              />
                            </div>

                            {/* Phone */}
                            <div>
                              <label htmlFor="phone" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Phone Number <span className="text-[#e8a064]">*</span>
                              </label>
                              <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                                placeholder="+91 98765 43210"
                              />
                            </div>

                            {/* Company Name */}
                            <div>
                              <label htmlFor="company" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Company / Organization (Optional)
                              </label>
                              <input
                                id="company"
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                                placeholder="Acme Enterprises"
                              />
                            </div>

                            {/* Website */}
                            <div>
                              <label htmlFor="website" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Current Website (Optional)
                              </label>
                              <input
                                id="website"
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064] transition-colors"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Step 2 Controls */}
                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Scope</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => goToStep(3)}
                            className="inline-flex items-center gap-2 bg-[#e8a064] text-[#0f0f0f] px-6 py-3 rounded-full text-xs font-semibold hover:bg-[#d4915c] transition-colors"
                          >
                            <span>Review Inquiry</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Review & Submit */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#e8a064] mb-4">
                            Step 3 &middot; Review Your Requirements
                          </h3>

                          {/* Summary Card */}
                          <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
                              <div>
                                <span className="text-gray-500 block">Service</span>
                                <span className="font-semibold text-white">{formData.service}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Industry</span>
                                <span className="text-gray-300">{formData.industry || "Not specified"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Budget Range</span>
                                <span className="text-gray-300">{formData.budget || "Flexible"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Timeline</span>
                                <span className="text-gray-300">{formData.timeline || "Flexible"}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/5">
                              <div>
                                <span className="text-gray-500 block">Contact Name</span>
                                <span className="text-white font-medium">{formData.fullName}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Work Email</span>
                                <span className="text-white">{formData.email}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Phone</span>
                                <span className="text-white">{formData.phone}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">Company / Website</span>
                                <span className="text-gray-300">
                                  {formData.company || "Independent"}
                                  {formData.website ? ` (${formData.website})` : ""}
                                </span>
                              </div>
                            </div>

                            {formData.demoProject && (
                              <div className="p-2.5 rounded-lg bg-[#e8a064]/10 border border-[#e8a064]/20 text-[11px] text-[#e8a064]">
                                Context: Inquiring based on demo architecture: <strong>{formData.demoProject}</strong>
                              </div>
                            )}

                            <div>
                              <span className="text-gray-500 block mb-1">Project Brief</span>
                              <p className="text-gray-300 italic whitespace-pre-wrap leading-relaxed">
                                &ldquo;{formData.message}&rdquo;
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Step 3 Controls */}
                        <div className="pt-2 flex items-center justify-between border-t border-[#1e1e1e]">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Modify Details</span>
                          </button>

                          <button
                            type="submit"
                            disabled={status === "loading"}
                            className="inline-flex items-center justify-center gap-2 bg-[#e8a064] text-[#0f0f0f] px-8 py-3.5 rounded-full text-xs font-bold hover:bg-[#d4915c] transition-colors disabled:opacity-60"
                          >
                            {status === "loading" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Securing Inquiry...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Send Project Inquiry</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Error Display */}
                    {(errorMsg || status === "error") && (
                      <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          {errorMsg || "An error occurred submitting your request. Please try again."}
                        </p>
                      </div>
                    )}
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
