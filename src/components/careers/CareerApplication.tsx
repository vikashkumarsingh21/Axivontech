"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Code2,
  Link2,
  Globe,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Upload,
  Check,
  FileCheck
} from "lucide-react";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/ui/TurnstileWidget";
import { RequiredPolicyAcknowledgement } from "@/components/legal/RequiredPolicyAcknowledgement";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  jobId?: string;
  location: string;
  experience: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resumeUrl: string;
  resumeFileName?: string;
  coverLetter: string;
}

interface CareerApplicationProps {
  initialJobs?: { id: string; title: string; department?: string }[];
  preselectedJobTitle?: string;
  preselectedJobId?: string;
}

export default function CareerApplication({
  initialJobs,
  preselectedJobTitle,
  preselectedJobId,
}: CareerApplicationProps) {
  const [availableJobs, setAvailableJobs] = useState<{ id: string; title: string }[]>(
    initialJobs || []
  );

  const defaultPosition =
    preselectedJobTitle ||
    (initialJobs && initialJobs[0]?.title) ||
    "Other / Speculative Application";

  const [form, setForm] = useState<ApplicationFormData>({
    fullName: "",
    email: "",
    phone: "",
    position: defaultPosition,
    jobId: preselectedJobId || (initialJobs && initialJobs[0]?.id),
    location: "",
    experience: "",
    linkedin: "",
    github: "",
    portfolio: "",
    resumeUrl: "",
    resumeFileName: "",
    coverLetter: "",
  });

  const [resumeMode, setResumeMode] = useState<"upload" | "link">("upload");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [recaptchaResetCount, setRecaptchaResetCount] = useState<number>(0);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Sync preselected position if props change
  useEffect(() => {
    if (preselectedJobTitle) {
      setForm((prev) => ({
        ...prev,
        position: preselectedJobTitle,
        jobId: preselectedJobId || prev.jobId,
      }));
    }
  }, [preselectedJobTitle, preselectedJobId]);

  // Dynamically fetch jobs if not provided as initialJobs
  useEffect(() => {
    if (!initialJobs || initialJobs.length === 0) {
      async function loadActiveJobs() {
        try {
          const res = await fetch("/api/v1/public/careers/jobs");
          if (res.ok) {
            const data = await res.json();
            if (data.jobs && data.jobs.length > 0) {
              setAvailableJobs(data.jobs.map((j: any) => ({ id: j.id, title: j.title })));
            }
          }
        } catch (e) {
          // Keep static fallback
        }
      }
      loadActiveJobs();
    }
  }, [initialJobs]);

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = e.target.value;
    const found = availableJobs.find((j) => j.title === selectedTitle);
    setForm((prev) => ({
      ...prev,
      position: selectedTitle,
      jobId: found?.id || undefined,
    }));
    if (fieldErrors.position) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.position;
        return next;
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    if (captchaToken) {
      formData.append("captchaToken", captchaToken);
    }

    try {
      const res = await fetch("/api/v1/public/careers/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed.");
      }

      setForm((prev) => ({
        ...prev,
        resumeUrl: data.url,
        resumeFileName: data.filename || file.name,
      }));
      setUploadSuccess(file.name);
      if (fieldErrors.resumeUrl) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.resumeUrl;
          return next;
        });
      }
    } catch (err: any) {
      setUploadError(err.message || "Could not upload file.");
    } finally {
      setUploadingResume(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.position.trim()) {
      errors.position = "Please select a position.";
    }

    if (!form.location.trim()) {
      errors.location = "Location is required.";
    }

    if (!form.resumeUrl.trim()) {
      errors.resumeUrl =
        resumeMode === "upload"
          ? "Please upload your resume file (PDF or DOCX)."
          : "Please provide a public Google Drive or portfolio resume link.";
    } else if (resumeMode === "link" && !/^https?:\/\//i.test(form.resumeUrl.trim())) {
      errors.resumeUrl = "Resume link must start with http:// or https:// (e.g. Google Drive, Dropbox, Notion).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    if (!policyAcknowledged) {
      setPolicyError("Please acknowledge the Applicant Privacy Policy before submitting.");
      setErrorMessage("Please acknowledge the Applicant Privacy Policy before submitting.");
      return;
    }

    if (!captchaToken) {
      setErrorMessage("Please complete the human verification before submitting.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          privacyPolicyAcknowledged: true,
          policyVersion: "1.0.0",
          recaptchaToken: captchaToken,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        turnstileRef.current?.reset();
        setCaptchaToken("");
        setRecaptchaResetCount((prev) => prev + 1);
        throw new Error(data.message || "Failed to submit application. Please try again.");
      }

      setSuccess(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        position: defaultPosition,
        jobId: preselectedJobId,
        location: "",
        experience: "",
        linkedin: "",
        github: "",
        portfolio: "",
        resumeUrl: "",
        resumeFileName: "",
        coverLetter: "",
      });
      setUploadSuccess(null);
    } catch (err: any) {
      turnstileRef.current?.reset();
      setCaptchaToken("");
      console.error("[Career Application Form]", err);
      setErrorMessage(
        err.message ||
          "Submission failed. Please check your internet connection or email us directly at info@axivontech.in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="apply-form" className="py-16 sm:py-24 bg-[#0B0D10] border-b border-[#1E2530]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-wider mb-3">
            <Send className="w-3.5 h-3.5" />
            <span>Apply Now</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F3F5F7] tracking-tight mb-3">
            Submit Your Application
          </h2>
          <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed font-light max-w-xl mx-auto">
            Take the first step toward building your technical career with Axivon. Fill out the application form below.
          </p>
        </div>

        {/* Success Message Card */}
        {success ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#151A21] border border-[#10B981]/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#F3F5F7]">Application Received!</h3>
            <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed max-w-lg mx-auto font-light">
              Thank you for applying to Axivon Technologies. Our engineering team reviews applications on a rolling basis. If your profile matches our requirements, we will contact you within 3–7 business days.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-[#10B981] text-[#04130E] font-semibold text-xs transition-colors hover:bg-[#059669]"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-2xl bg-[#151A21] border border-[#29313B] shadow-sm space-y-6"
            noValidate
          >
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border ${
                      fieldErrors.fullName ? "border-red-500" : "border-[#29313B]"
                    } text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-red-400 mt-1">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@domain.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border ${
                      fieldErrors.email ? "border-red-500" : "border-[#29313B]"
                    } text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: Phone & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Target Position <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={form.position}
                    onChange={handlePositionChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] focus:outline-none focus:border-[#10B981] transition-colors"
                  >
                    {availableJobs.map((job) => (
                      <option key={job.id} value={job.title} className="bg-[#151A21] text-white">
                        {job.title}
                      </option>
                    ))}
                    <option value="General Engineering Speculative" className="bg-[#151A21] text-white">
                      Other / Speculative Application
                    </option>
                  </select>
                </div>
                {fieldErrors.position && (
                  <p className="text-[11px] text-red-400 mt-1">{fieldErrors.position}</p>
                )}
              </div>
            </div>

            {/* Row 3: Location & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Current City / State <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g. Surat, Gujarat, India"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border ${
                      fieldErrors.location ? "border-red-500" : "border-[#29313B]"
                    } text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors`}
                  />
                </div>
                {fieldErrors.location && (
                  <p className="text-[11px] text-red-400 mt-1">{fieldErrors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Years of Coding Experience
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="e.g. Student / 6 months / 1 year"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Resume Submission (Direct Upload OR Drive Link) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#A7B0BC]">
                  Resume / CV <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setResumeMode("upload")}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      resumeMode === "upload"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "text-[#7E8997] border-transparent hover:text-white"
                    }`}
                  >
                    File Upload (PDF/DOC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeMode("link")}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      resumeMode === "link"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "text-[#7E8997] border-transparent hover:text-white"
                    }`}
                  >
                    Google Drive Link
                  </button>
                </div>
              </div>

              {resumeMode === "upload" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-5 rounded-2xl border-2 border-dashed ${
                      fieldErrors.resumeUrl
                        ? "border-red-500/50 bg-red-500/5"
                        : uploadSuccess
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-[#29313B] bg-[#10151B] hover:border-emerald-500/40"
                    } flex flex-col items-center justify-center text-center cursor-pointer transition-all`}
                  >
                    {uploadingResume ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading resume securely...</span>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                        <FileCheck className="w-5 h-5" />
                        <span>{uploadSuccess} attached!</span>
                        <span className="text-[10px] text-[#7E8997] underline ml-2">Click to replace</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#7E8997] mb-2" />
                        <p className="text-xs font-semibold text-white">Click or drag resume file here</p>
                        <p className="text-[10px] text-[#7E8997] mt-0.5">Supports PDF, DOC, DOCX up to 10MB</p>
                      </>
                    )}
                  </div>
                  {uploadError && <p className="text-[11px] text-red-400 mt-1">{uploadError}</p>}
                  {fieldErrors.resumeUrl && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.resumeUrl}</p>}
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      value={form.resumeUrl}
                      onChange={(e) => handleInputChange("resumeUrl", e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or Dropbox link"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border ${
                        fieldErrors.resumeUrl ? "border-red-500" : "border-[#29313B]"
                      } text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors`}
                    />
                  </div>
                  <p className="text-[11px] text-[#7E8997] mt-1.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#D6B779] shrink-0" />
                    <span>Please ensure link sharing permissions are set to &quot;Anyone with the link can view&quot;.</span>
                  </p>
                  {fieldErrors.resumeUrl && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.resumeUrl}</p>}
                </div>
              )}
            </div>

            {/* Row 5: Profile Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">LinkedIn Profile</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={form.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">GitHub Profile</label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={form.github}
                    onChange={(e) => handleInputChange("github", e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Portfolio / Website</label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-[#566171] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={form.portfolio}
                    onChange={(e) => handleInputChange("portfolio", e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 6: Cover Letter */}
            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Brief Cover Note or Personal Projects Overview
              </label>
              <textarea
                rows={4}
                value={form.coverLetter}
                onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                placeholder="Tell us about what you have built, which tools you love using, and why you want to intern at Axivon Technologies..."
                className="w-full px-4 py-3 rounded-xl bg-[#10151B] border border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] transition-colors resize-none leading-relaxed"
              />
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

            {/* Dual Mandatory Checks: 1. Applicant Privacy Policy Acknowledgement */}
            <div className="pt-2">
              <RequiredPolicyAcknowledgement
                checked={policyAcknowledged}
                onChange={(val) => {
                  setPolicyAcknowledged(val);
                  setPolicyError(null);
                  setErrorMessage(null);
                }}
                error={policyError}
                policySlug="careers-privacy"
                policyTitle="Applicant Privacy Notice"
                policyHref="/careers-privacy"
                showVersionBadge={true}
                policyVersion="1.0.0"
              />
            </div>

            {/* Dual Mandatory Checks: 2. Google reCAPTCHA v2 Checkbox */}
            <div className="flex justify-center pt-2">
              <GoogleRecaptchaWidget
                onVerify={(token) => {
                  setCaptchaToken(token);
                  setErrorMessage(null);
                }}
                onExpire={() => {
                  setCaptchaToken("");
                  setErrorMessage("Human verification expired. Please tick the checkbox again.");
                }}
                onError={() => {
                  setCaptchaToken("");
                  setErrorMessage("Verification challenge error. Please try again.");
                }}
                resetTrigger={recaptchaResetCount}
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#04130E] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#10B981]/15 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application for {form.position}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#7E8997] text-center mt-3 font-light">
                Your candidate data is protected under the Digital Personal Data Protection (DPDP) Act 2023 and retained strictly for talent evaluation.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
