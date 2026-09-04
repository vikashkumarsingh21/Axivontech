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
import { SectionHeader } from "@/components/ui";

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
      "Sub-second Core Web Vitals & Google 90+ PageSpeed",
      "SSR & Edge-rendered dynamic architectures",
      "Full API & database integrations",
    ],
    highlight: "99.9% Uptime & Lighthouse 95+",
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

export default function Services() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="services" className="relative bg-[#0a0a0a] py-20 sm:py-28 border-t border-[#1f1f1f]">
      {/* Background radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.04),_transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
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
          {FLAGSHIP_SERVICES.map((srv, idx) => {
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
                    <span className="rounded-full border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1 font-mono text-[11px] font-medium text-[#a1a1aa]">
                      {srv.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-[#f4f4f5] transition-colors group-hover:text-[#e8a064]">
                    {srv.title}
                  </h3>
                  <p className="mb-6 text-sm leading-6 text-[#a1a1aa]">
                    {srv.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="mb-6 space-y-2 border-t border-[#1f1f1f] pt-5">
                    {srv.deliverables.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-[#c4c4c4]">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e8a064]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Technology Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {srv.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-[#222222] bg-[#171717] px-2 py-1 font-mono text-[10px] text-[#8e8e93]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Link Action */}
                <div className="border-t border-[#1f1f1f] pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#71717a] group-hover:text-[#a1a1aa]">
                    {srv.highlight}
                  </span>
                  <Link
                    href={srv.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#e8a064] transition-transform group-hover:translate-x-1"
                  >
                    <span>Explore Service Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Complementary Specialized Disciplines ─────────────── */}
        <div className="mt-14 border-t border-[#1f1f1f] pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#71717a]">
              Additional Specialized Capabilities
            </h4>
            <Link
              href="/services"
              className="text-xs font-semibold text-[#e8a064] hover:underline"
            >
              View All 8 Services →
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
                  <h5 className="mb-1 text-sm font-semibold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
                    {comp.title}
                  </h5>
                  <p className="text-xs leading-5 text-[#8e8e93]">
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