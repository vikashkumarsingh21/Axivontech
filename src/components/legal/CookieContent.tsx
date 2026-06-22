"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SectionData {
  id: string;
  title: string;
  content: ReactNode;
  tag?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    id: "what-are-cookies",
    label: "What Are Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="5" cy="6" r="1" fill="currentColor" />
        <circle cx="9" cy="5" r="0.75" fill="currentColor" />
        <circle cx="8" cy="9" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "types-of-cookies",
    label: "Types of Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "analytics-cookies",
    label: "Analytics Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <polyline points="1.5,11 4.5,7 7,9 10,4.5 12.5,3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "performance-cookies",
    label: "Performance Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2M3.4 3.4l1.4 1.4M9.2 9.2l1.4 1.4M3.4 10.6l1.4-1.4M9.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "functional-cookies",
    label: "Functional Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <path d="M2 4.5h10M2 7h7M2 9.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "managing-cookies",
    label: "Managing Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <path d="M2 3.5h10M5 7h7M2 7h1M2 10.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="4" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "third-party-cookies",
    label: "Third-Party Cookies",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="11" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="11" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.5 6.5L9.5 4M4.5 7.5L9.5 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "contact-information",
    label: "Contact Information",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
        <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1.5 5l5.5 3.5L12.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Utility: tag pill ─────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Essential: {
    bg: "rgba(37,99,235,0.10)",
    border: "rgba(37,99,235,0.28)",
    text: "#60A5FA",
  },
  Analytics: {
    bg: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.25)",
    text: "#00D4FF",
  },
  Performance: {
    bg: "rgba(124,58,237,0.10)",
    border: "rgba(124,58,237,0.28)",
    text: "#A78BFA",
  },
  Functional: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.22)",
    text: "#34D399",
  },
  Control: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    text: "#FCD34D",
  },
  "Third-Party": {
    bg: "rgba(239,68,68,0.07)",
    border: "rgba(239,68,68,0.20)",
    text: "#FCA5A5",
  },
  Contact: {
    bg: "rgba(37,99,235,0.10)",
    border: "rgba(37,99,235,0.28)",
    text: "#60A5FA",
  },
};

function TagPill({ label }: { label: string }) {
  const colors = TAG_COLORS[label] ?? TAG_COLORS["Essential"];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      {label}
    </span>
  );
}

// ─── Cookie type cards ─────────────────────────────────────────────────────────
interface CookieTypeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  tag: string;
}

function CookieTypeCard({ icon, title, description, tag }: CookieTypeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.012 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex flex-col gap-3 rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.2)",
            color: "#60A5FA",
          }}
        >
          {icon}
        </div>
        <TagPill label={tag} />
      </div>
      <div>
        <p
          className="mb-1 text-sm font-semibold"
          style={{ color: "rgba(226,232,240,0.92)" }}
        >
          {title}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.72)" }}>
          {description}
        </p>
      </div>
      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.3)",
        }}
      />
    </motion.div>
  );
}

// ─── Section content definitions ───────────────────────────────────────────────
const SECTIONS: SectionData[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies",
    tag: "Essential",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          Cookies are small text files stored on your device that help websites function
          properly, improve performance, and enhance user experience. They are created
          when your browser loads a website and are stored on your computer or device.
        </p>
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{
            background: "rgba(37,99,235,0.06)",
            border: "1px solid rgba(37,99,235,0.15)",
          }}
        >
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(37,99,235,0.2)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden={true}>
              <path d="M2 5l2.5 2.5L8 3" stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.7)" }}>
            Cookies set by Axivon Technologies are called first-party cookies. Cookies set
            by third-party services are called third-party cookies. Both types are described
            in this policy.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "types-of-cookies",
    title: "Types of Cookies",
    tag: "Essential",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          Axivon Technologies may use different categories of cookies to ensure website
          functionality, improve performance, and deliver a better user experience. Below
          is an overview of each type we may deploy.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
                  <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M10 1.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              title: "Essential Cookies",
              description: "Required for core website functionality and cannot be disabled.",
              tag: "Essential",
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
                  <polyline points="1.5,11 4.5,7 7,9 10,4.5 12.5,3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              title: "Analytics Cookies",
              description: "Track how visitors interact with the website to improve content.",
              tag: "Analytics",
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
                  <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              ),
              title: "Performance Cookies",
              description: "Help improve speed, reliability, and overall site performance.",
              tag: "Performance",
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
                  <path d="M2 4.5h10M2 7h7M2 9.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              ),
              title: "Functional Cookies",
              description: "Remember preferences to personalize your browsing experience.",
              tag: "Functional",
            },
          ].map((card) => (
            <CookieTypeCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "analytics-cookies",
    title: "Analytics Cookies",
    tag: "Analytics",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          Analytics cookies help us understand website traffic, visitor behavior, and overall
          website performance. These insights enable us to continually improve the structure,
          content, and functionality of axivontech.in.
        </p>
        <div className="space-y-2.5">
          {[
            { label: "Tool", value: "Google Analytics (GA4)" },
            { label: "Data Collected", value: "Page views, session duration, bounce rate, referral sources" },
            { label: "Retention", value: "Up to 14 months" },
            { label: "Purpose", value: "Improve content strategy and site architecture" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-lg px-4 py-3"
              style={{
                background: "rgba(0,212,255,0.04)",
                border: "1px solid rgba(0,212,255,0.1)",
              }}
            >
              <span
                className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(0,212,255,0.6)" }}
              >
                {label}
              </span>
              <span className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.78)" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "performance-cookies",
    title: "Performance Cookies",
    tag: "Performance",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          Performance cookies help improve website speed, reliability, and overall user
          experience by monitoring website functionality. They collect anonymous data
          about how users interact with our website and help us identify areas for
          technical improvement.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { metric: "Load Time", desc: "Monitors page load performance across regions" },
            { metric: "Uptime", desc: "Tracks availability and infrastructure stability" },
            { metric: "Errors", desc: "Captures JavaScript errors and broken resources" },
          ].map(({ metric, desc }) => (
            <div
              key={metric}
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(124,58,237,0.06)",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            >
              <p className="mb-1 text-sm font-bold" style={{ color: "#A78BFA" }}>
                {metric}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "functional-cookies",
    title: "Functional Cookies",
    tag: "Functional",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          Functional cookies remember user preferences and settings to provide a more
          personalized browsing experience. These cookies allow us to remember choices
          you make so we can provide enhanced, more personal features.
        </p>
        <div className="space-y-2">
          {[
            "Language and region preferences",
            "Theme and display preferences",
            "Previously visited pages and interactions",
            "Form auto-fill data to reduce repetitive input",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden={true}>
                  <path d="M1.5 4L3 5.5L6.5 2.5" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs" style={{ color: "rgba(148,163,184,0.78)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "managing-cookies",
    title: "Managing Cookies",
    tag: "Control",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          You have control over the cookies stored on your device. You can choose to
          accept or decline cookies through your browser settings. Note that disabling
          certain cookies may affect website functionality.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { browser: "Google Chrome", path: "Settings → Privacy and security → Cookies" },
            { browser: "Mozilla Firefox", path: "Options → Privacy & Security → Cookies" },
            { browser: "Apple Safari", path: "Preferences → Privacy → Cookies" },
            { browser: "Microsoft Edge", path: "Settings → Privacy → Cookies and site data" },
          ].map(({ browser, path }) => (
            <div
              key={browser}
              className="group rounded-lg px-3.5 py-3"
              style={{
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.12)",
              }}
            >
              <p className="mb-0.5 text-[11px] font-semibold" style={{ color: "#FCD34D" }}>
                {browser}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>
                {path}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
          You may also opt out of analytics tracking via{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-[#60A5FA]"
            style={{ color: "rgba(96,165,250,0.75)" }}
          >
            Google Analytics Opt-Out
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    tag: "Third-Party",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          Third-party service providers may place cookies on your device to support website
          operations, analytics, and reporting. These cookies are governed by the respective
          providers' privacy policies.
        </p>
        <div className="space-y-2.5">
          {[
            {
              name: "Google Analytics",
              purpose: "Website traffic analysis and behavior reporting",
              link: "https://policies.google.com/privacy",
            },
            {
              name: "Cloudflare",
              purpose: "Security, DDoS protection, and performance optimization",
              link: "https://www.cloudflare.com/privacypolicy/",
            },
            {
              name: "Vercel",
              purpose: "Hosting infrastructure and edge performance",
              link: "https://vercel.com/legal/privacy-policy",
            },
          ].map(({ name, purpose, link }) => (
            <div
              key={name}
              className="flex items-start justify-between gap-3 rounded-xl px-4 py-3.5"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.12)",
              }}
            >
              <div>
                <p className="mb-0.5 text-sm font-semibold" style={{ color: "rgba(226,232,240,0.88)" }}>
                  {name}
                </p>
                <p className="text-xs" style={{ color: "rgba(148,163,184,0.65)" }}>
                  {purpose}
                </p>
              </div>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} privacy policy (opens in new tab)`}
                className="shrink-0 rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors hover:bg-white/5"
                style={{ color: "rgba(96,165,250,0.7)", border: "1px solid rgba(96,165,250,0.2)" }}
              >
                Policy ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "contact-information",
    title: "Contact Information",
    tag: "Contact",
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-7" style={{ color: "rgba(148,163,184,0.78)" }}>
          If you have questions or concerns about how Axivon Technologies uses cookies,
          please reach out through any of the channels below. We are committed to
          transparency and responding to your inquiries promptly.
        </p>
        <div
          className="space-y-3 rounded-xl p-5"
          style={{
            background: "rgba(37,99,235,0.05)",
            border: "1px solid rgba(37,99,235,0.14)",
          }}
        >
          {[
            {
              icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden={true}>
                  <rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M1 4.5l5.5 3.5L12 4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              ),
              label: "Email",
              value: "info@axivontech.in",
              href: "mailto:info@axivontech.in",
            },
            {
              icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden={true}>
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M6.5 1.5C6.5 1.5 4.5 4 4.5 6.5S6.5 11.5 6.5 11.5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M6.5 1.5C6.5 1.5 8.5 4 8.5 6.5S6.5 11.5 6.5 11.5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M1.5 6.5h10" stroke="currentColor" strokeWidth="1.1" />
                </svg>
              ),
              label: "Website",
              value: "axivontech.in",
              href: "https://axivontech.in",
            },
            {
              icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden={true}>
                  <rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M4.5 6.5h4M6.5 4.5v4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              ),
              label: "Company",
              value: "Axivon Technologies",
              href: undefined,
            },
          ].map(({ icon, label, value, href }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}
              >
                {icon}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="text-sm font-medium transition-colors hover:text-[#60A5FA]"
                    style={{ color: "rgba(226,232,240,0.88)" }}
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "rgba(226,232,240,0.88)" }}>
                    {value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ─── Ambient background ────────────────────────────────────────────────────────
function AmbientBackground() {
  const prefersReduced = useReducedMotion();
  return (
    <div aria-hidden={true} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#050816" }} />
      {/* Soft aurora — top-left */}
      <motion.div
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(37,99,235,0.10) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={prefersReduced ? {} : { x: [0, 20, 0], y: [0, -16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Soft aurora — bottom-right */}
      <motion.div
        className="absolute -bottom-32 -right-32 h-[440px] w-[440px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
        animate={prefersReduced ? {} : { x: [0, -16, 0], y: [0, 14, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.022]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cc-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cc-grid)" />
        </svg>
      </div>
    </div>
  );
}

// ─── Sidebar Navigation ────────────────────────────────────────────────────────
interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

function Sidebar({ activeId, onNavigate }: SidebarProps) {
  return (
    <nav
      aria-label="Cookie Policy sections"
      className="sticky top-24 hidden lg:block"
    >
      <div
        className="w-56 rounded-2xl p-2"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          className="mb-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.14)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(96,165,250,0.7)" }}>
            On This Page
          </p>
        </div>

        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id} role="listitem">
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-200"
                  style={{
                    background: isActive
                      ? "rgba(37,99,235,0.12)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(37,99,235,0.2)"
                      : "1px solid transparent",
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ background: "#2563EB" }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}

                  <span
                    className="shrink-0 transition-colors duration-200"
                    style={{
                      color: isActive
                        ? "#60A5FA"
                        : "rgba(148,163,184,0.45)",
                    }}
                  >
                    {item.icon}
                  </span>

                  <span
                    className="text-[11.5px] font-medium leading-tight transition-colors duration-200"
                    style={{
                      color: isActive
                        ? "rgba(226,232,240,0.95)"
                        : "rgba(148,163,184,0.6)",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer stamp */}
        <div
          className="mt-2 rounded-xl px-3 py-2.5 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[9px] font-medium uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.3)" }}>
            Axivon Technologies
          </p>
          <p className="text-[9px]" style={{ color: "rgba(148,163,184,0.22)" }}>
            Cookie Policy v2.0
          </p>
        </div>
      </div>
    </nav>
  );
}

// ─── Content Card ──────────────────────────────────────────────────────────────
interface ContentCardProps {
  section: SectionData;
  index: number;
}

function ContentCard({ section, index }: ContentCardProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.article
      ref={ref}
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      initial={prefersReduced ? {} : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.04, 0.2),
      }}
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
      whileHover={
        prefersReduced
          ? {}
          : {
              y: -1,
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
            }
      }
      
    >
      {/* Top gradient accent line */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.4) 30%, rgba(0,212,255,0.5) 50%, rgba(124,58,237,0.4) 70%, transparent 100%)",
          opacity: 0,
          transition: "opacity 0.3s",
        }}
        aria-hidden={true}
        ref={(el) => {
          if (el) {
            const parent = el.parentElement;
            parent?.addEventListener("mouseenter", () => (el.style.opacity = "1"));
            parent?.addEventListener("mouseleave", () => (el.style.opacity = "0"));
          }
        }}
      />

      {/* Card header */}
      <div
        className="flex items-start justify-between gap-3 px-6 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="text-[11px] font-medium tabular-nums"
              style={{ color: "rgba(148,163,184,0.3)" }}
              aria-hidden={true}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {section.tag && <TagPill label={section.tag} />}
          </div>
          <h2
            id={`${section.id}-heading`}
            className="text-base font-bold leading-tight tracking-[-0.01em]"
            style={{ color: "rgba(226,232,240,0.95)" }}
          >
            {section.title}
          </h2>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-5">{section.content}</div>
    </motion.article>
  );
}

// ─── Mobile Nav Drawer ────────────────────────────────────────────────────────
interface MobileNavProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

function MobileNav({ activeId, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const activeLabel = NAV_ITEMS.find((n) => n.id === activeId)?.label ?? "Sections";

  return (
    <div className="relative mb-6 lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Jump to section"
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <span className="text-sm font-medium" style={{ color: "rgba(226,232,240,0.8)" }}>
          {activeLabel}
        </span>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden={true}
        >
          <path d="M3 5l4 4 4-4" stroke="rgba(148,163,184,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl"
          role="listbox"
          aria-label="Cookie Policy sections"
          style={{
            background: "rgba(10,14,35,0.96)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              role="option"
              aria-selected={activeId === item.id}
              onClick={() => {
                onNavigate(item.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <span style={{ color: activeId === item.id ? "#60A5FA" : "rgba(148,163,184,0.45)" }}>
                {item.icon}
              </span>
              <span
                className="text-sm"
                style={{ color: activeId === item.id ? "rgba(226,232,240,0.95)" : "rgba(148,163,184,0.65)" }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CookieContent() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prefersReduced = useReducedMotion();

  // Intersection Observer — track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
  }, [prefersReduced]);

  return (
    <>
      <AmbientBackground />

      <main
        className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"
        aria-label="Cookie Policy content"
      >
        {/* Mobile section nav */}
        <MobileNav activeId={activeId} onNavigate={handleNavigate} />

        <div className="flex gap-10 lg:gap-14">
          {/* Sidebar */}
          <aside aria-label="Cookie Policy navigation">
            <Sidebar activeId={activeId} onNavigate={handleNavigate} />
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-5">
            {SECTIONS.map((section, i) => (
              <ContentCard key={section.id} section={section} index={i} />
            ))}

            {/* Footer note */}
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl px-6 py-5 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
                This Cookie Policy was last updated in{" "}
                <span style={{ color: "rgba(148,163,184,0.6)" }}>June 2025</span>
                {" "}and applies to{" "}
                <a
                  href="https://axivontech.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-[#60A5FA]"
                  style={{ color: "rgba(96,165,250,0.5)" }}
                >
                  axivontech.in
                </a>
                . Axivon Technologies reserves the right to update this policy at any time.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}