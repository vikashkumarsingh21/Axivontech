"use client";

import { motion, type Variants } from "framer-motion";
import {
  Globe,
  Sprout,
  Waves,
  Building2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Completed" | "Live" | "In Development";
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
}

const PROJECTS: Project[] = [
  {
    id: "axivon-technologies",
    title: "Axivon Technologies Platform",
    category: "Agency Digital Platform",
    description:
      "Modern technology agency digital architecture with integrated service exploration, real-time consultation intake, and responsive cross-platform interfaces.",
    status: "Live",
    technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Prisma"],
    liveUrl: "https://axivontech.in/",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    icon: Building2,
    image: "/assets/images/portfolio/axivon-studio.jpg",
    imageAlt: "Axivon Technologies modern agency platform and workspace",
  },
  {
    id: "krishi-drishti",
    title: "Krishi Drishti",
    category: "Smart Agriculture & IoT",
    description:
      "AI-driven smart irrigation and telemetry platform featuring real-time soil moisture sensor monitoring, agricultural weather analytics, and automated water management.",
    status: "Live",
    technologies: ["IoT Telemetry", "JavaScript", "Firebase", "Node.js", "Sensors"],
    liveUrl: "https://krishi-drishti.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/KRISHI-DRISHTI",
    icon: Sprout,
    image: "/assets/images/portfolio/krishi-drishti.jpg",
    imageAlt: "Krishi Drishti smart agriculture sensor telemetry and irrigation system",
  },
  {
    id: "jalmitra",
    title: "JalMitra",
    category: "Environmental Technology",
    description:
      "Automated solar-powered water purification and environmental telemetry system designed to harvest surface debris and monitor municipal water body quality.",
    status: "Live",
    technologies: ["Solar Automation", "Embedded IoT", "Node.js", "Firebase"],
    liveUrl: "https://jal-mitraafrontend.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/jalmitra",
    icon: Waves,
    image: "/assets/images/portfolio/jalmitra.jpg",
    imageAlt: "JalMitra environmental solar aquatic filtration and water monitoring system",
  },
  {
    id: "nani-tathagat",
    title: "Nani Tathagat",
    category: "Business Automation & CRM",
    description:
      "Operational workflow automation and lead capture system that streamlines client communication, automated reporting, and customer pipeline management.",
    status: "Live",
    technologies: ["Automation Engine", "Node.js", "SQL", "Google Cloud", "REST APIs"],
    liveUrl: "https://nanitathagat.in/",
    githubUrl: "https://github.com/vikashkumarsingh21/nanitathagat",
    icon: Globe,
    image: "/assets/images/portfolio/nani-tathagat.jpg",
    imageAlt: "Nani Tathagat enterprise automation and sales intelligence dashboard",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Portfolio() {

  return (
    <section id="portfolio" className="relative bg-[#0f0f0f] py-24 sm:py-28 border-t border-[#1f1f1f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <SectionHeader
            overline="Case Studies & Work"
            heading={
              <>
                Featured <span className="text-gradient-amber">Engineered Projects</span>
              </>
            }
            body="Explore verified digital products designed, built, and shipped by Axivon Technologies. Each solution addresses specific business and technical challenges."
          />
        </motion.div>

        {/* Project cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {PROJECTS.map((project) => {
            const Icon = project.icon;
            return (
              <motion.div
                key={project.id}
                variants={cardVariants}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#262626] bg-[#141414] transition-all duration-300 hover:border-[#383838] hover:bg-[#161616] hover:shadow-[0_20px_48px_rgba(0,0,0,0.6)]"
              >
                <div>
                  {/* Real Visual Image Showcase */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[#262626] bg-[#1a1a1a]">
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />

                    {/* Category pill */}
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[#0f0f0f]/85 px-3 py-1 font-mono text-[11px] font-medium text-[#d4d4d4] backdrop-blur-md shadow-sm">
                        {project.category}
                      </span>
                    </div>

                    {/* Live status badge */}
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#0f0f0f]/85 px-3 py-1 text-[11px] font-medium text-emerald-400 backdrop-blur-md shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {project.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-7">
                    <div className="mb-3 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a1f14] text-[#e8a064]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <p className="text-sm leading-6 text-[#a1a1aa] mb-6">
                      {project.description}
                    </p>

                    {/* Technology Stack tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-[#262626] bg-[#1a1a1a] px-2.5 py-1 font-mono text-[11px] text-[#8e8e93]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="flex items-center justify-between border-t border-[#222222] bg-[#121212] px-7 py-4">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e8a064] transition-colors hover:text-[#f0b07a]"
                  >
                    <span>View Live Deployment</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]"
                  >
                    <FaGithub className="h-4 w-4" />
                    <span>Repository</span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Projects CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/contact#contact-form"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2e2e2e] bg-[#141414] px-7 py-3.5 text-sm font-semibold text-[#d4d4d4] transition-all hover:border-[#e8a064]/50 hover:bg-[#1c1c1e] hover:text-[#e8a064]"
          >
            <span>Have a Custom Project in Mind? Let&apos;s Build It</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}