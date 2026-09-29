"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ChevronRight, ChevronLeft, Check, FileText } from "lucide-react";

export default function ProjectOnboardingForm() {
  const params = useParams();
  const referralCode = params.referralCode as string;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [projectCode, setProjectCode] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Client Information
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientWhatsapp: "",
    clientDesignation: "",

    // Step 2: Company Details
    companyName: "",
    industry: "",
    businessAddress: "",
    city: "",
    state: "",
    country: "",
    website: "",
    companySize: "",
    gstNumber: "",
    regNumber: "",

    // Step 3: Project Details
    projectName: "",
    requiredService: "",
    expectedTimeline: "",
    projectBudget: "",
    detailedRequirement: "",
    additionalRequirements: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep: number) => {
    setError("");
    if (currentStep === 1) {
      if (!formData.clientName.trim() || !formData.clientEmail.trim() || !formData.clientPhone.trim()) {
        setError("Please fill in all required fields (Name, Email, Phone).");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (
        !formData.companyName.trim() ||
        !formData.industry.trim() ||
        !formData.businessAddress.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.country.trim()
      ) {
        setError("Please fill in all required company details.");
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (
        !formData.projectName.trim() ||
        !formData.requiredService.trim() ||
        !formData.expectedTimeline.trim() ||
        !formData.projectBudget.trim() ||
        !formData.detailedRequirement.trim()
      ) {
        setError("Please fill in all required project details.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setError("");
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/public/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referralCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setProjectCode(data.projectCode || `PRJ-${Date.now().toString().slice(-8)}`);
        setIsSuccess(true);
        window.scrollTo(0, 0);
      } else {
        setError(data.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-[#111] border border-white/10 rounded-xl p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Project Request Submitted</h2>
          <p className="text-gray-400 text-lg mb-4">Thank you for choosing Axivon Technologies.</p>
          <p className="text-gray-500 mb-8">
            Our team will review your requirements and contact you regarding the proposal, contract, and next steps.
          </p>
          <div className="inline-block bg-[#1a1a1a] border border-white/10 rounded-lg px-6 py-4">
            <p className="text-gray-400 text-sm mb-1">Your Project Code</p>
            <p className="text-white font-mono font-semibold text-xl tracking-wider">{projectCode}</p>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Client" },
    { id: 2, name: "Company" },
    { id: 3, name: "Project" },
    { id: 4, name: "Review" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon"
            width={180}
            height={45}
            className="h-12 w-auto brightness-0 invert mx-auto mb-6"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Start Your Project with Axivon Technologies
          </h1>
          <p className="text-gray-400">
            Provide your project and business details so our team can prepare the next steps.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-800 -z-10" />
            {steps.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-[3px] transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-[#0a0a0a] border-red-600 text-red-600"
                        : "bg-[#0a0a0a] border-gray-700 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : s.id}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isActive || isCompleted ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* STEP 1: CLIENT INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">
                1. Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Client's full name"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    placeholder="client@company.com"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">WhatsApp Number</label>
                  <input
                    type="tel"
                    name="clientWhatsapp"
                    value={formData.clientWhatsapp}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Designation</label>
                  <input
                    type="text"
                    name="clientDesignation"
                    value={formData.clientDesignation}
                    onChange={handleInputChange}
                    placeholder="e.g. CEO, CTO, Project Manager"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COMPANY DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">
                2. Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Industry <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g. Healthcare, Fintech, Education"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Business Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder="Complete business address"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    State <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Size</label>
                  <input
                    type="text"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    placeholder="e.g. 50-200 employees"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Registration No.</label>
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleInputChange}
                    placeholder="Registration number"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROJECT DETAILS */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">
                3. Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="e.g. E-Commerce Platform Redesign"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Required Service <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="requiredService"
                    value={formData.requiredService}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select a service</option>
                    <option value="Custom Software Development">Custom Software Development</option>
                    <option value="AI Solutions">AI Solutions</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Robotics & IoT">Robotics & IoT</option>
                    <option value="Automation">Automation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Expected Timeline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="expectedTimeline"
                    value={formData.expectedTimeline}
                    onChange={handleInputChange}
                    placeholder="e.g. 3–6 months"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Project Budget <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectBudget"
                    value={formData.projectBudget}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹5,00,000"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Detailed Project Requirement <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="detailedRequirement"
                    value={formData.detailedRequirement}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Describe your project goals, features, integrations, and any specific requirements..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600 resize-none"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Additional Requirements</label>
                  <textarea
                    name="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Reference links, existing systems, technical preferences..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600 resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2 mt-4 pt-6 border-t border-white/10">
                  <h4 className="text-lg font-medium text-white mb-4">Project Contact (Optional)</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Primary Project Contact</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="If different from client above"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="Contact email"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Contact phone"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50 placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">
                4. Review & Submit
              </h3>
              
              <div className="space-y-6">
                {/* Client Details Summary */}
                <div className="bg-[#0d0d0d] border border-white/5 rounded-lg p-5">
                  <h4 className="text-emerald-500 font-medium mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Client Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div><span className="text-gray-500 block">Full Name</span><span className="text-gray-200">{formData.clientName}</span></div>
                    <div><span className="text-gray-500 block">Email Address</span><span className="text-gray-200">{formData.clientEmail}</span></div>
                    <div><span className="text-gray-500 block">Phone Number</span><span className="text-gray-200">{formData.clientPhone}</span></div>
                    <div><span className="text-gray-500 block">WhatsApp Number</span><span className="text-gray-200">{formData.clientWhatsapp || "—"}</span></div>
                    <div className="sm:col-span-2"><span className="text-gray-500 block">Designation</span><span className="text-gray-200">{formData.clientDesignation || "—"}</span></div>
                  </div>
                </div>

                {/* Company Details Summary */}
                <div className="bg-[#0d0d0d] border border-white/5 rounded-lg p-5">
                  <h4 className="text-emerald-500 font-medium mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Company Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div><span className="text-gray-500 block">Company Name</span><span className="text-gray-200">{formData.companyName}</span></div>
                    <div><span className="text-gray-500 block">Industry</span><span className="text-gray-200">{formData.industry}</span></div>
                    <div className="sm:col-span-2"><span className="text-gray-500 block">Business Address</span><span className="text-gray-200">{formData.businessAddress}, {formData.city}, {formData.state}, {formData.country}</span></div>
                    <div><span className="text-gray-500 block">Website</span><span className="text-gray-200">{formData.website || "—"}</span></div>
                    <div><span className="text-gray-500 block">Company Size</span><span className="text-gray-200">{formData.companySize || "—"}</span></div>
                    <div><span className="text-gray-500 block">GST Number</span><span className="text-gray-200">{formData.gstNumber || "—"}</span></div>
                    <div><span className="text-gray-500 block">Registration No.</span><span className="text-gray-200">{formData.regNumber || "—"}</span></div>
                  </div>
                </div>

                {/* Project Details Summary */}
                <div className="bg-[#0d0d0d] border border-white/5 rounded-lg p-5">
                  <h4 className="text-emerald-500 font-medium mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Project Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div className="sm:col-span-2"><span className="text-gray-500 block">Project Name</span><span className="text-gray-200">{formData.projectName}</span></div>
                    <div><span className="text-gray-500 block">Required Service</span><span className="text-gray-200">{formData.requiredService}</span></div>
                    <div><span className="text-gray-500 block">Expected Timeline</span><span className="text-gray-200">{formData.expectedTimeline}</span></div>
                    <div><span className="text-gray-500 block">Project Budget</span><span className="text-gray-200">{formData.projectBudget}</span></div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500 block">Detailed Requirement</span>
                      <span className="text-gray-200 whitespace-pre-wrap mt-1 block">{formData.detailedRequirement}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500 block">Additional Requirements</span>
                      <span className="text-gray-200 whitespace-pre-wrap mt-1 block">{formData.additionalRequirements || "—"}</span>
                    </div>
                    <div className="sm:col-span-2 border-t border-white/5 pt-4 mt-2">
                      <span className="text-gray-400 font-medium block mb-3">Project Contact</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><span className="text-gray-500 block">Name</span><span className="text-gray-200">{formData.contactPerson || "—"}</span></div>
                        <div><span className="text-gray-500 block">Email</span><span className="text-gray-200">{formData.contactEmail || "—"}</span></div>
                        <div><span className="text-gray-500 block">Phone</span><span className="text-gray-200">{formData.contactPhone || "—"}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {referralCode && (
                  <div className="flex justify-center pt-2">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 flex items-center gap-2">
                      <span>Referral Code Applied:</span>
                      <span className="text-emerald-400 font-mono font-medium">{referralCode}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div></div> // Empty div to keep Next button right-aligned
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70 min-w-[200px]"
              >
                {isSubmitting ? "Submitting..." : "Submit Project Request"}
              </button>
            )}
          </div>
          
          {step === 4 && (
            <p className="text-center text-xs text-gray-500 mt-6">
              By submitting, you confirm that the information provided is accurate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
