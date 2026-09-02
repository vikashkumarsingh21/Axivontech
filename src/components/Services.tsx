"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Code2,
  ShoppingCart,
  Smartphone,
  Search,
  PenTool,
  Megaphone,
  Terminal,
  BrainCircuit,
  Bot,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  featured?: boolean;
}

const SERVICES: Service[] = [
  {
    icon: Code2,
    title: "Web Development",
    href: "/services/web-development",
    description:
      "Custom websites and business platforms built for speed, clarity, and long-term scalability using Next.js, React, and TypeScript.",
    featured: true,
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    href: "/services/mobile-app-development",
    description:
      "Native and cross-platform iOS and Android apps designed around real business workflows and user needs.",
  },
  {
    icon: BrainCircuit,
    title: "AI Solutions",
    href: "/services/ai-solutions",
    description:
      "Intelligent automation, chatbots, and AI-powered systems that reduce friction and improve business efficiency.",
  },
  {
    icon: Search,
    title: "SEO & SEM",
    href: "/services/seo-services",
    description:
      "Search strategies that improve discoverability, traffic quality, and measurable ROI over time.",
  },
  {
    icon: PenTool,
    title: "UI/UX Design",
    href: "/services/ui-ux-design",
    description:
      "Research-led design systems that turn complex products into clear, usable, and trustworthy journeys.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    href: "/services/digital-marketing",
    description:
      "Campaigns that connect content, channels, and conversion paths to support consistent business growth.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Development",
    href: "/services/web-development",
    description:
      "Scalable online stores with clean UX, conversion-focused flows, and smooth checkout experiences.",
  },
  {
    icon: Terminal,
    title: "Custom Software",
    href: "/services/custom-software-development",
    description:
      "Tailored systems that fit your operations, reduce manual work, and scale alongside your team.",
  },
  {
    icon: Bot,
    title: "Chatbot Development",
    href: "/services/ai-solutions",
    description:
      "Conversational experiences that support service delivery, lead capture, and customer engagement.",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
};

function ServiceCard({ service, featured }: { service: Service; featured?: boolean }) {
  const Icon = service.icon;
  return (
    <Link
      href={service.href}
      className={`group flex flex-col rounded-2xl border transition-all duration-200 ${
        featured
          ? "border-[rgba(232,160,100,0.25)] bg-[#1c1c1e] hover:border-[rgba(232,160,100,0.45)] hover:shadow-[0_8px_32px_rgba(232,160,100,0.10)]"
          : "border-[#262626] bg-[#141414] hover:border-[#303030] hover:bg-[#1c1c1e]"
      } p-6`}
    >
      {/* Icon */}
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${
          featured
            ? "bg-[#2a1f14] text-[#e8a064]"
            : "bg-[#1c1c1e] text-[#71717a] group-hover:text-[#e8a064]"
        } transition-colors duration-200`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h3
        className={`mb-2 text-base font-semibold leading-snug ${
          featured ? "text-[#f4f4f5]" : "text-[#d4d4d4] group-hover:text-[#f4f4f5]"
        } transition-colors`}
      >
        {service.title}
      </h3>

      {/* Description */}
      <p className="mb-5 flex-1 text-sm leading-6 text-[#71717a]">
        {service.description}
      </p>

      {/* CTA */}
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
          featured
            ? "text-[#e8a064] group-hover:gap-2.5"
            : "text-[#52525b] group-hover:text-[#e8a064] group-hover:gap-2.5"
        }`}
      >
        Learn More
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export default function Services() {
  const shouldReduceMotion = useReducedMotion();
  const featured = SERVICES[0];
  const rest = SERVICES.slice(1);

  return (
    <section id="services" className="bg-[#0f0f0f] py-24 sm:py-28">
      {/* Top border */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-1 h-px w-full bg-gradient-to-r from-transparent via-[#262626] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mb-16"
        >
          <SectionHeader
            overline="What We Build"
            heading={
              <>
                Technology services built{" "}
                <span className="text-gradient-amber">for business momentum.</span>
              </>
            }
            body="We help organisations design, build, and grow digital experiences that are reliable, useful, and built to scale."
            align="left"
            maxWidthClass="max-w-2xl"
          />
        </motion.div>

        {/* Featured + grid layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {/* Featured card — spans 2 columns */}
          <motion.div
            variants={cardVariants}
            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.2 }}
            className="sm:col-span-2"
          >
            <ServiceCard service={featured} featured />
          </motion.div>

          {/* Rest of services */}
          {rest.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-[#303030] px-6 py-2.5 text-sm font-semibold text-[#a1a1aa] transition-all hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064]"
          >
            View All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}