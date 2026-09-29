"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ChevronRight, ChevronLeft, Check } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  designation: string;
  companyName: string;
  industry: string;
  city: string;
  website: string;
  companySize: string;
  state: string;
  country: string;
  serviceInterest: string;
  message: string;
  budget: string;
  timeline: string;
  contactMethod: string;
  notes: string;
};

export default function LeadFormPage() {
  const params = useParams();
  const referralCode = params.referralCode as string;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    designation: "",
    companyName: "",
    industry: "",
    city: "",
    website: "",
    companySize: "",
    state: "",
    country: "",
    serviceInterest: "",
    message: "",
    budget: "",
    timeline: "",
    contactMethod: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setValidationError(null);
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return "Full Name is required.";
      if (!formData.email.trim()) return "Email is required.";
      if (!formData.phone.trim()) return "Phone Number is required.";
      return null;
    }
    if (currentStep === 2) {
      if (!formData.companyName.trim()) return "Company Name is required.";
      if (!formData.industry.trim()) return "Industry is required.";
      if (!formData.city.trim()) return "City is required.";
      return null;
    }
    if (currentStep === 3) {
      if (!formData.serviceInterest.trim()) return "Interested Service is required.";
      if (!formData.message.trim()) return "Requirement Summary is required.";
      return null;
    }
    return null;
  };

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setValidationError(null);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const errorMsg = validateStep(3);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referralCode }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit enquiry. Please try again.");
      }

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-300 mb-2">
            Your requirement has been submitted successfully.
          </p>
          <p className="text-gray-500 text-sm">
            Axivon Technologies will contact you shortly.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: "Contact" },
    { number: 2, label: "Business" },
    { number: 3, label: "Requirement" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon"
            width={160}
            height={40}
            className="h-10 w-auto brightness-0 invert mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white mb-3">
            Tell Us About Your Requirement
          </h1>
          <p className="text-gray-400">
            Share your requirement and our team will contact you shortly.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-800 -z-10"></div>
            {steps.map((s) => {
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              return (
                <div key={s.number} className="flex flex-col items-center bg-[#0a0a0a] px-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 mb-2 transition-colors ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#111] border-gray-700 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive || isCompleted ? "text-blue-400" : "text-gray-600"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-lg">
              {error}
            </div>
          )}
          {validationError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-lg">
              {validationError}
            </div>
          )}

          <div className="space-y-6">
            {/* STEP 1: CONTACT DETAILS */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl font-semibold text-white mb-6">Contact Details</h3>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Full Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Email <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Phone Number <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="Your job title"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUSINESS DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl font-semibold text-white mb-6">Business Details</h3>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Company / Business Name <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                    placeholder="Your company name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Industry <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="e.g. Healthcare, Retail"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      City <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="Your city"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Company Size
                    </label>
                    <input
                      type="text"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="e.g. 10-50 employees"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="Your state"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="Your country"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: YOUR REQUIREMENT */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xl font-semibold text-white mb-6">Your Requirement</h3>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Interested Service <span className="text-blue-400">*</span>
                  </label>
                  <select
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="" disabled>Select a service</option>
                    <option value="Custom Software Development">Custom Software Development</option>
                    <option value="AI Solutions">AI Solutions</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="SEO Services">SEO Services</option>
                    <option value="Robotics & IoT">Robotics & IoT</option>
                    <option value="Automation">Automation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Requirement Summary <span className="text-blue-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                    placeholder="Briefly describe what you need..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Estimated Budget Range
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="e.g. ₹1L–5L"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-400">
                      Expected Timeline
                    </label>
                    <input
                      type="text"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                      placeholder="e.g. 1–3 months"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Preferred Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Any</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Video Call">Video Call</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-400">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-600"
                    placeholder="Any other details..."
                  />
                </div>

                {referralCode && (
                  <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-400 font-medium mb-1">Referred via partner</p>
                      <p className="text-sm text-gray-300">{referralCode}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                      Auto-assigned
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Enquiry"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
