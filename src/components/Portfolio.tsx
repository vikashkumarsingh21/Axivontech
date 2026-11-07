"use client";

import { motion, type Variants } from "framer-motion";
import {
  Globe,
  Sprout,
  Waves,
  Building2,
  UtensilsCrossed,
  Armchair,
  MapPin,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui";
import type { PortfolioProject } from "@/data/portfolio/types";

interface Project {
  id: string;
  title: string;
  category: string;
  industry?: string;
  location?: string;
  description: string;
  status: "Completed" | "Live" | "In Development";
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
}

interface PortfolioProps {
  projects?: PortfolioProject[];
}

const PROJECTS: Project[] = [
  {
    id: "axivon-technologies",
    title: "Axivon Technologies Platform",
    category: "Agency Digital Platform",
    industry: "Digital Engineering & Architecture",
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
    id: "purvarang-family-restaurant",
    title: "Purvarang Family Restaurant",
    category: "Website Development",
    industry: "Restaurant / Food & Hospitality",
    location: "Lalganj, Vaishali, Bihar, India",
    description:
      "Dedicated restaurant website showcasing authentic North Indian, Tandoori, and Chinese culinary offerings with a digital menu, ambiance showcase, and direct customer contact in Lalganj, Vaishali.",
    status: "Live",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "Digital Menu"],
    liveUrl: "https://purvarang-family-restaurant.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    icon: UtensilsCrossed,
    image: "/assets/images/portfolio/purvarang-family-restaurant.jpg",
    imageAlt: "Purvarang Family Restaurant official website and digital menu in Lalganj, Vaishali",
  },
  {
    id: "udaan-furniture",
    title: "Udaan Furniture",
    category: "Website Development",
    industry: "Furniture / Retail / Home Interiors",
    location: "Rajkot, Gujarat, India",
    description:
      "Showroom website presenting residential and office furniture collections across living, bedroom, dining, and workspace interiors for customers in Rajkot, Gujarat.",
    status: "Live",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Showroom Catalog"],
    liveUrl: "https://udaan-furniture.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    icon: Armchair,
    image: "/assets/images/portfolio/udaan-furniture.jpg",
    imageAlt: "Udaan Furniture premium showroom website and collection catalog in Rajkot, Gujarat",
  },
  {
    id: "krishi-drishti",
    title: "Krishi Drishti",
    category: "Smart Agriculture & IoT",
    industry: "Agriculture Technology (AgriTech)",
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
    industry: "Environmental IoT & Water Systems",
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
    industry: "Cultural Archive & Publishing",
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as any } },
};

export default function Portfolio({ projects }: PortfolioProps = {}) {
  const displayedProjects: Project[] =
    projects && projects.length > 0
      ? projects.slice(0, 6).map((p) => {
          const staticMatch = PROJECTS.find((sp) => sp.id === p.id || sp.id === p.slug);
          return {
            id: p.id || p.slug,
            title: p.title,
            category: p.category,
            industry: p.industry || staticMatch?.industry,
            location: p.location || staticMatch?.location,
            description: p.shortDescription || staticMatch?.description || "",
            status: (p.status === "Live" ? "Live" : p.status === "In Development" ? "In Development" : "Completed") as any,
            technologies: p.technologies && p.technologies.length > 0 ? p.technologies : staticMatch?.technologies || [],
            liveUrl: p.liveUrl || staticMatch?.liveUrl || "https://axivontech.in",
            githubUrl: p.githubUrl || staticMatch?.githubUrl || "https://github.com/vikashkumarsingh21/Axivontech",
            icon: staticMatch?.icon || Building2,
            image:
              p.thumbnail && !p.thumbnail.includes("placeholder")
                ? p.thumbnail
                : staticMatch?.image || "/assets/images/portfolio/axivon-studio.jpg",
            imageAlt: `${p.title} - ${p.category}`,
          };
        })
      : PROJECTS;

  return (
    <section id="portfolio" className="relative bg-[#0f0f0f] py-14 sm:py-20 lg:py-28 border-t border-[#1f1f1f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          className="mx-auto mb-10 sm:mb-10 sm:mb-16 max-w-2xl text-center"
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
          {displayedProjects.map((project) => {
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
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a1f14] text-[#e8a064]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    {/* Industry & Location indicators */}
                    {(project.industry || project.location) && (
                      <div className="flex flex-wrap items-center gap-2 mb-3.5 text-xs text-[#8e8e93]">
                        {project.industry && <span>{project.industry}</span>}
                        {project.industry && project.location && <span>•</span>}
                        {project.location && (
                          <span className="text-[#a1a1aa] flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#e8a064]" />
                            {project.location}
                          </span>
                        )}
                      </div>
                    )}

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
                    <span>View Live Website</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]"
                  >
                    <span>Case Study</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Projects CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2e2e2e] bg-[#141414] px-7 py-3.5 text-sm font-semibold text-[#d4d4d4] transition-all hover:border-[#e8a064]/50 hover:bg-[#1c1c1e] hover:text-[#e8a064]"
          >
            <span>Explore Complete Portfolio (6 Live Projects)</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
