"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";
import { parseApiResponse } from "@/lib/errors/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dedicated Application Login Screen (/app/login)
 * Strictly isolated for the mobile business application.
 * Connects directly to the existing unified authentication backend.
 */
export default function AppLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [recaptchaResetCount, setRecaptchaResetCount] = useState(0);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Rate-limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  // Check URL parameters and automatically restore valid active session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isLoggedOut = params.get("logged_out") === "1" || params.get("logout") === "true";
      const isExpired = params.get("expired") === "1" || params.get("session_expired") === "true";
      const isSuspended = params.get("error") === "account_suspended";

      if (isLoggedOut) {
        setLoggedOutNotice(true);
      }
      if (isExpired) {
        setError("Session expired. Please sign in again.");
      }
      if (isSuspended) {
        setError("Your account is currently inactive or suspended. Please contact administrator (admin@axivontech.in).");
      }

      // Check if session is already active and valid
      if (!isLoggedOut && !isExpired && !isSuspended) {
        fetch("/api/v1/auth/session")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.authenticated && data?.user?.role) {
              const target = data.mustChangePassword
                ? "/auth/change-password"
                : resolveRoleDashboardUrl(data.user.role);
              router.replace(target);
            }
          })
          .catch(() => {
            // Unauthenticated, stay on login page
          });
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || rateLimitCountdown > 0) return;
    if (error && rateLimitCountdown === 0) setError("");
    setFieldErrors({});

    const activeEmail = (emailInputRef.current?.value || email).trim();
    const activePassword = passwordInputRef.current?.value || password;

    const newFieldErrors: { email?: string; password?: string } = {};
    if (!activeEmail) {
      newFieldErrors.email = "Please enter your work email.";
    } else if (!EMAIL_REGEX.test(activeEmail)) {
      newFieldErrors.email = "Please enter a valid work email address.";
    }

    if (!activePassword) {
      newFieldErrors.password = "Please enter your password.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      if (newFieldErrors.email) emailInputRef.current?.focus();
      else if (newFieldErrors.password) passwordInputRef.current?.focus();
      return;
    }

    if (!captchaToken) {
      setError("Please complete the security verification below.");
      setRecaptchaResetCount((prev) => prev + 1);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: activeEmail,
          password: activePassword,
          recaptchaToken: captchaToken,
          captchaToken,
        }),
      });

      const parsed = await parseApiResponse<{ user: { role: string; mustChangePassword?: boolean } }>(res);

      if (!parsed.ok) {
        setEmail(activeEmail);
        setPassword("");
        if (passwordInputRef.current) passwordInputRef.current.value = "";
        setCaptchaToken("");
        setRecaptchaResetCount((prev) => prev + 1);

        if (parsed.status === 429) {
          const seconds = parsed.retryAfter && parsed.retryAfter > 0 ? parsed.retryAfter : 30;
          setRateLimitCountdown(seconds);
          setError(`Too many attempts. Please try again in ${seconds}s.`);
          return;
        }

        if (parsed.status === 401) {
          setError("Incorrect email or password.");
          return;
        }

        if (parsed.status === 403) {
          setError(parsed.errorMessage || "Account is inactive or suspended. Contact administration.");
          return;
        }

        setError(parsed.errorMessage || "Authentication failed. Please verify credentials.");
        return;
      }

      // Successful authentication
      const responseData = parsed.data as any;
      const userRole = responseData?.user?.role || "EMPLOYEE";
      const mustChange = responseData?.mustChangePassword || responseData?.user?.mustChangePassword;

      if (mustChange) {
        router.push("/auth/change-password");
      } else {
        router.push(resolveRoleDashboardUrl(userRole));
      }
    } catch {
      setError("Network connection issue. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Official Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={220}
            height={60}
            priority
            className="h-10 sm:h-12 w-auto brightness-0 invert object-contain"
          />
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Business Application</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#12161D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sign In to Your Portal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              Access your authorized executive, employee, broker, or client workspace.
            </p>
          </div>

          {/* Logged Out Notice Banner */}
          {loggedOutNotice && !error && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>You have been safely signed out.</span>
            </div>
          )}

          {/* Error Alert Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="app-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
                Work Email / User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="app-email"
                  ref={emailInputRef}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@axivontech.in"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border ${
                    fieldErrors.email ? "border-red-500/80 focus:border-red-500" : "border-white/10 focus:border-emerald-500"
                  } text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="app-password" className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="app-password"
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border ${
                    fieldErrors.password ? "border-red-500/80 focus:border-red-500" : "border-white/10 focus:border-emerald-500"
                  } text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Security Verification Widget */}
            <div className="pt-1 flex flex-col items-center">
              <GoogleRecaptchaWidget
                onVerify={(tok) => setCaptchaToken(tok)}
                onExpire={() => setCaptchaToken("")}
                theme="dark"
                size="normal"
                resetTrigger={recaptchaResetCount}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || rateLimitCountdown > 0}
              className="w-full min-h-[46px] mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#04130E] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : rateLimitCountdown > 0 ? (
                <span>Cooldown active ({rateLimitCountdown}s)</span>
              ) : (
                <span>Sign In to Workspace</span>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Session • Role-Authorized Access Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
