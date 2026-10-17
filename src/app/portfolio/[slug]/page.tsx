import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Code2,
  Calendar,
  Clock,
  User,
  Layers,
  CheckCircle2,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { portfolioProjects, getProjectBySlug } from "@/data/portfolio";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return portfolioProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Case Study Not Found | Axivon Technologies",
      description: "The requested portfolio case study could not be found.",
    };
  }

  const title = project.seoTitle || `${project.title} — Case Study | Axivon Technologies`;
  const description = project.seoDescription || project.shortDescription;
  const canonicalUrl = `https://axivontech.in/portfolio/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Axivon Technologies",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PortfolioCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const otherProjects = portfolioProjects.filter((p) => p.slug !== project.slug);

  const statusColor =
    project.status === "Live"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : project.status === "Completed"
      ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    applicationCategory: project.category,
    operatingSystem: "Web, Cloud, Cross-Platform",
    description: project.shortDescription,
    url: `https://axivontech.in/portfolio/${project.slug}`,
    creator: {
      "@type": "Organization",
      name: "Axivon Technologies",
      url: "https://axivontech.in",
    },
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Portfolio", url: "https://axivontech.in/portfolio" },
          { name: project.title, url: `https://axivontech.in/portfolio/${project.slug}` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Back Navigation Bar */}
      <div className="border-b border-white/5 bg-[#0e0e0e]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#e8a064] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Portfolio</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
            <span>Portfolio</span>
            <span>/</span>
            <span className="text-[#e8a064] truncate max-w-[200px]">{project.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-white/5 bg-gradient-to-b from-[#111111] via-[#0d0d0d] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-[#e8a064]/10 text-[#e8a064] border border-[#e8a064]/20">
                <Layers className="w-3.5 h-3.5" />
                {project.category}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                {project.status}
              </span>
              <span className="text-xs text-gray-500">
                {project.industry}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              {project.title}
            </h1>

            {/* Summary */}
            <p className="text-base sm:text-xl text-gray-300 leading-relaxed font-light mb-8">
              {project.shortDescription}
            </p>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e8a064] hover:bg-[#d4915c] text-black font-semibold text-sm transition-colors shadow-lg shadow-[#e8a064]/10"
                >
                  <span>Visit Live Project</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
                >
                  <Code2 className="w-4 h-4 text-gray-400" />
                  <span>View Repository</span>
                </a>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-sm border border-white/5 transition-colors"
              >
                <span>Request Similar Build</span>
                <ArrowRight className="w-4 h-4 text-[#e8a064]" />
              </Link>
            </div>
          </div>

          {/* Project Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/5">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <User className="w-3.5 h-3.5 text-[#e8a064]" />
                <span>Client / Partner</span>
              </div>
              <p className="text-white font-medium text-sm truncate">{project.client}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e8a064]" />
                <span>Our Role</span>
              </div>
              <p className="text-white font-medium text-sm truncate">{project.role}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-[#e8a064]" />
                <span>Duration</span>
              </div>
              <p className="text-white font-medium text-sm truncate">{project.duration}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#e8a064]" />
                <span>Completion</span>
              </div>
              <p className="text-white font-medium text-sm truncate">{project.completionDate}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Challenge & Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Challenge */}
            <div className="rounded-2xl bg-[#121212] border border-white/10 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/80 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">The Context</span>
                  <h2 className="text-xl font-bold text-white">The Problem & Challenge</h2>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed font-light text-sm sm:text-base">
                {project.problem}
              </p>
              {project.challenge && (
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400 leading-relaxed">
                  <span className="text-white font-medium">Core Constraint: </span>
                  {project.challenge}
                </div>
              )}
            </div>

            {/* The Solution */}
            <div className="rounded-2xl bg-[#121212] border border-white/10 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Our Approach</span>
                  <h2 className="text-xl font-bold text-white">The Engineered Solution</h2>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed font-light text-sm sm:text-base">
                {project.solution}
              </p>
              {project.outcome && (
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400 leading-relaxed">
                  <span className="text-emerald-400 font-medium">Measurable Result: </span>
                  {project.outcome}
                </div>
              )}
            </div>
          </div>

          {/* Full Narrative Overview */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 sm:p-10">
            <h2 className="text-xs uppercase tracking-widest text-[#e8a064] font-semibold mb-2">
              System Architecture & Scope
            </h2>
            <h3 className="text-2xl font-bold text-white mb-6">Detailed Implementation Overview</h3>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-light whitespace-pre-line">
              {project.fullDescription}
            </p>
          </div>

          {/* Key Features & Capabilities */}
          <div>
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest text-[#e8a064] font-semibold">Features</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Delivered Capabilities</h2>
              <p className="text-gray-400 text-sm mt-1">
                Key functionalities designed, developed, and deployed for this solution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#e8a064] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#e8a064]/10 border border-[#e8a064]/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#e8a064]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Technologies & Tools Deployed</h2>
                <p className="text-xs text-gray-500">Frameworks, cloud infrastructure, and libraries</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-gray-300 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Other Projects / Related Work */}
          {otherProjects.length > 0 && (
            <div className="pt-10 border-t border-white/5">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#e8a064] font-semibold">Portfolio</span>
                  <h2 className="text-2xl font-bold text-white mt-1">More Case Studies</h2>
                </div>
                <Link
                  href="/portfolio"
                  className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherProjects.slice(0, 3).map((p) => (
                  <Link
                    key={p.slug}
                    href={`/portfolio/${p.slug}`}
                    className="group block p-6 rounded-2xl bg-[#121212] border border-white/5 hover:border-[#e8a064]/40 transition-all hover:-translate-y-1"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-[#e8a064] font-semibold block mb-2">
                      {p.category}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#e8a064] transition-colors mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                      {p.shortDescription}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium group-hover:text-white">
                      <span>Read Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#e8a064] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Box */}
          <div className="rounded-3xl bg-gradient-to-r from-[#171410] via-[#141414] to-[#101514] border border-[#e8a064]/20 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#e8a064]/10 text-[#e8a064] border border-[#e8a064]/20">
                Partner With Us
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to build something impactful?
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Whether you need web applications, custom software, IoT monitoring, or AI workflows, our engineering team is ready to deliver.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl bg-[#e8a064] hover:bg-[#d4915c] text-black font-semibold text-sm transition-colors shadow-lg shadow-[#e8a064]/15"
                >
                  Start a Free Consultation
                </Link>
                <Link
                  href="/services"
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/10 transition-colors"
                >
                  Explore All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
