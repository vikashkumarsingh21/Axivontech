"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Lock, Mail, CheckCircle2, X } from "lucide-react";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";
import { LoginPosterCarousel } from "@/components/auth/LoginPosterCarousel";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";
import { parseApiResponse } from "@/lib/errors/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  // Form input states
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
  const [prefersReduced, setPrefersReduced] = useState(false);

  // DOM input references for Chrome Autofill synchronization and focus management
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check URL parameters for logout, expired session, or error notice safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logged_out") === "1" || params.get("logout") === "true") {
        setLoggedOutNotice(true);
      }
      if (params.get("expired") === "1" || params.get("session_expired") === "true") {
        setError("Session expired, please sign in again.");
      }
      if (params.get("error") === "account_suspended") {
        setError("Your partner account has been suspended. Please contact AXIVON administration (admin@axivontech.in) for assistance.");
      }
    }
  }, []);

  // Check prefers-reduced-motion safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReduced(mediaQuery.matches);
      const listener = (event: MediaQueryListEvent) => {
        setPrefersReduced(event.matches);
      };
      mediaQuery.addEventListener?.("change", listener);
      return () => mediaQuery.removeEventListener?.("change", listener);
    }
  }, []);

  // Synchronize Chrome password manager autofill on mount & focus
  useEffect(() => {
    const syncAutofillFromDom = () => {
      if (emailInputRef.current?.value && !email) {
        setEmail(emailInputRef.current.value);
      }
      if (passwordInputRef.current?.value && !password) {
        setPassword(passwordInputRef.current.value);
      }
    };

    const timer = setTimeout(syncAutofillFromDom, 300);
    window.addEventListener("focus", syncAutofillFromDom);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", syncAutofillFromDom);
    };
  }, [email, password]);

  // Rate limit countdown timer effect
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const interval = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError("");
          return 0;
        }
        const next = prev - 1;
        setError(`Too many attempts. Please try again in ${next} second${next === 1 ? "" : "s"}.`);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitCountdown]);

  // Helper to clear errors when a field is edited
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error && rateLimitCountdown === 0) setError("");
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error && rateLimitCountdown === 0) setError("");
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  // Auth form submit handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent double submission or submit during rate-limit cooldown
    if (loading || rateLimitCountdown > 0) {
      return;
    }

    if (error && rateLimitCountdown === 0) setError("");
    setFieldErrors({});

    // Pull values directly from DOM elements to ensure browser-autofilled credentials are captured
    const form = e.currentTarget;
    const emailEl = form.elements.namedItem("email") as HTMLInputElement | null;
    const passwordEl = form.elements.namedItem("password") as HTMLInputElement | null;

    const activeEmail = (emailEl?.value || emailInputRef.current?.value || email).trim();
    const activePassword = passwordEl?.value || passwordInputRef.current?.value || password;

    // Validate inputs client-side and set per-field errors under the respective inputs
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
      // Focus first erroneous field
      if (newFieldErrors.email) {
        emailInputRef.current?.focus();
      } else if (newFieldErrors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    // Validate security verification presence client-side before sending network request
    if (!captchaToken) {
      setError("Please confirm you are not a robot.");
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

      const parsed = await parseApiResponse<{ user: { role: string } }>(res);

      if (!parsed.ok) {
        // Failed attempt cleanup actions:
        // 1. Keep the email
        setEmail(activeEmail);
        if (emailInputRef.current) {
          emailInputRef.current.value = activeEmail;
        }

        // 2. Clear the password
        setPassword("");
        if (passwordInputRef.current) {
          passwordInputRef.current.value = "";
        }

        // 3. Reset the CAPTCHA widget
        setCaptchaToken("");
        setRecaptchaResetCount((prev) => prev + 1);

        // 4. Focus the password field
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 50);

        // Case 1: 429 Rate Limited with countdown
        if (parsed.status === 429) {
          const seconds = parsed.retryAfter && parsed.retryAfter > 0 ? parsed.retryAfter : 30;
          setRateLimitCountdown(seconds);
          setError(`Too many attempts. Please try again in ${seconds} second${seconds === 1 ? "" : "s"}.`);
          return;
        }

        // Case 2: 401 Wrong password / Unknown email (identical message to prevent user enumeration)
        if (parsed.status === 401) {
          setError("Incorrect email or password.");
          return;
        }

        // Case 3: Captcha failed or missing on server
        if (
          parsed.code === "MISSING_TOKEN" ||
          parsed.code === "CAPTCHA_REQUIRED" ||
          parsed.code === "CAPTCHA_FAILED" ||
          parsed.code === "INVALID_TOKEN" ||
          parsed.errorMessage?.toLowerCase().includes("robot") ||
          parsed.errorMessage?.toLowerCase().includes("verification")
        ) {
          setError("Please confirm you are not a robot.");
          return;
        }

        // Case 4: Field-level validation returned by server
        if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
          setFieldErrors({
            email: parsed.fieldErrors.email,
            password: parsed.fieldErrors.password,
          });
          if (parsed.errorMessage) {
            setError(parsed.errorMessage);
          }
          return;
        }

        // Case 5: 403 Suspended / Inactive account / Must change password
        if (parsed.status === 403) {
          setError(
            parsed.errorMessage ||
              "Your account is inactive or suspended. Please contact AXIVON administration (admin@axivontech.in)."
          );
          return;
        }

        // Case 6: 500+ Internal Server Error
        if (parsed.status >= 500) {
          setError("Could not reach the server. Check your connection and try again.");
          return;
        }

        // Case 7: Other failure cases (guaranteed never [object Object])
        setError(parsed.errorMessage || "Something went wrong. Please try again.");
        return;
      }

      // Success: route based on normalized primary role via centralized resolver
      router.push(resolveRoleDashboardUrl(parsed.data?.user?.role || "EMPLOYEE"));
    } catch {
      // Network failure / server offline
      setEmail(activeEmail);
      setPassword("");
      if (passwordInputRef.current) {
        passwordInputRef.current.value = "";
      }
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
      setCaptchaToken("");
      setRecaptchaResetCount((prev) => prev + 1);

      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Autofill animation detection handler
  const handleAutofillAnimation = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName.includes("autofill") || e.animationName.includes("AutoFill")) {
      const target = e.target as HTMLInputElement;
      if (target.name === "email" && target.value) {
        handleEmailChange(target.value);
      }
      if (target.name === "password" && target.value) {
        handlePasswordChange(target.value);
      }
    }
  };

  return (
    <div className="min-h-dvh bg-[#0B0D10] flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Left panel (40% desktop, full width mobile): Login form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-dvh bg-[#0B0D10] z-10 border-r border-[#1E2530] overflow-y-auto">
        {/* Top: Logo & AXIVON ONE Badge */}
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={160}
              height={44}
              className="h-8 sm:h-9 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <div className="mt-2.5">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              AXIVON ONE
            </span>
          </div>
        </div>

        {/* Center: Animated Login Form */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5 }}
          className="w-full max-w-[390px] mx-auto my-auto py-10"
        >
          {/* Welcome heading & subtext */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-[#F3F5F7] tracking-tight">
              Welcome back.
            </h1>
            <p className="text-sm text-[#A7B0BC] mt-2">
              Sign in to your secure workspace.
            </p>
          </motion.div>

          {/* Logged Out / Session Notice */}
          {loggedOutNotice && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-center justify-between gap-2.5 p-3.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 text-[13px] text-emerald-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>You have been safely signed out.</span>
              </div>
              <button
                type="button"
                onClick={() => setLoggedOutNotice(false)}
                className="text-emerald-400/70 hover:text-emerald-300 p-0.5"
                aria-label="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Accessible, Dismissible Central Error Box */}
          {error && (
            <motion.div
              role="alert"
              aria-live="assertive"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-start justify-between gap-2.5 p-3.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-[13px] text-red-400"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span className="leading-snug">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  if (rateLimitCountdown > 0) setRateLimitCountdown(0);
                }}
                className="text-red-400/70 hover:text-red-300 p-0.5 transition-colors shrink-0"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Semantic Form with Full Chrome Password Manager Support */}
          <form
            onSubmit={handleLogin}
            method="post"
            action="#"
            noValidate
            className="space-y-5"
          >
            {/* Work Email Field */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.2 }}
            >
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-[#A7B0BC] mb-2"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E8997] pointer-events-none" />
                <input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onInput={(e) => handleEmailChange((e.target as HTMLInputElement).value)}
                  onAnimationStart={handleAutofillAnimation}
                  placeholder="you@axivontech.in"
                  autoComplete="username"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#10151B] border ${
                    fieldErrors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-[#29313B] focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  } text-[16px] sm:text-[14px] text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:ring-1 transition-colors duration-150`}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.3 }}
            >
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-[#A7B0BC] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E8997] pointer-events-none" />
                <input
                  ref={passwordInputRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onInput={(e) => handlePasswordChange((e.target as HTMLInputElement).value)}
                  onAnimationStart={handleAutofillAnimation}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className={`w-full h-11 pl-10 pr-11 rounded-lg bg-[#10151B] border ${
                    fieldErrors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                      : "border-[#29313B] focus:border-emerald-500/50 focus:ring-emerald-500/30"
                  } text-[16px] sm:text-[14px] text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:ring-1 transition-colors duration-150`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7E8997] hover:text-[#A7B0BC] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </motion.div>

            {/* Honeypot trap input */}
            <input
              type="text"
              name="website_trap"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              style={{ display: "none" }}
            />

            {/* Google reCAPTCHA v2 Checkbox Verification */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.35 }}
              className="flex justify-center pt-1"
            >
              <GoogleRecaptchaWidget
                onVerify={(token) => {
                  setCaptchaToken(token);
                  if (error && error.includes("robot")) {
                    setError("");
                  }
                }}
                onExpire={() => {
                  setCaptchaToken("");
                  setError("Security verification expired. Please verify again.");
                }}
                onError={() => {
                  setCaptchaToken("");
                }}
                resetTrigger={recaptchaResetCount}
                theme="dark"
              />
            </motion.div>

            {/* Sign In Button with Double Submit Prevention & 429 Countdown */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading || rateLimitCountdown > 0}
                whileHover={prefersReduced || rateLimitCountdown > 0 ? undefined : { scale: 1.01 }}
                whileTap={prefersReduced || rateLimitCountdown > 0 ? undefined : { scale: 0.99 }}
                className="w-full h-11 mt-1 bg-emerald-500 text-[#04130E] font-semibold text-[14px] rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : rateLimitCountdown > 0 ? (
                  <span>Try again in {rateLimitCountdown}s</span>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#1E2530] flex items-center justify-between text-xs text-[#7E8997]">
          <Link
            href="/"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            ← Back to website
          </Link>
          <span className="text-[#566171]">
            © {new Date().getFullYear()} Axivon Technologies
          </span>
        </div>
      </div>

      {/* Right panel (60% desktop, hidden mobile): Isolated Animated Poster Carousel */}
      <LoginPosterCarousel />
    </div>
  );
}
