"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Loader2, Fingerprint } from "lucide-react";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";
import { parseApiResponse } from "@/lib/errors/client";
import { isBiometricsEnrolled, authenticateWithBiometrics, getEnrolledBiometricUser } from "@/lib/mobile/biometrics";
import { toast } from "@/lib/notifications/toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dedicated Application Login Screen (/app/login)
 * Modern Enterprise Light UI/UX designed specifically for mobile users.
 * Directly authenticated against existing user accounts, RBAC, and sessions.
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
  const [hasBiometrics, setHasBiometrics] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check biometric enrollment on mount
  useEffect(() => {
    if (isBiometricsEnrolled()) {
      setHasBiometrics(true);
      const enrolledUser = getEnrolledBiometricUser();
      if (enrolledUser && !email) {
        setEmail(enrolledUser);
      }
    }
  }, []);

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
      const resetSuccess = params.get("reset_success") === "1";

      if (isLoggedOut) {
        setLoggedOutNotice(true);
      }
      if (isExpired) {
        setError("Session expired. Please sign in again.");
      }
      if (isSuspended) {
        setError("Your account is currently inactive or suspended. Please contact administrator (admin@axivontech.in).");
      }
      if (resetSuccess) {
        toast.success("Password reset successfully. Please sign in with your new password.");
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
          .catch(() => {});
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
      newFieldErrors.email = "Please enter a valid email address.";
    }

    if (!activePassword) {
      newFieldErrors.password = "Please enter your password.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-axivon-app": "1",
        },
        body: JSON.stringify({
          email: activeEmail,
          password: activePassword,
          captchaToken: captchaToken || undefined,
        }),
      });

      const parsed = await parseApiResponse<{
        user?: { role?: string; mustChangePassword?: boolean };
        mustChangePassword?: boolean;
        retryAfter?: number;
      }>(response);

      if (!response.ok || !parsed.ok) {
        if (response.status === 429) {
          const waitTime = parsed.retryAfter || 30;
          setRateLimitCountdown(waitTime);
          setError(`Too many login attempts. Please wait ${waitTime} seconds before trying again.`);
        } else {
          setError(parsed.errorMessage || "Invalid email or password. Please try again.");
        }
        setRecaptchaResetCount((prev) => prev + 1);
        setCaptchaToken("");
        return;
      }

      const userRole = parsed.data?.user?.role || "EMPLOYEE";
      const mustChange = parsed.data?.user?.mustChangePassword || parsed.data?.mustChangePassword;

      if (mustChange) {
        router.push("/auth/change-password");
      } else {
        router.push(resolveRoleDashboardUrl(userRole));
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const verified = await authenticateWithBiometrics();
      if (verified) {
        const enrolledUser = getEnrolledBiometricUser();
        if (enrolledUser) {
          // Check if existing session is already active
          const sessionRes = await fetch("/api/v1/auth/session");
          if (sessionRes.ok) {
            const data = await sessionRes.json();
            if (data?.authenticated && data?.user?.role) {
              router.replace(resolveRoleDashboardUrl(data.user.role));
              return;
            }
          }
          toast.info("Biometric verified. Please enter password once to re-authenticate session.");
          if (passwordInputRef.current) {
            passwordInputRef.current.focus();
          }
        }
      }
    } catch {
      toast.error("Biometric authentication was cancelled or unavailable.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center px-4 py-8 sm:px-6 select-none">
      <div className="w-full max-w-sm mx-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={200}
            height={52}
            priority
            className="h-11 w-auto object-contain mb-2.5"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            <span>Enterprise Mobile Application</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)]">
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sign In to Your Workspace
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Enter your credentials to access your authorized portal.
            </p>
          </div>

          {/* Logged Out Notice Banner */}
          {loggedOutNotice && !error && (
            <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
              <span>You have been safely signed out.</span>
            </div>
          )}

          {/* Error Alert Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="app-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email / User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border ${
                    fieldErrors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-teal-600 focus:ring-teal-100"
                  } text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-3 transition-all`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="app-password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/app/forgot-password"
                  className="text-xs text-teal-700 hover:text-teal-800 transition-colors font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border ${
                    fieldErrors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-teal-600 focus:ring-teal-100"
                  } text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-3 transition-all`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Security Verification Widget */}
            <div className="pt-1 flex flex-col items-center">
              <GoogleRecaptchaWidget
                onVerify={(tok) => setCaptchaToken(tok)}
                onExpire={() => setCaptchaToken("")}
                theme="light"
                size="normal"
                resetTrigger={recaptchaResetCount}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || rateLimitCountdown > 0}
              className="w-full min-h-[44px] mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

            {/* Biometric Quick Login Button */}
            {hasBiometrics && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-teal-600/30 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Fingerprint className="w-4 h-4 text-teal-700" />
                <span>Quick Sign-In with Biometrics</span>
              </button>
            )}
          </form>

          {/* Security Assurance Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>256-Bit SSL Protected • Axivon Technologies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
