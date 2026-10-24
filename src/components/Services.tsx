"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Code2,
  Smartphone,
  BrainCircuit,
  PenTool,
  ArrowUpRight,
  CheckCircle,
  Search,
  Megaphone,
  Layers,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "@/components/ui";
import type { ServiceData } from "@/lib/content/content-db";
import { SITE_FACTS } from "@/config/siteFacts";

interface FlagshipService {
  id: string;
  title: string;
  badge: string;
  description: string;
  href: string;
  icon: typeof Code2;
  stack: string[];
  deliverables: string[];
  highlight: string;
  image: string;
}

interface ServicesProps {
  services?: ServiceData[];
}

const FLAGSHIP_SERVICES: FlagshipService[] = [
  {
    id: "web-dev",
    title: "Web Platforms & SaaS Engineering",
    badge: "Full-Stack Web",
    description:
      "Engineered from first principles for blistering speed, rigorous type-safety, and seamless conversions. We build modern digital products that rank effortlessly and scale with your company.",
    href: "/services/web-development",
    icon: Code2,
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
    deliverables: [
      "Optimized Core Web Vitals & high-speed performance",
      "SSR & Edge-rendered dynamic architectures",
      "Full API & database integrations",
    ],
    highlight: "High Availability & Performance",
    image: "/assets/images/services/web-engineering.jpg",
  },
  {
    id: "mobile-dev",
    title: "Native & Cross-Platform Mobile Apps",
    badge: "iOS & Android",
    description:
      "Crafted mobile experiences that feel fluid, responsive, and natural. From MVP testing to enterprise deployment across App Store and Google Play.",
    href: "/services/mobile-app-development",
    icon: Smartphone,
    stack: ["Flutter", "React Native", "Swift", "Kotlin", "Firebase", "REST & GraphQL"],
    deliverables: [
      "Single-codebase cross-platform efficiency",
      "Offline-first sync & push notifications",
      "Biometric security & hardware integrations",
    ],
    highlight: "Multi-Platform Fluidity",
    image: "/assets/images/services/mobile-app-design.jpg",
  },
  {
    id: "ai-solutions",
    title: "Applied AI & Workflow Automations",
    badge: "Intelligent Systems",
    description:
      "Integrate practical, high-impact artificial intelligence into existing workflows. We build conversational agents, computer vision pipelines, and automated intelligence tools.",
    href: "/services/ai-solutions",
    icon: BrainCircuit,
    stack: ["Python", "FastAPI", "OpenAI / Claude APIs", "LangChain", "Vector DBs"],
    deliverables: [
      "Custom knowledge-base support chatbots",
      "Document extraction & workflow automation",
      "Real-time sentiment and predictive analytics",
    ],
    highlight: "Practical AI Integration",
    image: "/assets/images/services/ai-machine-learning.jpg",
  },
  {
    id: "ui-ux",
    title: "UI/UX Product Design & Systems",
    badge: "Design Systems",
    description:
      "Clear, empathetic design systems that demystify complex workflows. We create intuitive interfaces that convert visitors into loyal clients.",
    href: "/services/ui-ux-design",
    icon: PenTool,
    stack: ["Figma", "Design Systems", "Prototyping", "User Research", "Wireframing"],
    deliverables: [
      "Complete reusable component libraries",
      "Interactive high-fidelity prototypes",
      "Accessibility-first WCAG 2.1 compliance",
    ],
    highlight: "Human-Centered Design",
    image: "/assets/images/services/ui-ux-design-workspace.jpg",
  },
];

const COMPLEMENTARY_SERVICES = [
  {
    title: "Technical SEO & Growth",
    href: "/services/seo-services",
    icon: Search,
    desc: "Structured data, semantic content audits, and crawl-budget optimization for sustainable rankings.",
  },
  {
    title: "Digital Marketing Campaigns",
    href: "/services/digital-marketing",
    icon: Megaphone,
    desc: "Targeted digital marketing and acquisition strategies aligned directly with revenue goals.",
  },
  {
    title: "Cloud & DevOps Infrastructure",
    href: "/services/cloud-solutions",
    icon: Layers,
    desc: "Resilient cloud architectures, automated CI/CD pipelines, and secure containerization.",
  },
  {
    title: "Custom Enterprise Software",
    href: "/services/custom-software-development",
    icon: Terminal,
    desc: "Bespoke internal systems, ERP tooling, and database automation designed for your operations.",
  },
];

export default function Services({ services }: ServicesProps = {}) {
  const shouldReduceMotion = useReducedMotion();

  // If dynamic services are provided from DB, overlay updated fields
  const displayedFlagship: FlagshipService[] = services && services.length > 0
    ? FLAGSHIP_SERVICES.map((staticSrv) => {
        const match = services.find(
          (s) =>
            s.slug === staticSrv.id ||
            s.slug === "web-development" && staticSrv.id === "web-dev" ||
            s.slug === "mobile-app-development" && staticSrv.id === "mobile-dev" ||
            staticSrv.href.endsWith(s.slug)
        );
        if (!match) return staticSrv;
        return {
          ...staticSrv,
          title: match.title || staticSrv.title,
          badge: match.badge || staticSrv.badge,
          description: match.shortDescription || staticSrv.description,
          stack: match.technologies && match.technologies.length > 0
            ? match.technologies.map((t: any) => (typeof t === "string" ? t : t.name || ""))
            : staticSrv.stack,
          deliverables:
            match.benefits && match.benefits.length > 0
              ? match.benefits.map((b: any) => (typeof b === "string" ? b : (b.title || b.description || "")))
              : staticSrv.deliverables,
        };
      })
    : FLAGSHIP_SERVICES;

  return (
    <section id="services" className="relative bg-[#0a0a0a] py-14 sm:py-20 lg:py-28 border-t border-[#1f1f1f]">
      {/* Background radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.04),_transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="mx-auto mb-10 sm:mb-16 lg:mb-20 max-w-3xl text-center">
          <SectionHeader
            overline="Agency Capabilities"
            heading={
              <>
                Engineered with precision.{" "}
                <span className="text-gradient-amber">Built for real business impact.</span>
              </>
            }
            body="We combine creative design intuition with rigorous software engineering. Explore our core disciplines below."
          />
        </div>

        {/* ── Flagship Services: Alternating Editorial Showcase ───── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {displayedFlagship.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <motion.div
                key={srv.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#222222] bg-[#121212] p-7 transition-all duration-300 hover:border-[#383838] hover:bg-[#161616] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(232,160,100,0.2)] bg-[#21180f] text-[#e8a064]">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>
                    <span className="rounded-full border border-[#29313B] bg-[#151A21] px-3 py-1 font-mono text-[11px] font-medium text-[#A7B0BC]">
                      {srv.badge}
                    </span>
                  </div>

                  {/* Feature Image */}
                  <div className="relative mb-6 w-full overflow-hidden rounded-xl border border-[#262626] aspect-[16/9]">
                    <Image
                      src={srv.image}
                      alt={srv.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 to-transparent mix-blend-multiply" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading mb-2.5 text-xl sm:text-2xl font-bold tracking-tight text-[#F3F5F7] transition-colors group-hover:text-[#e8a064]">
                    {srv.title}
                  </h3>
                  <p className="mb-6 text-sm sm:text-base leading-relaxed text-[#A7B0BC] font-light text-pretty">
                    {srv.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="mb-6 space-y-2.5 border-t border-[#1f1f1f] pt-5">
                    {srv.deliverables.map((item: any, itemIdx: number) => {
                      const text = typeof item === "string" ? item : (item?.title || item?.name || item?.description || "");
                      if (!text) return null;
                      return (
                        <div key={`${srv.id}-deliv-${itemIdx}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#D4D4D8] font-light leading-normal">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e8a064]" />
                          <span>{text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Technology Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {srv.stack.map((tech: any, techIdx: number) => {
                      const text = typeof tech === "string" ? tech : (tech?.name || "");
                      if (!text) return null;
                      return (
                        <span
                          key={`${srv.id}-tech-${techIdx}`}
                          className="rounded-md border border-[#29313B] bg-[#151A21] px-2.5 py-1 font-mono text-[11px] text-[#A7B0BC] font-medium"
                        >
                          {text}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Link Action */}
                <div className="border-t border-[#1f1f1f] pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7E8997] group-hover:text-[#A7B0BC]">
                    {srv.highlight}
                  </span>
                  <Link
                    href={srv.href}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-tight text-[#e8a064] transition-transform group-hover:translate-x-1"
                  >
                    <span>Explore Service Details</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Complementary Specialized Disciplines ─────────────── */}
        <div className="mt-10 sm:mt-14 border-t border-[#1f1f1f] pt-8 sm:pt-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="font-heading text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-[#7E8997]">
              Additional Specialized Capabilities
            </h4>
            <Link
              href="/services"
              className="text-xs sm:text-sm font-semibold text-[#e8a064] hover:underline"
            >
              View All {SITE_FACTS.services.count} Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPLEMENTARY_SERVICES.map((comp) => {
              const CompIcon = comp.icon;
              return (
                <Link
                  key={comp.title}
                  href={comp.href}
                  className="group rounded-xl border border-[#222222] bg-[#121212] p-5 transition-all hover:border-[#383838] hover:bg-[#161616]"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1c1c1e] text-[#a1a1aa] transition-colors group-hover:text-[#e8a064]">
                    <CompIcon className="h-4 w-4" />
                  </div>
                  <h5 className="font-heading mb-1.5 text-sm sm:text-base font-semibold text-[#F3F5F7] group-hover:text-[#e8a064] transition-colors">
                    {comp.title}
                  </h5>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#A7B0BC] font-light">
                    {comp.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
