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
  { id: "acceptance-of-terms",     label: "Acceptance of Terms",      icon: <AcceptIcon /> },
  { id: "use-of-services",         label: "Use of Services",           icon: <UseIcon /> },
  { id: "intellectual-property",   label: "Intellectual Property",     icon: <IPIcon /> },
  { id: "user-responsibilities",   label: "User Responsibilities",     icon: <UserIcon /> },
  { id: "payments-billing",        label: "Payments & Billing",        icon: <BillingIcon /> },
  { id: "limitation-of-liability", label: "Limitation of Liability",   icon: <LiabilityIcon /> },
  { id: "termination",             label: "Termination",               icon: <TerminationIcon /> },
  { id: "changes-to-terms",        label: "Changes to Terms",          icon: <ChangesIcon /> },
  { id: "contact-information",     label: "Contact Information",       icon: <ContactIcon /> },
];

// ─────────────────────────────────────────────
// Scroll utility
// ─────────────────────────────────────────────
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: "smooth" });
}

// ─────────────────────────────────────────────
// Section wrapper — identical glass card to PrivacyPolicyContent
// ─────────────────────────────────────────────
function TermsSection({ id, title, children, index }: SectionProps) {
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
        style={{ color: "#F1F5F9", letterSpacing: "-0.015em", lineHeight: 1.25 }}
      >
        {title}
      </h2>

      {/* Body */}
      <div
        className="space-y-4 text-sm leading-relaxed sm:text-[15px]"
        style={{ color: "rgba(203,213,225,0.72)" }}
      >
        {children}
      </div>

      {/* Corner hover accent */}
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
// InfoRow — bullet list item
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
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "#3B82F6" }}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Chip
// ─────────────────────────────────────────────
function Chip({
  color,
  children,
}: {
  color: "blue" | "purple" | "cyan";
  children: React.ReactNode;
}) {
  const palette = {
    blue:   { bg: "rgba(37,99,235,0.09)",  border: "rgba(37,99,235,0.2)",   text: "#93C5FD" },
    purple: { bg: "rgba(124,58,237,0.09)", border: "rgba(124,58,237,0.2)",  text: "#C4B5FD" },
    cyan:   { bg: "rgba(0,212,255,0.07)",  border: "rgba(0,212,255,0.18)",  text: "#67E8F9" },
  };
  const c = palette[color];
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
// Feature row (icon + label + description)
// ─────────────────────────────────────────────
function FeatureRow({
  icon,
  title,
  desc,
  accent = "#BFDBFE",
  bg = "rgba(37,99,235,0.05)",
  border = "rgba(37,99,235,0.12)",
}: {
  icon: string;
  title: string;
  desc: string;
  accent?: string;
  bg?: string;
  border?: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span className="text-base" role="img" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-[13px] font-semibold" style={{ color: accent }}>
          {title}
        </p>
        <p className="text-[12.5px]" style={{ color: "rgba(148,163,184,0.65)" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function TermsContent() {
  const [activeId, setActiveId] = useState<string>("acceptance-of-terms");
  const prefersReducedMotion = useReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      });
    },
    []
  );

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
      aria-label="Terms and Conditions Content"
    >
      {/* ── Background grid ── */}
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute"
          style={{
            top: "5%",
            left: "-5%",
            width: "40%",
            height: "50%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)",
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
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
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
            aria-label="Terms and conditions sections"
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
                    boxShadow:
                      "0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "rgba(148,163,184,0.55)" }}
                  >
                    Contents
                  </p>
                </div>

                {/* Nav list */}
                <nav
                  className="overflow-hidden rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.034) 0%, rgba(255,255,255,0.016) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow:
                      "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
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
                                ? "rgba(37,99,235,0.10)"
                                : "transparent",
                              border: isActive
                                ? "1px solid rgba(37,99,235,0.20)"
                                : "1px solid transparent",
                              color: isActive
                                ? "#93C5FD"
                                : "rgba(148,163,184,0.7)",
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
                            {/* Animated active indicator bar */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.span
                                  layoutId="terms-nav-indicator"
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
                                color: isActive
                                  ? "#60A5FA"
                                  : "rgba(100,116,139,0.7)",
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

                            {/* Hover radial glow */}
                            <span
                              aria-hidden
                              className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/nav:opacity-100"
                              style={{
                                background:
                                  "radial-gradient(ellipse at left, rgba(37,99,235,0.06) 0%, transparent 70%)",
                              }}
                            />
                          </motion.button>

                          {i < NAV_ITEMS.length - 1 && (
                            <div
                              className="mx-4 my-0.5 h-px"
                              style={{ background: "rgba(255,255,255,0.04)" }}
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
                     June 2026 
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
            aria-label="Terms and conditions sections"
          >

            {/* 1 · Acceptance of Terms */}
            <TermsSection id="acceptance-of-terms" title="Acceptance of Terms" index={0}>
              <p>
                By accessing or using any website, product, or service operated
                by Axivon Technologies, you confirm that you have read,
                understood, and agree to be bound by these Terms &amp;
                Conditions. If you do not agree, you must discontinue use
                immediately.
              </p>
              <p>
                These terms constitute a legally binding agreement between you
                ("User") and Axivon Technologies ("Company", "we", "us", or
                "our"). Use of our services is conditional upon your acceptance
                of all terms stated herein.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Chip color="blue">Legally Binding</Chip>
                <Chip color="purple">All Users</Chip>
                <Chip color="cyan">Effective Date: 20 June 2026</Chip>
              </div>
            </TermsSection>

            {/* 2 · Use of Services */}
            <TermsSection id="use-of-services" title="Use of Services" index={1}>
              <p>
                Our services are intended for lawful purposes only. You agree to
                use Axivon Technologies' platforms, tools, and deliverables in
                accordance with all applicable laws, regulations, and these
                Terms.
              </p>
              <p>You agree not to:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Violate any applicable law or regulation",
                  "Infringe upon the rights of third parties",
                  "Transmit harmful, offensive, or unlawful content",
                  "Attempt to gain unauthorised system access",
                  "Reverse-engineer proprietary software or tools",
                  "Misrepresent your identity or affiliation",
                ].map((item) => (
                  <InfoRow key={item}>{item}</InfoRow>
                ))}
              </div>
              <p>
                We reserve the right to suspend access for any user who
                violates these terms, without prior notice.
              </p>
            </TermsSection>

            {/* 3 · Intellectual Property */}
            <TermsSection
              id="intellectual-property"
              title="Intellectual Property"
              index={2}
            >
              <p>
                All content, code, designs, trademarks, graphics, and materials
                produced or owned by Axivon Technologies are the exclusive
                intellectual property of the Company and are protected by
                applicable copyright, trademark, and intellectual property laws.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: "©",
                    title: "Company-Owned IP",
                    desc: "All brand assets, website content, and internal tools remain the sole property of Axivon Technologies.",
                    accent: "#BFDBFE",
                    bg: "rgba(37,99,235,0.05)",
                    border: "rgba(37,99,235,0.12)",
                  },
                  {
                    icon: "📄",
                    title: "Client Deliverables",
                    desc: "Custom deliverables are transferred to the client upon full payment, as specified in the project agreement.",
                    accent: "#C4B5FD",
                    bg: "rgba(124,58,237,0.05)",
                    border: "rgba(124,58,237,0.12)",
                  },
                  {
                    icon: "🔗",
                    title: "Third-Party Assets",
                    desc: "Third-party licences remain subject to their original terms and are not transferred.",
                    accent: "#67E8F9",
                    bg: "rgba(0,212,255,0.04)",
                    border: "rgba(0,212,255,0.12)",
                  },
                  {
                    icon: "🚫",
                    title: "Prohibited Use",
                    desc: "Reproduction or redistribution of our materials without written consent is strictly prohibited.",
                    accent: "#FCA5A5",
                    bg: "rgba(239,68,68,0.04)",
                    border: "rgba(239,68,68,0.1)",
                  },
                ].map((f) => (
                  <FeatureRow key={f.title} {...f} />
                ))}
              </div>
            </TermsSection>

            {/* 4 · User Responsibilities */}
            <TermsSection
              id="user-responsibilities"
              title="User Responsibilities"
              index={3}
            >
              <p>
                As a user or client of Axivon Technologies, you are responsible
                for the accuracy of all information you provide and for
                maintaining the security of your account credentials.
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Accurate Information",
                    desc: "You agree to provide truthful, current, and complete information at all times.",
                  },
                  {
                    label: "Account Security",
                    desc: "You are responsible for safeguarding login credentials and restricting access to authorised personnel.",
                  },
                  {
                    label: "Timely Feedback",
                    desc: "For project engagements, you agree to provide timely approvals, content, and review feedback.",
                  },
                  {
                    label: "Compliance",
                    desc: "You confirm that your intended use of our services complies with all applicable laws.",
                  },
                  {
                    label: "Notification of Breach",
                    desc: "You must notify us immediately upon discovering any unauthorised use of your account.",
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
            </TermsSection>

            {/* 5 · Payments & Billing */}
            <TermsSection
              id="payments-billing"
              title="Payments & Billing"
              index={4}
            >
              <p>
                All fees for services rendered by Axivon Technologies are
                outlined in individual project proposals or service agreements.
                Payment terms are binding upon acceptance of a proposal.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Payment Schedule",
                    desc: "Milestone-based or upfront billing as specified per project.",
                    color: "blue" as const,
                  },
                  {
                    label: "Late Payments",
                    desc: "Overdue invoices may result in work suspension after 14 days.",
                    color: "purple" as const,
                  },
                  {
                    label: "Refund Policy",
                    desc: "Refund and cancellation terms will be specified individually within project agreements and service contracts.",
                    color: "cyan" as const,
                  },
                ].map(({ label, desc, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="mb-2">
                      <Chip color={color}>{label}</Chip>
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
                All prices are exclusive of applicable taxes unless stated
                otherwise. Axivon Technologies reserves the right to revise
                pricing for future engagements with reasonable notice.
              </p>
            </TermsSection>

            {/* 6 · Limitation of Liability */}
            <TermsSection
              id="limitation-of-liability"
              title="Limitation of Liability"
              index={5}
            >
              <p>
                To the maximum extent permitted by applicable law, Axivon
                Technologies shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from your
                use of, or inability to use, our services.
              </p>
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(37,99,235,0.04) 100%)",
                  border: "1px solid rgba(124,58,237,0.14)",
                }}
              >
                <p
                  className="mb-2 text-[12px] font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(196,181,253,0.65)" }}
                >
                  Important Notice
                </p>
                <p
                  className="text-[13.5px] leading-relaxed"
                  style={{ color: "rgba(203,213,225,0.75)" }}
                >
                  Our total liability to you for any claim arising under or in
                  connection with these Terms shall not exceed the total fees
                  paid by you to Axivon Technologies in the three (3) months
                  preceding the claim. Some jurisdictions do not allow the
                  exclusion of certain warranties or limitations of liability;
                  in such cases, our liability is limited to the greatest extent
                  permitted by law.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { right: "No Consequential Damages", color: "#60A5FA" },
                  { right: "No Loss of Revenue Claims", color: "#818CF8" },
                  { right: "No Data Loss Liability", color: "#C4B5FD" },
                  { right: "Capped Direct Damages", color: "#67E8F9" },
                ].map(({ right, color }) => (
                  <div
                    key={right}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.022)",
                      border: "1px solid rgba(255,255,255,0.055)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: color }}
                      aria-hidden
                    />
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: "#E2E8F0" }}
                    >
                      {right}
                    </p>
                  </div>
                ))}
              </div>
            </TermsSection>

            {/* 7 · Termination */}
            <TermsSection id="termination" title="Termination" index={6}>
              <p>
                Either party may terminate an engagement or service agreement in
                accordance with the terms outlined in the applicable project
                contract. Axivon Technologies reserves the right to terminate
                access to services immediately if you breach any provision of
                these Terms.
              </p>
              <div className="space-y-2">
                {[
                  {
                    icon: "⚠️",
                    title: "Breach Termination",
                    desc: "Immediate suspension or termination without notice for material breach of these Terms.",
                    accent: "#FCA5A5",
                    bg: "rgba(239,68,68,0.04)",
                    border: "rgba(239,68,68,0.10)",
                  },
                  {
                    icon: "📋",
                    title: "Contractual Termination",
                    desc: "Orderly termination per project agreement terms, with notice periods respected.",
                    accent: "#BFDBFE",
                    bg: "rgba(37,99,235,0.05)",
                    border: "rgba(37,99,235,0.12)",
                  },
                  {
                    icon: "💼",
                    title: "Post-Termination",
                    desc: "Outstanding invoices remain payable. Delivered work-product ownership follows the payment status at termination.",
                    accent: "#C4B5FD",
                    bg: "rgba(124,58,237,0.05)",
                    border: "rgba(124,58,237,0.12)",
                  },
                ].map((f) => (
                  <FeatureRow key={f.title} {...f} />
                ))}
              </div>
            </TermsSection>

            {/* 8 · Changes to Terms */}
            <TermsSection
              id="changes-to-terms"
              title="Changes to Terms"
              index={7}
            >
              <p>
                Axivon Technologies reserves the right to modify these Terms
                &amp; Conditions at any time. Material changes will be
                communicated via our website or, where applicable, by email.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Notice Period",
                    desc: "Significant changes will be announced at least 14 days in advance where possible.",
                    color: "#60A5FA",
                  },
                  {
                    label: "Continued Use",
                    desc: "Your continued use after changes take effect constitutes acceptance of the revised Terms.",
                    color: "#818CF8",
                  },
                  {
                    label: "Version History",
                    desc: "The effective date at the top of this page reflects the most recent revision.",
                    color: "#C4B5FD",
                  },
                  {
                    label: "Right to Reject",
                    desc: "If you disagree with updated Terms, you may cease use and request account deletion.",
                    color: "#67E8F9",
                  },
                ].map(({ label, desc, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.022)",
                      border: "1px solid rgba(255,255,255,0.055)",
                    }}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: color }}
                        aria-hidden
                      />
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "#E2E8F0" }}
                      >
                        {label}
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
                We encourage you to review this page periodically. The date of
                the latest revision is always displayed at the top of this
                document.
              </p>
            </TermsSection>

            {/* 9 · Contact Information */}
            <TermsSection
              id="contact-information"
              title="Contact Information"
              index={8}
            >
              <p>
                If you have questions about these Terms &amp; Conditions or
                wish to raise a legal enquiry, please contact our team. We aim
                to respond to all formal queries within 5 business days.
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
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
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
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
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
                These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these Terms shall be subject to the jurisdiction of the courts located in Bihar, India.
              </p>
            </TermsSection>

            {/* Bottom gradient rule */}
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
// Nav icon components (14×14 inline SVGs)
// ─────────────────────────────────────────────
function AcceptIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M7 4.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function IPIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1L2 4v3c0 3.314 2.239 5 5 6 2.761-1 5-2.686 5-6V4L7 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M5.5 7.5h3M7 5.5v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1" />
      <path d="M2 12c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function BillingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1" />
      <path d="M1 6.5h12" stroke="currentColor" strokeWidth="1" />
      <path d="M4 9.5h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function LiabilityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1.5L1.5 4v4.5c0 2.5 2.5 4 5.5 5 3-1 5.5-2.5 5.5-5V4L7 1.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function TerminationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function ChangesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M11.5 7A4.5 4.5 0 1 1 7 2.5c1.3 0 2.5.52 3.36 1.36" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M9.5 1.5v3H12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
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