"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Lock, Mail, CheckCircle2, X } from "lucide-react";
import { GoogleRecaptchaWidget } from "@/components/ui/GoogleRecaptchaWidget";
import { LoginPosterCarousel } from "@/components/auth/LoginPosterCarousel";

export default function LoginPage() {
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [recaptchaResetCount, setRecaptchaResetCount] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // DOM input references for Chrome Autofill synchronization
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check URL parameters for logout notice safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logged_out") === "1" || params.get("logout") === "true") {
        setLoggedOutNotice(true);
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

  // Auth form submit handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Pull values directly from DOM elements to ensure browser-autofilled credentials are captured
    const form = e.currentTarget;
    const emailEl = form.elements.namedItem("email") as HTMLInputElement | null;
    const passwordEl = form.elements.namedItem("password") as HTMLInputElement | null;

    const activeEmail = (emailEl?.value || emailInputRef.current?.value || email).trim();
    const activePassword = passwordEl?.value || passwordInputRef.current?.value || password;

    if (!activeEmail || !activePassword) {
      setError("Please enter your work email and password.");
      return;
    }

    // Validate security verification presence client-side before sending network request
    if (!captchaToken) {
      setError("Please complete the security verification before signing in.");
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

      const data = await res.json();

      if (!res.ok) {
        setCaptchaToken("");
        setRecaptchaResetCount((prev) => prev + 1);
        throw new Error(data.error || "Login failed");
      }

      // Success, route based on user primary role
      const userRole = data.user.role;
      if (userRole === "FOUNDER" || userRole === "CO_FOUNDER") {
        router.push("/executive/dashboard");
      } else if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (userRole === "BROKER" || userRole === "BUSINESS_PARTNER") {
        router.push("/broker/dashboard");
      } else if (userRole === "CLIENT") {
        router.push("/client/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      setCaptchaToken("");
      setRecaptchaResetCount((prev) => prev + 1);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Autofill animation detection handler
  const handleAutofillAnimation = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName.includes("autofill") || e.animationName.includes("AutoFill")) {
      const target = e.target as HTMLInputElement;
      if (target.name === "email" && target.value) {
        setEmail(target.value);
      }
      if (target.name === "password" && target.value) {
        setPassword(target.value);
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

          {/* Logged Out Success Notice */}
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

          {/* Error Message Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-[13px] text-red-400"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Semantic Form with Full Chrome Password Manager Support */}
          <form
            onSubmit={handleLogin}
            method="post"
            action="#"
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
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                  onAnimationStart={handleAutofillAnimation}
                  placeholder="you@axivontech.in"
                  autoComplete="username"
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#10151B] border border-[#29313B] text-[16px] sm:text-[14px] text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors duration-150"
                />
              </div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                  onAnimationStart={handleAutofillAnimation}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-lg bg-[#10151B] border border-[#29313B] text-[16px] sm:text-[14px] text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors duration-150"
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
                  setError("");
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

            {/* Sign In Button */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.4, delay: prefersReduced ? 0 : 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={prefersReduced ? undefined : { scale: 1.01 }}
                whileTap={prefersReduced ? undefined : { scale: 0.99 }}
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
