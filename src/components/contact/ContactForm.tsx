"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Mail,
  MessageCircle,
  Clock3,
} from "lucide-react";
const EASE_CONTACT = [0.22, 1, 0.36, 1] as const;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type FormStatus = "idle" | "loading" | "success" | "error";

const INITIAL_FORM_DATA: FormData = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budget: "",
  message: "",
};

const SERVICE_OPTIONS = [
  "Website Development",
  "E-Commerce Website",
  "Mobile App Development",
  "SEO Services",
  "Digital Marketing",
  "AI Solutions",
  "Custom Software Development",
];

const BUDGET_OPTIONS = [
  "Under ₹10,000",
  "₹10,000 - ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000+",
];

const BENEFITS = [
  "Fast Project Delivery",
  "Modern Technology Stack",
  "SEO Optimized Solutions",
  "Mobile Responsive Design",
  "AI-Powered Systems",
  "Dedicated Support",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s-]{7,15}$/;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }
  if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!data.service) {
    errors.service = "Please select a service.";
  }
  if (!data.budget) {
    errors.budget = "Please select a budget range.";
  }
  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = "Please share a few details about your project.";
  }

  return errors;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_CONTACT },
  },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const columnVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_CONTACT },
  },
};

const fieldGroupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_CONTACT },
  },
};

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2";

function fieldClasses(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-red-500/50 focus:border-red-400/60 focus:ring-red-400/30"
      : "border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/30"
  }`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function RequiredMark() {
  return (
    <span className="text-cyan-400" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name as keyof FormData]) return prev;
      const next = { ...prev };
      delete next[name as keyof FormData];
      return next;
    });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("loading");

    try {
      // Replace this endpoint with your actual API route or form handler.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit the form.");

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact-form"
      aria-labelledby="contact-form-heading"
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-24 sm:py-32"
    >
      {/* Floating gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div
          className="absolute -left-32 top-0 h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[120px]"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-10rem] top-1/4 h-[28rem] w-[28rem] rounded-full bg-purple-600/20 blur-[130px]"
          animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-[120px]"
          animate={{ y: [0, 20, 0], x: [0, 25, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
            PROJECT INQUIRY
          </span>

          <h2
            id="contact-form-heading"
            className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Tell Us About{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              Your Project
            </span>
          </h2>

          <p className="mt-6 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
            Fill out the form below and our team will get back to you within 24 hours.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
        >
          {/* LEFT: Form */}
          <motion.div variants={columnVariants} className="lg:col-span-3">
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-500/40 via-purple-500/20 to-cyan-400/40 p-px shadow-[0_0_60px_-15px_rgba(124,58,237,0.35)]">
              <div className="rounded-2xl bg-[#0a0f24]/90 p-6 backdrop-blur-xl sm:p-8">
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE_CONTACT }}
                      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-lg shadow-purple-500/30">
                        <CheckCircle2 className="h-8 w-8 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                      <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                        Thanks for reaching out. Our team will review your project
                        details and get back to you within 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f24]"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      noValidate
                      aria-label="Project inquiry form"
                      initial="hidden"
                      animate="visible"
                      variants={fieldGroupVariants}
                      className="space-y-5"
                    >
                      {/* Full Name + Email */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <motion.div variants={fieldVariants}>
                          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-300">
                            Full Name
                            <RequiredMark />
                          </label>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            aria-required="true"
                            aria-invalid={Boolean(errors.fullName)}
                            aria-describedby={errors.fullName ? "fullName-error" : undefined}
                            className={fieldClasses(Boolean(errors.fullName))}
                          />
                          <FieldError id="fullName-error" message={errors.fullName} />
                        </motion.div>

                        <motion.div variants={fieldVariants}>
                          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                            Email Address
                            <RequiredMark />
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                            aria-required="true"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            className={fieldClasses(Boolean(errors.email))}
                          />
                          <FieldError id="email-error" message={errors.email} />
                        </motion.div>
                      </div>

                      {/* Phone + Company */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <motion.div variants={fieldVariants}>
                          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-300">
                            Phone Number
                            <RequiredMark />
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            aria-required="true"
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={errors.phone ? "phone-error" : undefined}
                            className={fieldClasses(Boolean(errors.phone))}
                          />
                          <FieldError id="phone-error" message={errors.phone} />
                        </motion.div>

                        <motion.div variants={fieldVariants}>
                          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-slate-300">
                            Company Name
                          </label>
                          <input
                            id="company"
                            name="company"
                            type="text"
                            autoComplete="organization"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Company Pvt. Ltd."
                            className={fieldClasses(false)}
                          />
                        </motion.div>
                      </div>

                      {/* Service + Budget */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <motion.div variants={fieldVariants}>
                          <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-slate-300">
                            Service Required
                            <RequiredMark />
                          </label>
                          <div className="relative">
                            <select
                              id="service"
                              name="service"
                              value={formData.service}
                              onChange={handleChange}
                              aria-required="true"
                              aria-invalid={Boolean(errors.service)}
                              aria-describedby={errors.service ? "service-error" : undefined}
                              className={`${fieldClasses(Boolean(errors.service))} appearance-none pr-10 ${
                                formData.service ? "text-white" : "text-slate-500"
                              }`}
                            >
                              <option value="" disabled className="bg-[#0a0f24] text-slate-500">
                                Select a service
                              </option>
                              {SERVICE_OPTIONS.map((option) => (
                                <option key={option} value={option} className="bg-[#0a0f24] text-white">
                                  {option}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                              aria-hidden="true"
                            />
                          </div>
                          <FieldError id="service-error" message={errors.service} />
                        </motion.div>

                        <motion.div variants={fieldVariants}>
                          <label htmlFor="budget" className="mb-1.5 block text-sm font-medium text-slate-300">
                            Project Budget
                            <RequiredMark />
                          </label>
                          <div className="relative">
                            <select
                              id="budget"
                              name="budget"
                              value={formData.budget}
                              onChange={handleChange}
                              aria-required="true"
                              aria-invalid={Boolean(errors.budget)}
                              aria-describedby={errors.budget ? "budget-error" : undefined}
                              className={`${fieldClasses(Boolean(errors.budget))} appearance-none pr-10 ${
                                formData.budget ? "text-white" : "text-slate-500"
                              }`}
                            >
                              <option value="" disabled className="bg-[#0a0f24] text-slate-500">
                                Select your budget
                              </option>
                              {BUDGET_OPTIONS.map((option) => (
                                <option key={option} value={option} className="bg-[#0a0f24] text-white">
                                  {option}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                              aria-hidden="true"
                            />
                          </div>
                          <FieldError id="budget-error" message={errors.budget} />
                        </motion.div>
                      </div>

                      {/* Project Details */}
                      <motion.div variants={fieldVariants}>
                        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-300">
                          Project Details
                          <RequiredMark />
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your goals, timeline, and any specific requirements..."
                          aria-required="true"
                          aria-invalid={Boolean(errors.message)}
                          aria-describedby={errors.message ? "message-error" : undefined}
                          className={`${fieldClasses(Boolean(errors.message))} resize-none`}
                        />
                        <FieldError id="message-error" message={errors.message} />
                      </motion.div>

                      {/* Error banner */}
                      <AnimatePresence>
                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.3 }}
                            role="alert"
                            className="flex items-start gap-2 overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                          >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>
                              Something went wrong while sending your message. Please
                              try again, or email us directly at{" "}
                              <a
                                href="mailto:info@axivontech.in"
                                className="font-medium underline underline-offset-2 hover:text-red-200"
                              >
                                info@axivontech.in
                              </a>
                              .
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <motion.div variants={fieldVariants}>
                        <motion.button
                          type="submit"
                          disabled={status === "loading"}
                          whileHover={status === "loading" ? undefined : { scale: 1.02 }}
                          whileTap={status === "loading" ? undefined : { scale: 0.98 }}
                          aria-label="Send Message"
                          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f24] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {status === "loading" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message
                              <ArrowRight
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Info panel */}
          <motion.div variants={columnVariants} className="lg:col-span-2">
            <div className="relative h-full rounded-2xl bg-gradient-to-br from-cyan-400/30 via-purple-500/20 to-blue-500/30 p-px shadow-[0_0_60px_-15px_rgba(0,212,255,0.25)]">
              <div className="flex h-full flex-col rounded-2xl bg-[#0a0f24]/90 p-6 backdrop-blur-xl sm:p-8">
                <h3 className="text-xl font-bold text-white sm:text-2xl">Why Work With Axivon?</h3>

                <motion.ul
                  className="mt-6 space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  variants={fieldGroupVariants}
                >
                  {BENEFITS.map((benefit) => (
                    <motion.li
                      key={benefit}
                      variants={fieldVariants}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-md shadow-purple-500/20">
                        <CheckCircle2 className="h-4 w-4 text-white" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium text-slate-200 sm:text-base">{benefit}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <div className="space-y-4">
                  <a
                    href="#contact-form"
                    aria-label="Our response time is within 24 hours"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors duration-200 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400">
                      <Clock3 className="h-4.5 w-4.5 text-white" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Response Time
                      </span>
                      <span className="text-sm font-semibold text-white">Within 24 Hours</span>
                    </span>
                  </a>

                  <a
                    href="mailto:info@axivontech.in"
                    aria-label="Email us at info@axivontech.in"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors duration-200 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400">
                      <Mail className="h-4.5 w-4.5 text-white" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</span>
                      <span className="text-sm font-semibold text-white">info@axivontech.in</span>
                    </span>
                  </a>

                  <a
                    href="https://wa.me/919473263768"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp at +91 94732 63768"
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors duration-200 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400">
                      <MessageCircle className="h-4.5 w-4.5 text-white" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">WhatsApp</span>
                      <span className="text-sm font-semibold text-white">+91 94732 63768</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}