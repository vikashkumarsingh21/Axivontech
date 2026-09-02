"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Globe,
  Sprout,
  Waves,
  Building2,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
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
  gradientBg: string;
}

const PROJECTS: Project[] = [
  {
    id: "axivon-technologies",
    title: "Axivon Technologies",
    category: "Business Website",
    description:
      "Modern technology company website showcasing web development, AI solutions, cloud services, and digital transformation capabilities.",
    status: "Completed",
    technologies: ["Next.js", "TypeScript", "Node.js", "JavaScript"],
    liveUrl: "https://axivontech.in/",
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",
    icon: Building2,
    gradientBg: "from-[#1f1915] via-[#141414] to-[#1c140f]",
  },
  {
    id: "krishi-drishti",
    title: "Krishi Drishti",
    category: "Smart Agriculture",
    description:
      "AI-powered smart irrigation platform with IoT sensor monitoring, weather analytics, automated irrigation control, and real-time agricultural insights.",
    status: "Completed",
    technologies: ["HTML", "CSS", "JavaScript", "Firebase", "Node.js", "Bootstrap", "IoT"],
    liveUrl: "https://krishi-drishti.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/KRISHI-DRISHTI",
    icon: Sprout,
    gradientBg: "from-[#111f15] via-[#141414] to-[#0f1c14]",
  },
  {
    id: "jalmitra",
    title: "JalMitra",
    category: "Environmental Technology",
    description:
      "Smart AI-based solar water cleaning system designed to remove floating waste from water bodies using automation and environmental monitoring.",
    status: "Completed",
    technologies: ["HTML", "CSS", "JavaScript", "Firebase", "Node.js", "Bootstrap", "AI", "IoT"],
    liveUrl: "https://jal-mitraafrontend.onrender.com/",
    githubUrl: "https://github.com/vikashkumarsingh21/jalmitra",
    icon: Waves,
    gradientBg: "from-[#0f1f24] via-[#141414] to-[#0f181c]",
  },
  {
    id: "nani-tathagat",
    title: "Nani Tathagat",
    category: "Business Automation",
    description:
      "Business automation and lead generation platform focused on helping companies streamline operations, marketing, sales, and customer engagement.",
    status: "Completed",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js", "SQL", "Bootstrap", "Google Apps Script"],
    liveUrl: "https://nanitathagat.in/",
    githubUrl: "https://github.com/vikashkumarsingh21/nanitathagat",
    icon: Globe,
    gradientBg: "from-[#1c1324] via-[#141414] to-[#140f1a]",
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-[#0f0f0f] py-24 sm:py-28 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <SectionHeader
            overline="Our Work"
            heading={
              <>
                Featured <span className="text-gradient-amber">Projects</span>
              </>
            }
            body="A showcase of real, functional, and highly optimized digital products crafted by our engineering team."
          />
        </motion.div>

        {/* Project cards */}
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
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#262626] bg-[#141414] transition-all duration-200 hover:border-[rgba(232,160,100,0.25)] hover:shadow-lg hover:shadow-[rgba(0,0,0,0.5)]"
              >
                <div>
                  {/* Visual header preview card */}
                  <div
                    className={`relative flex h-48 w-full items-center justify-center bg-gradient-to-br ${project.gradientBg} border-b border-[#262626] p-6`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#303030] bg-[#1c1c1e] shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:border-[#e8a064]/30">
                      <Icon className="h-8 w-8 text-[#e8a064]" strokeWidth={1.5} />
                    </div>

                    {/* Category badge */}
                    <span className="absolute left-4 top-4 rounded-md border border-[#303030] bg-[#1c1c1e]/90 px-2.5 py-1 text-xs font-medium text-[#a1a1aa] shadow-xs">
                      {project.category}
                    </span>

                    {/* Status badge */}
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {project.status}
                    </span>
                  </div>

                  {/* Content area */}
                  <div className="p-6 sm:p-7">
                    <h3 className="mb-2 text-xl font-semibold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-[#a1a1aa]">
                      {project.description}
                    </p>

                    {/* Tech stack tags */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-[#262626] bg-[#1c1c1e] px-2.5 py-1 text-xs font-medium text-[#71717a]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer links */}
                <div className="flex items-center justify-between border-t border-[#262626] px-6 py-4 sm:px-7 bg-[#1c1c1e]/30">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#e8a064] transition-colors hover:text-[#f0b07a]"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#71717a] transition-colors hover:text-[#f4f4f5]"
                  >
                    <FaGithub className="h-4 w-4" />
                    <span>Source Code</span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}