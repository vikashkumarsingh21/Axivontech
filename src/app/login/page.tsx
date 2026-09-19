"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success, route based on user role
      const userRole = data.user.role;
      if (userRole === "FOUNDER" || userRole === "CO_FOUNDER") {
        router.push("/executive/dashboard");
      } else if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Brand Panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative flex-col justify-between p-12 xl:p-16 bg-[#0e0e0e] border-r border-white/[0.04]">
        {/* Top: Logo */}
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={180}
              height={48}
              className="h-9 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
        </div>

        {/* Center: Welcome messaging */}
        <div className="max-w-md">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#e8a064]/70 mb-5">
            Employee Portal
          </p>
          <h1 className="text-[2.75rem] xl:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
            Welcome<br />back.
          </h1>
          <p className="text-[15px] text-gray-400 leading-relaxed max-w-sm">
            Access your Axivon employee workspace — attendance, tasks, reports, and team collaboration.
          </p>
        </div>

        {/* Bottom: Security note */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Secured connection · Session managed by Axivon Technologies</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        {/* Mobile Logo — visible only on small screens */}
        <div className="lg:hidden mb-10 text-center">
          <Link href="/">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={160}
              height={44}
              className="h-8 w-auto brightness-0 invert opacity-90 mx-auto"
              priority
            />
          </Link>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#e8a064]/60 mt-4">
            Employee Portal
          </p>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Enter your credentials to continue.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/[0.07] border border-red-500/15 text-[13px] text-red-400/90">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                className="block text-[13px] font-medium text-gray-300 mb-2"
                htmlFor="email"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#e8a064]/40 focus:ring-1 focus:ring-[#e8a064]/30 transition-colors duration-150"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-[13px] font-medium text-gray-300"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-11 px-3.5 pr-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#e8a064]/40 focus:ring-1 focus:ring-[#e8a064]/30 transition-colors duration-150"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-[#e8a064] text-[#1a1a1a] font-semibold text-[14px] rounded-lg hover:bg-[#f0b07a] active:bg-[#c47a3a] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#e8a064]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
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
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between text-xs text-gray-600">
            <Link
              href="/"
              className="hover:text-gray-400 transition-colors"
            >
              ← Back to website
            </Link>
            <span className="text-gray-700">
              © {new Date().getFullYear()} Axivon Technologies
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
