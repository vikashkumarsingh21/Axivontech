"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
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
  FileText,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { trackLeadSubmission, trackWhatsAppClick } from "@/lib/analytics";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/ui/TurnstileWidget";
import { RequiredPolicyAcknowledgement } from "@/components/legal/RequiredPolicyAcknowledgement";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";
import { CONTACT_CONFIG, getWhatsAppUrl, getPhoneTelLink, getEmailMailtoLink } from "@/config/contact";

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
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    service?: string;
    message?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  }>({});
  const [assignedLeadCode, setAssignedLeadCode] = useState<string | null>(null);
  const [contextSource, setContextSource] = useState<{ label: string; type: "demo" | "service" | "industry" } | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [turnstileStatus, setTurnstileStatus] = useState<"loading" | "ready" | "verified" | "error" | "expired">("loading");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Dual Mandatory Form Protection States
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [recaptchaResetCount, setRecaptchaResetCount] = useState<number>(0);

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

  // Pre-warm Cloudflare Turnstile script early so it is ready by Step 3
  useEffect(() => {
    if (typeof window !== "undefined" && !window.turnstile) {
      const scriptId = "cloudflare-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setErrorMsg("");
  };

  const handleClearContext = () => {
    setContextSource(null);
    setFormData(INITIAL_FORM_DATA);
    setFieldErrors({});
    setCurrentStep(1);
  };

  const validateStep1 = (): boolean => {
    const errors: { service?: string; message?: string } = {};
    if (!formData.service) {
      errors.service = "Please select a required primary service.";
    }
    if (!formData.message || formData.message.trim().length < 10) {
      errors.message = "Please describe your project brief (minimum 10 characters).";
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }));
    if (errors.service || errors.message) {
      setErrorMsg("Please complete the required project scope fields below.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const validateStep2 = (): boolean => {
    const errors: { fullName?: string; email?: string; phone?: string } = {};
    if (!formData.fullName || formData.fullName.trim().length === 0) {
      errors.fullName = "Please enter your full name.";
    }
    if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = "Please enter a valid work or personal email address.";
    }
    if (!formData.phone || !PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }));
    if (errors.fullName || errors.email || errors.phone) {
      setErrorMsg("Please complete the required contact information fields below.");
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

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    // Mandatory Check 1: Policy Acknowledgement
    if (!policyAcknowledged) {
      setCurrentStep(3);
      setPolicyError("Please acknowledge the Privacy Policy before submitting this form.");
      return;
    }

    // Mandatory Check 2: CAPTCHA Verification
    const effectiveToken = recaptchaToken || captchaToken;
    if (!effectiveToken) {
      setCurrentStep(3);
      setRecaptchaError("Please complete the human verification before submitting.");
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
        privacyPolicyAcknowledged: true,
        policyVersion: "1.0.0",
        recaptchaToken: effectiveToken,
        captchaToken: effectiveToken,
      };

      const response = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        turnstileRef.current?.reset();
        setCaptchaToken("");
        setRecaptchaToken("");
        setRecaptchaResetCount((prev) => prev + 1);
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
      turnstileRef.current?.reset();
      setCaptchaToken("");
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
              
              <div className="mt-8 space-y-4">
                {/* Direct Phone / Click to Call */}
                <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4 transition-colors hover:border-[#e8a064]/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a202a] border border-[#2a3340] text-[#e8a064]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#7E8997]">
                        Direct Phone
                      </h3>
                      <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Click to call
                      </span>
                    </div>
                    <a
                      href={getPhoneTelLink()}
                      className="mt-1 text-sm font-semibold text-[#F3F5F7] hover:text-[#e8a064] transition-colors block font-mono"
                    >
                      {CONTACT_CONFIG.phoneDisplay}
                    </a>
                  </div>
                </div>

                {/* Direct WhatsApp Consultation */}
                <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4 transition-colors hover:border-[#25D366]/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a241e] border border-[#25462f] text-[#25D366]">
                    <FaWhatsapp className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#7E8997]">
                        WhatsApp Consultation
                      </h3>
                      <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Fastest response
                      </span>
                    </div>
                    <a
                      href={getWhatsAppUrl("Hi Axivon, I would like to consult on a project.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick("contact_page_block")}
                      className="mt-1 text-sm font-semibold text-[#F3F5F7] hover:text-[#25D366] transition-colors block font-mono"
                    >
                      {CONTACT_CONFIG.phoneDisplay}
                    </a>
                  </div>
                </div>

                {/* Email Inquiries */}
                <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4 transition-colors hover:border-[#e8a064]/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a202a] border border-[#2a3340] text-[#e8a064]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#7E8997]">
                      Email Inquiries
                    </h3>
                    <a
                      href={getEmailMailtoLink()}
                      className="mt-1 text-sm font-semibold text-[#F3F5F7] hover:text-[#e8a064] transition-colors block font-mono"
                    >
                      {CONTACT_CONFIG.email}
                    </a>
                  </div>
                </div>

                {/* Operating Business Hours (rendered ONLY if set in config) */}
                {CONTACT_CONFIG.businessHours && (
                  <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a202a] border border-[#2a3340] text-[#e8a064]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#7E8997]">
                        Business Hours
                      </h3>
                      <p className="mt-1 text-xs text-[#A7B0BC] leading-relaxed">
                        {CONTACT_CONFIG.businessHours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Office City / Address (rendered ONLY if set in config) */}
                {CONTACT_CONFIG.officeAddress && (
                  <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a202a] border border-[#2a3340] text-[#e8a064]">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#7E8997]">
                        Office Address
                      </h3>
                      <p className="mt-1 text-xs text-[#A7B0BC] leading-relaxed">
                        {CONTACT_CONFIG.officeAddress}
                        {CONTACT_CONFIG.officeCity ? `, ${CONTACT_CONFIG.officeCity}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* GST / Udyam Number (rendered ONLY if set in config) */}
                {(CONTACT_CONFIG.gstNumber || CONTACT_CONFIG.udyamNumber) && (
                  <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a202a] border border-[#2a3340] text-[#e8a064]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-xs text-[#A7B0BC] space-y-1">
                      {CONTACT_CONFIG.gstNumber && (
                        <p>GSTIN: <span className="font-mono text-[#F3F5F7]">{CONTACT_CONFIG.gstNumber}</span></p>
                      )}
                      {CONTACT_CONFIG.udyamNumber && (
                        <p>Udyam: <span className="font-mono text-[#F3F5F7]">{CONTACT_CONFIG.udyamNumber}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Model & 24h Promise */}
                <div className="flex items-start gap-3.5 rounded-xl border border-[#222730] bg-[#141820]/60 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a202a] border border-[#2a3340] text-[#e8a064]">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#7E8997]">
                      Delivery Model
                    </h3>
                    <p className="mt-1 text-xs text-[#A7B0BC] leading-relaxed">
                      Remote-first technology company collaborating with clients across India &amp; globally.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-medium">
                    We reply within 24 hours guaranteed.
                  </span>
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
                          <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#e8a064] mb-2">
                            Step 1 &middot; Project Scope &amp; Requirements
                          </h3>

                          <div className="flex items-center justify-between text-[11px] text-[#7E8997] mb-4 pb-2 border-b border-white/5">
                            <span><span className="text-[#e8a064] font-bold">*</span> Indicates required field</span>
                            <span className="text-emerald-400 font-mono flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Guaranteed reply within 24h
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Service Selection */}
                            <div>
                              <label htmlFor="service" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Required Service <span className="text-[#e8a064] font-bold">*</span>
                              </label>
                              <select
                                id="service"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                className={`w-full bg-[#0f0f0f] border rounded-xl p-3 text-[#F3F5F7] text-sm focus:outline-none transition-colors ${
                                  fieldErrors.service
                                    ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                    : "border-[#2a2a2a] focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064]"
                                }`}
                              >
                                <option value="" disabled>Select primary service...</option>
                                {SERVICE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              {fieldErrors.service && (
                                <p className="mt-1 text-[11px] text-red-400">{fieldErrors.service}</p>
                              )}
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
                                Project Brief &amp; Requirements <span className="text-[#e8a064] font-bold">*</span>
                              </label>
                              <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full bg-[#0f0f0f] border rounded-xl p-3.5 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none transition-colors resize-none ${
                                  fieldErrors.message
                                    ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                    : "border-[#2a2a2a] focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064]"
                                }`}
                                placeholder="Describe what you want to build, key features, business objectives, or reference links..."
                              />
                              {fieldErrors.message && (
                                <p className="mt-1 text-[11px] text-red-400">{fieldErrors.message}</p>
                              )}
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
                          <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-[#e8a064] mb-2">
                            Step 2 &middot; Your Contact Information
                          </h3>

                          <div className="flex items-center justify-between text-[11px] text-[#7E8997] mb-4 pb-2 border-b border-white/5">
                            <span><span className="text-[#e8a064] font-bold">*</span> Indicates required field</span>
                            <span className="text-[#A7B0BC]">Direct contact only &middot; No spam</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="sm:col-span-2">
                              <label htmlFor="fullName" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Full Name <span className="text-[#e8a064] font-bold">*</span>
                              </label>
                              <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full bg-[#0f0f0f] border rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none transition-colors ${
                                  fieldErrors.fullName
                                    ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                    : "border-[#2a2a2a] focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064]"
                                }`}
                                placeholder="e.g. John Doe"
                              />
                              {fieldErrors.fullName && (
                                <p className="mt-1 text-[11px] text-red-400">{fieldErrors.fullName}</p>
                              )}
                            </div>

                            {/* Work Email */}
                            <div>
                              <label htmlFor="email" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Business / Work Email <span className="text-[#e8a064] font-bold">*</span>
                              </label>
                              <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full bg-[#0f0f0f] border rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none transition-colors ${
                                  fieldErrors.email
                                    ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                    : "border-[#2a2a2a] focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064]"
                                }`}
                                placeholder="name@company.com"
                              />
                              {fieldErrors.email && (
                                <p className="mt-1 text-[11px] text-red-400">{fieldErrors.email}</p>
                              )}
                            </div>

                            {/* Phone */}
                            <div>
                              <label htmlFor="phone" className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                                Phone Number <span className="text-[#e8a064] font-bold">*</span>
                              </label>
                              <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full bg-[#0f0f0f] border rounded-xl p-3 text-[#F3F5F7] text-sm placeholder:text-[#566171] focus:outline-none transition-colors ${
                                  fieldErrors.phone
                                    ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                    : "border-[#2a2a2a] focus:border-[#e8a064] focus:ring-1 focus:ring-[#e8a064]"
                                }`}
                                placeholder="+91 98765 43210"
                              />
                              {fieldErrors.phone && (
                                <p className="mt-1 text-[11px] text-red-400">{fieldErrors.phone}</p>
                              )}
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

                          {/* Guaranteed Response SLA Badge */}
                          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            <span className="leading-relaxed">
                              <strong>Guaranteed response:</strong> We review your requirements and respond within 24 hours.
                            </span>
                          </div>
                        </div>

                        {/* Honeypot field for bot deterrence */}
                        <input
                          type="text"
                          name="website_trap"
                          tabIndex={-1}
                          autoComplete="off"
                          className="hidden"
                          aria-hidden="true"
                          style={{ display: "none" }}
                        />

                        {/* Dual Mandatory Checks: 1. Privacy Policy Acknowledgement */}
                        <div className="pt-2">
                          <RequiredPolicyAcknowledgement
                            checked={policyAcknowledged}
                            onChange={(val) => {
                              setPolicyAcknowledged(val);
                              setPolicyError(null);
                            }}
                            error={policyError}
                            showVersionBadge={true}
                            policyVersion="1.0.0"
                          />
                        </div>

                        {/* Dual Mandatory Checks: 2. Real Google reCAPTCHA v2 Checkbox */}
                        <div className="pt-2 flex flex-col items-center sm:items-start">
                          <GoogleRecaptchaWidget
                            onVerify={(token) => {
                              setRecaptchaToken(token);
                              setCaptchaToken(token);
                              setRecaptchaError(null);
                              setErrorMsg("");
                            }}
                            onExpire={() => {
                              setRecaptchaToken("");
                              setCaptchaToken("");
                              setRecaptchaError("Verification expired. Please tick the checkbox again.");
                            }}
                            onError={() => {
                              setRecaptchaToken("");
                              setCaptchaToken("");
                              setRecaptchaError("Verification provider error. Please try again.");
                            }}
                            resetTrigger={recaptchaResetCount}
                            errorMessage={recaptchaError}
                          />
                        </div>

                        {/* DPDP Act 2023 Statutory Disclosure */}
                        <p className="text-[11px] text-[#7E8997] leading-relaxed">
                          Your submission is processed securely in compliance with the Digital Personal Data Protection (DPDP) Act 2023. We never sell your personal information.
                        </p>

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
                            disabled={status === "loading" || (!captchaToken && turnstileStatus === "loading")}
                            className="inline-flex items-center justify-center gap-2 bg-[#e8a064] text-[#0f0f0f] px-8 py-3.5 rounded-full text-xs font-bold hover:bg-[#d4915c] transition-colors disabled:opacity-60"
                          >
                            {status === "loading" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Securing Inquiry...</span>
                              </>
                            ) : (!captchaToken && turnstileStatus === "loading") ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Verifying Security Check...</span>
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
