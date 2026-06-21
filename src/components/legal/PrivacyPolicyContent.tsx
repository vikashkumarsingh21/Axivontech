"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  AnimatePresence,
} from "framer-motion";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  index: number;
}

// ─────────────────────────────────────────────
// Navigation config
// ─────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: "introduction", label: "Introduction", icon: <IntroIcon /> },
  { id: "information-we-collect", label: "Information We Collect", icon: <CollectIcon /> },
  { id: "how-we-use-information", label: "How We Use Information", icon: <UseIcon /> },
  { id: "cookies-tracking", label: "Cookies & Tracking", icon: <CookieIcon /> },
  { id: "data-security", label: "Data Security", icon: <ShieldIcon /> },
  { id: "third-party-services", label: "Third Party Services", icon: <ThirdPartyIcon /> },
  { id: "user-rights", label: "User Rights", icon: <RightsIcon /> },
  { id: "contact-information", label: "Contact Information", icon: <ContactIcon /> },
];

// ─────────────────────────────────────────────
// Scroll utility
// ─────────────────────────────────────────────
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 96;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────
function PolicySection({ id, title, children, index }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
      className="group relative rounded-2xl p-7 sm:p-9"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.032) 0%, rgba(255,255,255,0.016) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
        transform: "translateZ(0)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.36), 0 0 0 1px rgba(37,99,235,0.14), inset 0 1px 0 rgba(255,255,255,0.07)",
              y: -2,
              transition: { duration: 0.22 },
            }
      }
      aria-labelledby={`${id}-title`}
    >
      {/* Section index badge */}
      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold"
          style={{
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.22)",
            color: "#93C5FD",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgba(37,99,235,0.25), transparent)",
          }}
        />
      </div>

      {/* Title */}
      <h2
        id={`${id}-title`}
        className="mb-4 text-xl font-semibold sm:text-2xl"
        style={{
          color: "#F1F5F9",
          letterSpacing: "-0.015em",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h2>

      {/* Content */}
      <div
        className="space-y-4 text-sm leading-relaxed sm:text-[15px]"
        style={{ color: "rgba(203,213,225,0.72)" }}
      >
        {children}
      </div>

      {/* Subtle corner accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 top-6 h-16 w-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Info row (used in multiple sections)
// ─────────────────────────────────────────────
function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.024)",
        border: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <span
        className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "#3B82F6", marginTop: "6px" }}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Highlight chip
// ─────────────────────────────────────────────
function Chip({
  color,
  children,
}: {
  color: "blue" | "purple" | "cyan";
  children: React.ReactNode;
}) {
  const colors = {
    blue: {
      bg: "rgba(37,99,235,0.09)",
      border: "rgba(37,99,235,0.2)",
      text: "#93C5FD",
    },
    purple: {
      bg: "rgba(124,58,237,0.09)",
      border: "rgba(124,58,237,0.2)",
      text: "#C4B5FD",
    },
    cyan: {
      bg: "rgba(0,212,255,0.07)",
      border: "rgba(0,212,255,0.18)",
      text: "#67E8F9",
    },
  };
  const c = colors[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function PrivacyPolicyContent() {
  const [activeId, setActiveId] = useState<string>("introduction");
  const prefersReducedMotion = useReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer for active nav tracking
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id);
      }
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#050816" }}
      aria-label="Privacy Policy Content"
    >
      {/* ── Background layer: grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.038) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.038) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 100%)",
        }}
      />

      {/* ── Aurora accents ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            top: "5%",
            left: "-5%",
            width: "40%",
            height: "50%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)",
            filter: "blur(64px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "10%",
            right: "-4%",
            width: "38%",
            height: "45%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
            filter: "blur(64px)",
          }}
        />
      </div>

      {/* ── Layout shell ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-16">

          {/* ════════════════════════════════════
              LEFT — Sticky navigation sidebar
          ════════════════════════════════════ */}
          <aside
            className="shrink-0 lg:w-[248px] xl:w-[272px]"
            aria-label="Privacy policy sections"
          >
            <div className="sticky top-24">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Panel header */}
                <div
                  className="mb-2 rounded-2xl px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.018) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "rgba(148,163,184,0.55)" }}
                  >
                    Contents
                  </p>
                </div>

                {/* Nav items */}
                <nav
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.034) 0%, rgba(255,255,255,0.016) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <ul className="p-2" role="list">
                    {NAV_ITEMS.map((item, i) => {
                      const isActive = activeId === item.id;
                      return (
                        <li key={item.id}>
                          <motion.button
                            onClick={() => scrollToSection(item.id)}
                            className="group/nav relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left"
                            style={{
                              background: isActive
                                ? "rgba(37,99,235,0.1)"
                                : "transparent",
                              border: isActive
                                ? "1px solid rgba(37,99,235,0.2)"
                                : "1px solid transparent",
                              color: isActive ? "#93C5FD" : "rgba(148,163,184,0.7)",
                              transition:
                                "background 0.22s, border-color 0.22s, color 0.22s",
                              cursor: "pointer",
                            }}
                            whileHover={
                              prefersReducedMotion
                                ? {}
                                : { x: 2, transition: { duration: 0.18 } }
                            }
                            aria-current={isActive ? "true" : undefined}
                          >
                            {/* Active indicator bar */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.span
                                  layoutId="nav-indicator"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                                  style={{
                                    width: "3px",
                                    height: "60%",
                                    background:
                                      "linear-gradient(to bottom, #2563EB, #7C3AED)",
                                    boxShadow: "0 0 8px rgba(37,99,235,0.5)",
                                  }}
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  exit={{ scaleY: 0 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </AnimatePresence>

                            {/* Icon */}
                            <span
                              className="shrink-0"
                              style={{
                                color: isActive ? "#60A5FA" : "rgba(100,116,139,0.7)",
                                transition: "color 0.22s",
                              }}
                            >
                              {item.icon}
                            </span>

                            {/* Label */}
                            <span
                              className="text-[13px] font-medium leading-snug"
                              style={{ transition: "color 0.22s" }}
                            >
                              {item.label}
                            </span>

                            {/* Hover glow */}
                            <span
                              aria-hidden
                              className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/nav:opacity-100"
                              style={{
                                background:
                                  "radial-gradient(ellipse at left, rgba(37,99,235,0.06) 0%, transparent 70%)",
                              }}
                            />
                          </motion.button>

                          {/* Divider (skip last) */}
                          {i < NAV_ITEMS.length - 1 && (
                            <div
                              className="mx-4 my-0.5 h-px"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                              }}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Last updated note */}
                <div
                  className="mt-3 rounded-xl px-4 py-3 text-center"
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.055)",
                  }}
                >
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(100,116,139,0.65)" }}
                  >
                    Last updated
                    <span
                      className="ml-1 font-semibold"
                      style={{ color: "rgba(148,163,184,0.7)" }}
                    >
                      June 2025
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>
          </aside>

          {/* ════════════════════════════════════
              RIGHT — Content sections
          ════════════════════════════════════ */}
          <main
            className="min-w-0 flex-1 space-y-6"
            aria-label="Privacy policy sections"
          >
            {/* 1 · Introduction */}
            <PolicySection id="introduction" title="Introduction" index={0}>
              <p>
                Axivon Technologies values your privacy and is committed to
                protecting personal information collected through our website and
                services. This Privacy Policy explains how we collect, use,
                store, and share information about you when you engage with us.
              </p>
              <p>
                By accessing or using our services, you agree to the terms
                outlined in this policy. We encourage you to read this document
                in full. If you have questions, our team is always available at{" "}
                <a
                  href="mailto:info@axivontech.in"
                  className="font-medium underline underline-offset-2"
                  style={{ color: "#60A5FA" }}
                >
                  info@axivontech.in
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Chip color="blue">GDPR Aware</Chip>
                <Chip color="purple">Data Minimisation</Chip>
                <Chip color="cyan">Transparent Practices</Chip>
              </div>
            </PolicySection>

            {/* 2 · Information We Collect */}
            <PolicySection
              id="information-we-collect"
              title="Information We Collect"
              index={1}
            >
              <p>
                We collect information you provide directly as well as data
                generated through your use of our website and services. The
                categories of information we may collect include:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Full name",
                  "Email address",
                  "Phone number",
                  "Business information",
                  "Project requirements",
                  "Website usage data",
                ].map((item) => (
                  <InfoRow key={item}>{item}</InfoRow>
                ))}
              </div>
              <p>
                We do not collect sensitive personal information unless it is
                directly necessary for a project you have engaged us to deliver.
              </p>
            </PolicySection>

            {/* 3 · How We Use Information */}
            <PolicySection
              id="how-we-use-information"
              title="How We Use Information"
              index={2}
            >
              <p>
                Information we collect is used exclusively to operate and improve
                our business and to serve you better. Specific purposes include:
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Service Delivery",
                    desc: "Fulfilling project scopes and technical requirements.",
                  },
                  {
                    label: "Communication",
                    desc: "Responding to enquiries, proposals, and updates.",
                  },
                  {
                    label: "Project Management",
                    desc: "Coordinating tasks, timelines, and deliverables.",
                  },
                  {
                    label: "Website Improvements",
                    desc: "Analysing usage patterns to enhance performance.",
                  },
                  {
                    label: "Customer Support",
                    desc: "Resolving issues and providing technical assistance.",
                  },
                  {
                    label: "Marketing Communications",
                    desc: "Sending relevant updates (opt-out available at any time).",
                  },
                ].map(({ label, desc }) => (
                  <div
                    key={label}
                    className="flex gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.022)",
                      border: "1px solid rgba(255,255,255,0.052)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "#818CF8" }}
                    />
                    <div>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "#E2E8F0" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-[13px]"
                        style={{ color: "rgba(148,163,184,0.7)" }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </PolicySection>

            {/* 4 · Cookies & Tracking */}
            <PolicySection
              id="cookies-tracking"
              title="Cookies & Tracking"
              index={3}
            >
              <p>
                Our website uses cookies and similar tracking technologies to
                ensure the site functions correctly and to help us understand how
                visitors interact with our content.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    name: "Analytics Cookies",
                    desc: "Understand traffic sources and behaviour patterns.",
                    color: "blue" as const,
                  },
                  {
                    name: "Performance Cookies",
                    desc: "Monitor page speed and identify technical issues.",
                    color: "purple" as const,
                  },
                  {
                    name: "Functional Cookies",
                    desc: "Enable core website features and user preferences.",
                    color: "cyan" as const,
                  },
                ].map(({ name, desc, color }) => (
                  <div
                    key={name}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="mb-2">
                      <Chip color={color}>{name}</Chip>
                    </div>
                    <p
                      className="text-[12.5px] leading-relaxed"
                      style={{ color: "rgba(148,163,184,0.68)" }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
              <p>
                You can control cookie preferences through your browser settings.
                Disabling certain cookies may affect the functionality of the
                website.
              </p>
            </PolicySection>

            {/* 5 · Data Security */}
            <PolicySection
              id="data-security"
              title="Data Security"
              index={4}
            >
              <p>
                We implement industry-standard security practices to protect your
                personal data from unauthorised access, alteration, or
                disclosure.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  {
                    icon: "🔐",
                    title: "Encryption",
                    desc: "Data in transit protected via TLS/SSL.",
                  },
                  {
                    icon: "🏗️",
                    title: "Secure Infrastructure",
                    desc: "Hosted on enterprise-grade cloud platforms.",
                  },
                  {
                    icon: "🔑",
                    title: "Access Controls",
                    desc: "Role-based permissions; least-privilege model.",
                  },
                  {
                    icon: "📋",
                    title: "Best Practices",
                    desc: "Aligned with OWASP and ISO 27001 guidelines.",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{
                      background: "rgba(37,99,235,0.05)",
                      border: "1px solid rgba(37,99,235,0.12)",
                    }}
                  >
                    <span className="text-base" role="img" aria-hidden>
                      {icon}
                    </span>
                    <div>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "#BFDBFE" }}
                      >
                        {title}
                      </p>
                      <p
                        className="text-[12.5px]"
                        style={{ color: "rgba(148,163,184,0.65)" }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p>
                No method of transmission over the internet is 100% secure.
                While we strive to protect your data, we cannot guarantee
                absolute security.
              </p>
            </PolicySection>

            {/* 6 · Third Party Services */}
            <PolicySection
              id="third-party-services"
              title="Third Party Services"
              index={5}
            >
              <p>
                We work with carefully selected third-party providers to deliver
                our services. These providers may process data on our behalf
                under their respective privacy policies.
              </p>
              <div className="space-y-2">
                {[
                  {
                    name: "Google Analytics",
                    purpose: "Website traffic analysis and user behaviour insights.",
                    link: "https://policies.google.com/privacy",
                  },
                  {
                    name: "Email Services",
                    purpose: "Transactional and marketing email delivery.",
                    link: null,
                  },
                  {
                    name: "Cloud Infrastructure",
                    purpose:
                      "Scalable hosting, storage, and compute services.",
                    link: null,
                  },
                ].map(({ name, purpose, link }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                    style={{
                      background: "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(255,255,255,0.055)",
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "#E2E8F0" }}
                      >
                        {name}
                      </p>
                      <p
                        className="text-[12.5px]"
                        style={{ color: "rgba(148,163,184,0.65)" }}
                      >
                        {purpose}
                      </p>
                    </div>
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors"
                        style={{
                          background: "rgba(37,99,235,0.08)",
                          border: "1px solid rgba(37,99,235,0.18)",
                          color: "#93C5FD",
                        }}
                        aria-label={`View ${name} privacy policy`}
                      >
                        Privacy policy ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p>
                We do not sell your personal data to third parties under any
                circumstances.
              </p>
            </PolicySection>

            {/* 7 · User Rights */}
            <PolicySection id="user-rights" title="User Rights" index={6}>
              <p>
                Depending on your jurisdiction, you may have certain rights
                regarding your personal data. Axivon Technologies respects and
                upholds these rights.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  {
                    right: "Access Data",
                    desc: "Request a copy of the personal data we hold about you.",
                    color: "#60A5FA",
                  },
                  {
                    right: "Update Information",
                    desc: "Correct any inaccurate or incomplete data.",
                    color: "#818CF8",
                  },
                  {
                    right: "Request Deletion",
                    desc: "Ask us to erase your personal data from our systems.",
                    color: "#C4B5FD",
                  },
                  {
                    right: "Opt-Out Communications",
                    desc: "Unsubscribe from marketing emails at any time.",
                    color: "#67E8F9",
                  },
                ].map(({ right, desc, color }) => (
                  <div
                    key={right}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.022)",
                      border: "1px solid rgba(255,255,255,0.055)",
                    }}
                  >
                    <div
                      className="mb-1.5 flex items-center gap-2"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: color }}
                        aria-hidden
                      />
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "#E2E8F0" }}
                      >
                        {right}
                      </p>
                    </div>
                    <p
                      className="text-[12.5px] leading-relaxed"
                      style={{ color: "rgba(148,163,184,0.65)" }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:info@axivontech.in"
                  className="font-medium underline underline-offset-2"
                  style={{ color: "#60A5FA" }}
                >
                  info@axivontech.in
                </a>
                . We will respond within 30 days.
              </p>
            </PolicySection>

            {/* 8 · Contact Information */}
            <PolicySection
              id="contact-information"
              title="Contact Information"
              index={7}
            >
              <p>
                If you have questions, concerns, or requests regarding this
                Privacy Policy, please reach out to our team. We are committed
                to addressing your enquiries promptly.
              </p>

              {/* Contact card */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.05) 100%)",
                  border: "1px solid rgba(37,99,235,0.16)",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(37,99,235,0.12)",
                      border: "1px solid rgba(37,99,235,0.22)",
                    }}
                  >
                    <ContactIcon />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#F1F5F9" }}
                    >
                      Axivon Technologies
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "rgba(148,163,184,0.6)" }}
                    >
                      Technology Services Company
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href="mailto:info@axivontech.in"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#93C5FD",
                      textDecoration: "none",
                    }}
                  >
                    <MailIcon />
                    <span className="text-[13px] font-medium">
                      info@axivontech.in
                    </span>
                  </a>
                  <a
                    href="https://axivontech.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "#67E8F9",
                      textDecoration: "none",
                    }}
                  >
                    <GlobeIcon />
                    <span className="text-[13px] font-medium">
                      axivontech.in
                    </span>
                  </a>
                </div>
              </div>

              <p
                className="text-[12.5px]"
                style={{ color: "rgba(100,116,139,0.7)" }}
              >
                Axivon Technologies reserves the right to update this Privacy
                Policy at any time. Changes will be posted on this page with a
                revised effective date. Continued use of our services constitutes
                acceptance of the updated policy.
              </p>
            </PolicySection>

            {/* Bottom rule */}
            <div
              className="mx-auto pt-4"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(37,99,235,0.25) 30%, rgba(124,58,237,0.25) 70%, transparent)",
              }}
            />
          </main>
        </div>
      </div>

      {/* Bottom vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(to top, rgba(5,8,22,0.5) 0%, transparent 100%)",
        }}
      />
    </section>
  );
}

// ─────────────────────────────────────────────
// Inline SVG icon components
// ─────────────────────────────────────────────
function IntroIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4 5h6M4 7.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function CollectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1" />
      <path d="M2 12c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function UseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function CookieIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="5" cy="6" r="0.75" fill="currentColor" />
      <circle cx="8" cy="9" r="0.75" fill="currentColor" />
      <circle cx="9" cy="5.5" r="0.75" fill="currentColor" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1L2 3.5V7C2 10 4.5 12.5 7 13C9.5 12.5 12 10 12 7V3.5L7 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}
function ThirdPartyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1" />
      <circle cx="2.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="11.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="7" cy="12" r="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4 3.5L5.5 5.5M9 5.5L10 3.5M7 9v1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function RightsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 7l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ContactIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="3" width="12" height="8.5" rx="2" stroke="currentColor" strokeWidth="1" />
      <path d="M1 5.5l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="3" width="12" height="8.5" rx="2" stroke="currentColor" strokeWidth="1" />
      <path d="M1 5.5l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M7 1.5C7 1.5 5.5 3.5 5.5 7s1.5 5.5 1.5 5.5M7 1.5C7 1.5 8.5 3.5 8.5 7S7 12.5 7 12.5M1.5 7h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}