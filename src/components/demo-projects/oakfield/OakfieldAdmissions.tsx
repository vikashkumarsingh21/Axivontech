"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  CalendarDays,
  UserCheck,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Send,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

export default function OakfieldAdmissions() {
  const [formState, setFormState] = useState({
    studentName: "",
    dob: "",
    grade: "Grade 1",
    parentName: "",
    email: "",
    phone: "",
    previousSchool: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formState.studentName.trim()) errs.studentName = "Student name is required.";
    if (!formState.parentName.trim()) errs.parentName = "Parent/Guardian name is required.";
    if (!formState.email.trim() || !/^\S+@\S+\.\S+$/.test(formState.email)) {
      errs.email = "Valid parent email is required.";
    }
    if (!formState.phone.trim() || formState.phone.length < 10) {
      errs.phone = "Valid 10-digit phone number is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate safe demo processing
    setTimeout(() => {
      setIsSubmitting(false);
      const randomRef = `OIS-2026-ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedRef(randomRef);
    }, 800);
  };

  const resetForm = () => {
    setSubmittedRef(null);
    setFormState({
      studentName: "",
      dob: "",
      grade: "Grade 1",
      parentName: "",
      email: "",
      phone: "",
      previousSchool: "",
      message: "",
    });
    setErrors({});
  };

  return (
    <section id="admissions" className="py-20 bg-[#f4efe4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Admissions Desk (Academic Year 2026–2027)
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            Begin Your Child&apos;s Journey at Oakfield
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            Admissions are open for Nursery through Grade XI for the upcoming academic cycle. We follow an inclusive, transparent, and merit-oriented enrollment process.
          </p>
        </div>

        {/* 4-Step Roadmap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 relative">
            <span className="absolute -top-3 left-6 rounded-full bg-[#143d30] px-3 py-0.5 text-[11px] font-bold text-[#c8a24d]">
              Step 01
            </span>
            <FileCheck2 className="h-6 w-6 text-[#143d30] mt-2 mb-3" />
            <h4 className="font-serif text-base font-bold text-[#143d30]">Online Registration</h4>
            <p className="text-xs leading-relaxed text-[#4f5e55] mt-1">
              Submit the online enquiry or registration form with basic student details and academic records.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 relative">
            <span className="absolute -top-3 left-6 rounded-full bg-[#143d30] px-3 py-0.5 text-[11px] font-bold text-[#c8a24d]">
              Step 02
            </span>
            <CalendarDays className="h-6 w-6 text-[#143d30] mt-2 mb-3" />
            <h4 className="font-serif text-base font-bold text-[#143d30]">Campus Walk &amp; Interaction</h4>
            <p className="text-xs leading-relaxed text-[#4f5e55] mt-1">
              Visit the campus for an informal interactive session with academic coordinators and a guided facility tour.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 relative">
            <span className="absolute -top-3 left-6 rounded-full bg-[#143d30] px-3 py-0.5 text-[11px] font-bold text-[#c8a24d]">
              Step 03
            </span>
            <UserCheck className="h-6 w-6 text-[#143d30] mt-2 mb-3" />
            <h4 className="font-serif text-base font-bold text-[#143d30]">Document Verification</h4>
            <p className="text-xs leading-relaxed text-[#4f5e55] mt-1">
              Submission of birth certificate, previous school transfer certificate (TC), and immunization records.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 relative">
            <span className="absolute -top-3 left-6 rounded-full bg-[#c8a24d] px-3 py-0.5 text-[11px] font-bold text-[#143d30]">
              Step 04
            </span>
            <CheckCircle className="h-6 w-6 text-[#143d30] mt-2 mb-3" />
            <h4 className="font-serif text-base font-bold text-[#143d30]">Enrollment &amp; Welcome</h4>
            <p className="text-xs leading-relaxed text-[#4f5e55] mt-1">
              Fee settlement, allocation to House, uniform and book kit distribution, and welcome orientation.
            </p>
          </div>
        </div>

        {/* Form & Guidelines Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Guidelines & Policy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#143d30] mb-3">
                Age Eligibility Criteria (as of 31 March 2026)
              </h3>
              <div className="space-y-2.5 text-xs text-[#4f5e55]">
                <div className="flex justify-between pb-2 border-b border-[#ece4d5]">
                  <span className="font-medium">Nursery / Foundation:</span>
                  <span className="font-bold text-[#143d30]">3 Years +</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ece4d5]">
                  <span className="font-medium">Junior Kindergarten (LKG):</span>
                  <span className="font-bold text-[#143d30]">4 Years +</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ece4d5]">
                  <span className="font-medium">Senior Kindergarten (UKG):</span>
                  <span className="font-bold text-[#143d30]">5 Years +</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ece4d5]">
                  <span className="font-medium">Grade 1:</span>
                  <span className="font-bold text-[#143d30]">6 Years + (NEP Aligned)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Grades II to XI:</span>
                  <span className="font-bold text-[#143d30]">Based on Transfer Certificate</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c8a24d]/30 bg-[#faf8f4] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#143d30] mb-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#c8a24d]" />
                <span>Transparent Fee Policy</span>
              </h3>
              <p className="text-xs leading-relaxed text-[#4f5e55]">
                Oakfield maintains a single, transparent fee schedule without hidden capitation fees or arbitrary mid-year donations. Detailed itemized fee schedules are shared with parents during the campus interaction.
              </p>
            </div>
          </div>

          {/* Right Column: Admission Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#dfd4c0] bg-[#faf8f4] p-8 sm:p-10 shadow-sm relative">
              {/* Demo Mode Watermark Badge */}
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#143d30]/10 border border-[#143d30]/20 px-3.5 py-2 text-xs text-[#143d30]">
                <Sparkles className="h-4 w-4 text-[#c8a24d] shrink-0" />
                <span>
                  <strong>Interactive Demo Form:</strong> Submissions simulate actual admission workflows. No real personal records are stored.
                </span>
              </div>

              {submittedRef ? (
                <div className="text-center py-10 space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#143d30] text-[#c8a24d] mx-auto shadow-md">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#143d30]">
                    Admission Enquiry Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4f5e55] max-w-md mx-auto">
                    Thank you, <strong>{formState.parentName}</strong>. Your enquiry for <strong>{formState.studentName}</strong> ({formState.grade}) has been simulated successfully.
                  </p>
                  <div className="inline-block rounded-xl bg-[#f4efe4] border border-[#dfd4c0] px-6 py-3 font-mono text-sm font-bold text-[#143d30]">
                    Simulated Reference: {submittedRef}
                  </div>
                  <p className="text-[11px] text-[#718278]">
                    In a production deployment, this triggers an instant SMS/email confirmation to the parent and routes the inquiry into the admissions CRM.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={resetForm}
                      className="rounded-full bg-[#143d30] px-6 py-2.5 text-xs font-bold text-[#faf8f4] hover:bg-[#1a4e3e]"
                    >
                      Submit Another Test Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#143d30] mb-2">
                    Online Admission Enquiry 2026–27
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Student Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#18231d] mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        value={formState.studentName}
                        onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
                        placeholder="e.g. Aarav Sharma"
                        className={`w-full rounded-xl border bg-[#f4efe4] px-3.5 py-2.5 text-xs text-[#18231d] placeholder:text-[#8d9b93] focus:outline-none focus:ring-1 focus:ring-[#143d30] ${
                          errors.studentName ? "border-rose-500" : "border-[#dfd4c0]"
                        }`}
                      />
                      {errors.studentName && (
                        <p className="text-[10px] text-rose-600 mt-1">{errors.studentName}</p>
                      )}
                    </div>

                    {/* Grade applying for */}
                    <div>
                      <label className="block text-xs font-semibold text-[#18231d] mb-1">
                        Applying for Grade *
                      </label>
                      <select
                        value={formState.grade}
                        onChange={(e) => setFormState({ ...formState, grade: e.target.value })}
                        className="w-full rounded-xl border border-[#dfd4c0] bg-[#f4efe4] px-3.5 py-2.5 text-xs text-[#18231d] focus:outline-none focus:ring-1 focus:ring-[#143d30]"
                      >
                        <option value="Nursery">Nursery / Foundation</option>
                        <option value="LKG">Junior KG (LKG)</option>
                        <option value="UKG">Senior KG (UKG)</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11 - Science">Grade 11 (Science Stream)</option>
                        <option value="Grade 11 - Commerce">Grade 11 (Commerce Stream)</option>
                        <option value="Grade 11 - Humanities">Grade 11 (Humanities Stream)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Parent Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#18231d] mb-1">
                        Parent / Guardian Name *
                      </label>
                      <input
                        type="text"
                        value={formState.parentName}
                        onChange={(e) => setFormState({ ...formState, parentName: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className={`w-full rounded-xl border bg-[#f4efe4] px-3.5 py-2.5 text-xs text-[#18231d] placeholder:text-[#8d9b93] focus:outline-none focus:ring-1 focus:ring-[#143d30] ${
                          errors.parentName ? "border-rose-500" : "border-[#dfd4c0]"
                        }`}
                      />
                      {errors.parentName && (
                        <p className="text-[10px] text-rose-600 mt-1">{errors.parentName}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-[#18231d] mb-1">
                        Parent Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className={`w-full rounded-xl border bg-[#f4efe4] px-3.5 py-2.5 text-xs text-[#18231d] placeholder:text-[#8d9b93] focus:outline-none focus:ring-1 focus:ring-[#143d30] ${
                          errors.phone ? "border-rose-500" : "border-[#dfd4c0]"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#18231d] mb-1">
                      Parent Email Address *
                    </label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="e.g. rajesh.sharma@example.com"
                      className={`w-full rounded-xl border bg-[#f4efe4] px-3.5 py-2.5 text-xs text-[#18231d] placeholder:text-[#8d9b93] focus:outline-none focus:ring-1 focus:ring-[#143d30] ${
                        errors.email ? "border-rose-500" : "border-[#dfd4c0]"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-[#18231d] mb-1">
                      Specific Questions or Campus Visit Preference (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Share your child's interests or preferred day for a campus tour..."
                      className="w-full rounded-xl border border-[#dfd4c0] bg-[#f4efe4] px-3.5 py-2.5 text-xs text-[#18231d] placeholder:text-[#8d9b93] focus:outline-none focus:ring-1 focus:ring-[#143d30]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#143d30] py-3 text-xs font-bold text-[#faf8f4] hover:bg-[#1a4e3e] transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Simulating Submission...</span>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 text-[#c8a24d]" />
                          <span>Submit Demo Admission Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
