"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PartnerApplicationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    // Step 2
    occupation: "",
    currentWork: "",
    yearsOfExperience: "",
    relevantExperience: "",
    clientNetwork: "",
    // Step 3
    edu10thSchool: "",
    edu10thBoard: "",
    edu10thYear: "",
    edu10thPercent: "",
    edu12thSchool: "",
    edu12thBoard: "",
    edu12thYear: "",
    edu12thPercent: "",
    eduUGDegree: "",
    eduUGCollege: "",
    eduUGYear: "",
    eduUGBranch: "",
    // Step 4
    motivation: "",
    contribution: "",
    additionalInfo: ""
  });

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.country || !formData.city) {
        setError("Please fill all required fields in Step 1.");
        return;
      }
    } else if (step === 2) {
      if (!formData.occupation) {
        setError("Please select your occupation.");
        return;
      }
    } else if (step === 3) {
      if (!formData.edu10thSchool || !formData.edu10thBoard || !formData.edu10thYear) {
        setError("10th Standard details are mandatory.");
        return;
      }
    } else if (step === 4) {
      if (!formData.motivation) {
        setError("Please tell us why you want to become a partner.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);
    
    try {
      // Build the structured payload
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        occupation: formData.occupation,
        currentWork: formData.currentWork,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        relevantExperience: formData.relevantExperience,
        clientNetwork: formData.clientNetwork,
        education10th: {
          school: formData.edu10thSchool,
          board: formData.edu10thBoard,
          passingYear: formData.edu10thYear,
          percentage: formData.edu10thPercent
        },
        education12th: formData.edu12thSchool ? {
          school: formData.edu12thSchool,
          board: formData.edu12thBoard,
          passingYear: formData.edu12thYear,
          percentage: formData.edu12thPercent
        } : null,
        educationUndergrad: formData.eduUGDegree ? {
          degree: formData.eduUGDegree,
          college: formData.eduUGCollege,
          passingYear: formData.eduUGYear,
          branch: formData.eduUGBranch
        } : null,
        motivation: formData.motivation,
        contribution: formData.contribution,
        additionalInfo: formData.additionalInfo
      };

      const res = await fetch("/api/v1/public/business-partner/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMessage = data.message || data.error || "Failed to submit application";
        
        // If there are specific validation details from Zod, append the first one
        if (data.details) {
          const detailKeys = Object.keys(data.details).filter(k => k !== "_errors");
          if (detailKeys.length > 0) {
            const firstKey = detailKeys[0];
            const fieldError = data.details[firstKey]?._errors?.[0];
            if (fieldError) {
              errorMessage = `${errorMessage}: ${firstKey} - ${fieldError}`;
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-medium text-white mb-4">Application Submitted</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Thank you for applying to the AXIVON Business Partner Program. We have received your application and will review it shortly.
        </p>
        <Link href="/business-partner" className="text-[#e8a064] hover:text-white transition-colors">
          Return to Program Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s 
                ? "bg-[#e8a064] text-[#0a0a0a]" 
                : step > s 
                  ? "bg-green-500/20 text-green-500" 
                  : "bg-white/5 text-gray-500"
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 hidden md:block">
              {s === 1 ? "Contact" : s === 2 ? "Professional" : s === 3 ? "Education" : s === 4 ? "Motivation" : "Review"}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Forms */}
      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4 fade-in">
            <h3 className="text-xl font-medium text-white mb-6">Personal & Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                <input type="text" value={formData.fullName} onChange={(e) => updateForm("fullName", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => updateForm("email", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
                <input type="tel" value={formData.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Country *</label>
                <input type="text" value={formData.country} onChange={(e) => updateForm("country", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">State / Province</label>
                <input type="text" value={formData.state} onChange={(e) => updateForm("state", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">City / Location *</label>
                <input type="text" value={formData.city} onChange={(e) => updateForm("city", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 fade-in">
            <h3 className="text-xl font-medium text-white mb-6">Professional Background</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Occupation *</label>
              <select value={formData.occupation} onChange={(e) => updateForm("occupation", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]">
                <option value="">Select Occupation...</option>
                <option value="Entrepreneur">Entrepreneur</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Consultant">Consultant</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Employee">Employee</option>
                <option value="Student">Student</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Work / Organization</label>
                <input type="text" value={formData.currentWork} onChange={(e) => updateForm("currentWork", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Years of Experience</label>
                <input type="number" min="0" value={formData.yearsOfExperience} onChange={(e) => updateForm("yearsOfExperience", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Relevant Experience</label>
              <textarea rows={3} value={formData.relevantExperience} onChange={(e) => updateForm("relevantExperience", e.target.value)} placeholder="Tell us about your professional/business experience..." className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Client / Business Network</label>
              <textarea rows={3} value={formData.clientNetwork} onChange={(e) => updateForm("clientNetwork", e.target.value)} placeholder="What type of businesses or networks do you have access to?" className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 fade-in">
            <h3 className="text-xl font-medium text-white mb-2">Education Details</h3>
            
            <div className="p-4 border border-white/10 bg-[#111]">
              <h4 className="text-sm font-semibold text-[#e8a064] mb-4">10th Standard (Mandatory)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="School / Institution *" value={formData.edu10thSchool} onChange={(e) => updateForm("edu10thSchool", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-sm text-white" />
                <input type="text" placeholder="Board *" value={formData.edu10thBoard} onChange={(e) => updateForm("edu10thBoard", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-sm text-white" />
                <input type="text" placeholder="Passing Year *" value={formData.edu10thYear} onChange={(e) => updateForm("edu10thYear", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-sm text-white" />
                <input type="text" placeholder="Percentage / Grade" value={formData.edu10thPercent} onChange={(e) => updateForm("edu10thPercent", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-sm text-white" />
              </div>
            </div>

            <div className="p-4 border border-white/5 bg-[#111]">
              <h4 className="text-sm font-semibold text-gray-400 mb-4">12th Standard (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="School / Institution" value={formData.edu12thSchool} onChange={(e) => updateForm("edu12thSchool", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
                <input type="text" placeholder="Board" value={formData.edu12thBoard} onChange={(e) => updateForm("edu12thBoard", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
                <input type="text" placeholder="Passing Year" value={formData.edu12thYear} onChange={(e) => updateForm("edu12thYear", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
                <input type="text" placeholder="Percentage / Grade" value={formData.edu12thPercent} onChange={(e) => updateForm("edu12thPercent", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
              </div>
            </div>

            <div className="p-4 border border-white/5 bg-[#111]">
              <h4 className="text-sm font-semibold text-gray-400 mb-4">Undergraduate / Diploma (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Degree (e.g. B.Tech, BBA)" value={formData.eduUGDegree} onChange={(e) => updateForm("eduUGDegree", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
                <input type="text" placeholder="College / University" value={formData.eduUGCollege} onChange={(e) => updateForm("eduUGCollege", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
                <input type="text" placeholder="Passing Year" value={formData.eduUGYear} onChange={(e) => updateForm("eduUGYear", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
                <input type="text" placeholder="Branch / Field" value={formData.eduUGBranch} onChange={(e) => updateForm("eduUGBranch", e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-sm text-white" />
              </div>
            </div>

          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 fade-in">
            <h3 className="text-xl font-medium text-white mb-6">Partnership Motivation</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Why do you want to become an AXIVON Business Partner? *</label>
              <textarea rows={4} maxLength={2000} value={formData.motivation} onChange={(e) => updateForm("motivation", e.target.value)} placeholder="Tell us why you are interested..." className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">How can you contribute?</label>
              <textarea rows={3} maxLength={2000} value={formData.contribution} onChange={(e) => updateForm("contribution", e.target.value)} placeholder="What value do you bring to the partnership?" className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Additional Information (Optional)</label>
              <textarea rows={2} maxLength={2000} value={formData.additionalInfo} onChange={(e) => updateForm("additionalInfo", e.target.value)} className="w-full bg-[#111] border border-white/10 p-3 text-white focus:outline-none focus:border-[#e8a064]" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 fade-in">
            <h3 className="text-xl font-medium text-white mb-4">Review & Submit</h3>
            <div className="bg-[#111] p-4 border border-white/5 text-sm space-y-4">
              <div className="border-b border-white/5 pb-2">
                <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Personal Info</p>
                <p className="text-gray-200">{formData.fullName} ({formData.email})</p>
                <p className="text-gray-400">{formData.city}, {formData.country}</p>
              </div>
              <div className="border-b border-white/5 pb-2">
                <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Professional</p>
                <p className="text-gray-200">{formData.occupation} {formData.currentWork ? `at ${formData.currentWork}` : ""}</p>
              </div>
              <div className="border-b border-white/5 pb-2">
                <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Education</p>
                <p className="text-gray-200">10th: {formData.edu10thSchool} ({formData.edu10thYear})</p>
                {formData.eduUGDegree && <p className="text-gray-200">UG: {formData.eduUGDegree} at {formData.eduUGCollege}</p>}
              </div>
            </div>
            <div className="bg-[#111] p-4 border-l-2 border-[#e8a064] text-xs text-gray-400">
              <p className="mb-2">I confirm that the information provided is accurate.</p>
              <p>I agree that AXIVON may use this information to review my Business Partner application as per the <Link href="/privacy-policy" className="text-[#e8a064] hover:underline">Privacy Policy</Link> and <Link href="/business-partner/policy" className="text-[#e8a064] hover:underline">Partner Policy</Link>.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
        <button
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {step < 5 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-white text-black px-6 py-2 text-sm font-semibold rounded-sm hover:bg-gray-200 transition-colors"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#e8a064] text-[#0a0a0a] px-8 py-2 text-sm font-semibold rounded-sm hover:bg-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        )}
      </div>

    </div>
  );
}
