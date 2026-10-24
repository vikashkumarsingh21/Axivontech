"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Briefcase, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function NewBrokerProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    companyName: "",
    designation: "",
    industry: "",
    city: "",
    serviceInterest: "Full-Stack Web Application",
    message: "",
    budget: "",
    timeline: "1-3 months",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
        throw new Error("Please fill in all required fields (Name, Email, Phone, Project Requirements).");
      }

      const res = await fetch("/api/v1/broker/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || null,
          companyName: form.companyName.trim() || null,
          designation: form.designation.trim() || null,
          industry: form.industry.trim() || null,
          city: form.city.trim() || null,
          serviceInterest: form.serviceInterest,
          message: form.message.trim(),
          budget: form.budget ? parseFloat(form.budget) : null,
          timeline: form.timeline || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project referral.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-[#11141A] border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Project Referral Submitted Successfully</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Your client lead has been registered in the Axivon Partner CRM. Our executive technical sales team will review the requirements and initiate discovery.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link
              href="/broker/projects"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              View My Projects
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  whatsapp: "",
                  companyName: "",
                  designation: "",
                  industry: "",
                  city: "",
                  serviceInterest: "Full-Stack Web Application",
                  message: "",
                  budget: "",
                  timeline: "1-3 months",
                });
              }}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors"
            >
              Submit Another Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-[#111] border border-white/10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-red-500" />
            <span>Submit New Project Referral</span>
          </h1>
          <p className="text-sm text-gray-400">
            Register a prospective client or project requirement to begin commission-eligible onboarding.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            1. Client Contact Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Client Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Client Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="rahul@company.com"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                WhatsApp (Optional)
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            2. Company / Organization
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. Apex Retail Solutions"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Designation</label>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Managing Director / Founder"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Industry</label>
              <input
                type="text"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="e.g. E-Commerce, Healthcare, FinTech"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">City / Location</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Mumbai"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            3. Project Requirements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Primary Service Required</label>
              <select
                name="serviceInterest"
                value={form.serviceInterest}
                onChange={handleChange}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="Full-Stack Web Application">Full-Stack Web Application</option>
                <option value="Mobile App Development">Mobile App Development (iOS & Android)</option>
                <option value="Enterprise AI & Automation">Enterprise AI & Automation</option>
                <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                <option value="Custom CRM & ERP Systems">Custom CRM & ERP Systems</option>
                <option value="UI/UX Design & Prototyping">UI/UX Design & Prototyping</option>
                <option value="Cybersecurity & Code Audit">Cybersecurity & Code Audit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Budget Estimate (INR)</label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 500000"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Detailed Requirement Summary <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Describe what the client wants built, current pain points, existing stack, and deliverables..."
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500/50 resize-y"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Link
            href="/broker/projects"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{submitting ? "Submitting Referral..." : "Submit Project Referral"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
