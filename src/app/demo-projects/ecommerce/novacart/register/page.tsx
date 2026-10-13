"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Info, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function NovaCartRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoSuccess, setDemoSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password should be at least 8 characters long for client security standards.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please recheck your confirmation.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the illustrative demo terms to proceed.");
      return;
    }

    // Success in local client validation
    setDemoSuccess(true);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/demo-projects/ecommerce/novacart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#696D66] hover:text-[#1C1D1A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Storefront</span>
        </Link>

        {/* Card Form */}
        <div className="mt-6 rounded-2xl border border-[#DCDDD5] bg-white p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xs bg-[#1C1D1A] text-sm font-bold text-[#D8F16A]">
              N
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1C1D1A]">
              Create Demo Account
            </h1>
            <p className="mt-1 text-xs text-[#696D66]">
              Experience NovaCart customer onboarding UI (Frontend Demo)
            </p>
          </div>

          {/* Honest Demo Notice Banner */}
          <div className="mt-6 rounded-lg bg-[#E8EBE3] p-3.5 text-xs text-[#1C1D1A]">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#1C1D1A]" />
              <div className="space-y-1">
                <p className="font-bold">Frontend Demonstration Notice</p>
                <p className="text-[#696D66] leading-relaxed">
                  No account database is connected. Personal information and passwords will NOT be saved to any server or browser storage.
                </p>
              </div>
            </div>
          </div>

          {demoSuccess ? (
            /* Successful client validation demonstration */
            <div className="mt-6 rounded-xl border border-[#1C1D1A] bg-[#F7F7F2] p-5 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#1C1D1A]" />
              <h2 className="mt-3 text-base font-bold text-[#1C1D1A]">
                Validation Completed
              </h2>
              <p className="mt-1 text-xs text-[#696D66] leading-relaxed">
                Thank you, <strong>{fullName}</strong>. All field validations passed. As this is an unbacked frontend demo, you can now explore the sample customer account view.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/demo-projects/ecommerce/novacart/account"
                  className="rounded-md bg-[#1C1D1A] py-2.5 text-xs font-bold text-[#D8F16A]"
                >
                  View Sample Account Dashboard
                </Link>
                <Link
                  href="/demo-projects/ecommerce/novacart/shop"
                  className="rounded-md border border-[#DCDDD5] bg-white py-2 text-xs font-semibold text-[#1C1D1A] hover:bg-[#E8EBE3]"
                >
                  Browse Store Catalogue
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-bold text-[#1C1D1A]"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="mt-1.5 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2.5 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-bold text-[#1C1D1A]"
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="mt-1.5 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2.5 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="reg-pass"
                    className="block text-xs font-bold text-[#1C1D1A]"
                  >
                    Create Password
                  </label>
                  <span className="text-[11px] text-[#696D66]">(min. 8 characters)</span>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="reg-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2.5 pr-10 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#696D66] hover:text-[#1C1D1A]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reg-pass-confirm"
                  className="block text-xs font-bold text-[#1C1D1A]"
                >
                  Confirm Password
                </label>
                <input
                  id="reg-pass-confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] px-3.5 py-2.5 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-[#696D66] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-[#DCDDD5] text-[#1C1D1A] focus:ring-[#1C1D1A]"
                  />
                  <span>
                    I understand this is a sample e-commerce demonstration created by Axivon Technologies with no real account creation.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-[#1C1D1A] py-3 text-xs font-bold text-[#D8F16A] shadow-xs hover:bg-[#343630] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              >
                Create Account (Demo Validation)
              </button>
            </form>
          )}

          {/* Links */}
          <div className="mt-6 border-t border-[#DCDDD5] pt-4 text-center text-xs text-[#696D66]">
            <span>Already have an account? </span>
            <Link
              href="/demo-projects/ecommerce/novacart/login"
              className="font-bold text-[#1C1D1A] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
