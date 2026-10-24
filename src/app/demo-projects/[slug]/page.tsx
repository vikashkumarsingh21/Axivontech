import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DEMO_PROJECTS,
  getDemoProjectBySlug,
  getDemoProjectImage,
  getDemoProjectSlug,
  type DemoProject,
} from "@/data/demo-projects";
import {
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Code2,
  Users2,
  ShieldCheck,
  Compass,
  Cpu,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEMO_PROJECTS.map((project) => ({
    slug: getDemoProjectSlug(project),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getDemoProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Axivon Technologies",
    };
  }

  const title = `${project.name} — ${project.category} Digital Showcase | Axivon Technologies`;
  const description = `${project.shortDescription} Explore interactive frontend architecture created by Axivon Technologies.`;
  const canonicalUrl = `https://axivontech.in/demo-projects/${project.slug || project.id}`;
  const imageUrl = getDemoProjectImage(project);
  const isLive = project.status === "Live Demo";

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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${project.name} Architecture Showcase`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    keywords: [
      project.name,
      project.category,
      "Axivon Technologies",
      "Web Development Demo",
      "Frontend Architecture",
      "Custom Software",
      ...project.features,
    ],
    ...(!isLive && {
      robots: {
        index: false,
        follow: true,
      },
    }),
  };
}

export default async function DemoProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getDemoProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const isLive = project.status === "Live Demo";
  const projectImage = getDemoProjectImage(project);
  const consultationUrl = `/contact?demo=${encodeURIComponent(project.name)}&industry=${encodeURIComponent(project.category)}&service=${encodeURIComponent(project.relatedServiceSlug || "web-development")}#contact-form`;

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://axivontech.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Demo Projects",
            item: "https://axivontech.in/demo-projects",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.name,
            item: `https://axivontech.in/demo-projects/${project.slug || project.id}`,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: project.name,
        applicationCategory: project.category,
        operatingSystem: "Web Browser",
        description: project.shortDescription,
        creator: {
          "@type": "Organization",
          name: "Axivon Technologies",
          url: "https://axivontech.in",
        },
        offers: {
          "@type": "Offer",
          availability: isLive ? "https://schema.org/OnlineOnly" : "https://schema.org/PreOrder",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] selection:bg-[#e8a064] selection:text-[#0a0a0b]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb Navigation Strip ───────────────────────────── */}
      <nav aria-label="Breadcrumbs" className="border-b border-[#262626]/60 bg-[#0d0d0f]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <ol className="flex items-center gap-2 text-xs text-[#71717a] overflow-x-auto whitespace-nowrap">
              <li>
                <Link href="/" className="hover:text-[#f4f4f5] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-[#52525b]" />
              </li>
              <li>
                <Link href="/demo-projects" className="hover:text-[#f4f4f5] transition-colors">
                  Demo Projects
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-[#52525b]" />
              </li>
              <li className="text-[#e8a064] font-medium" aria-current="page">
                {project.name}
              </li>
            </ol>

            <Link
              href="/demo-projects"
              className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#e8a064] transition-colors shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Catalogue</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Dossier Section ──────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-[#262626]">
        {/* Ambient atmospheric glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[420px] w-full max-w-6xl rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.08),_transparent_70%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {/* Top Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(232,160,100,0.3)] bg-[#2a1f14] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#e8a064]">
              <Layers className="h-3 w-3" />
              {project.category}
            </span>

            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Interactive Demonstration
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#1a1a1c] px-3 py-1 text-xs font-medium text-[#a1a1aa]">
                <Clock className="h-3.5 w-3.5 text-[#71717a]" />
                Roadmap Concept • In Development
              </span>
            )}

            {project.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                <Sparkles className="h-3 w-3" />
                Featured Flagship
              </span>
            )}
          </div>

          {/* Project Title and Headline */}
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#f4f4f5] leading-[1.15]">
              {project.name}
            </h1>
            <p className="mt-4 text-base sm:text-lg lg:text-xl text-[#a1a1aa] leading-relaxed">
              {project.shortDescription}
            </p>
          </div>

          {/* Primary Action Button Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {isLive && project.demoUrl ? (
              <Link
                href={project.demoUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8a064] px-7 py-3.5 text-sm font-semibold text-[#0a0a0b] shadow-[0_4px_20px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
              >
                <span>Launch Interactive Demo</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}

            <Link
              href={consultationUrl}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] ${
                isLive
                  ? "border border-[#383838] bg-[#141416] text-[#f4f4f5] hover:border-[#e8a064]/50 hover:bg-[#1a1a1e] hover:text-[#e8a064]"
                  : "bg-[#e8a064] text-[#0a0a0b] hover:bg-[#f0b07a] shadow-[0_4px_20px_rgba(232,160,100,0.25)]"
              }`}
            >
              <span>Request a Similar Website</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* ── Main Showcase Image Preview ──────────────────────────── */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-[#2a2a2e] bg-[#141416] shadow-2xl relative">
            <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-[#18181b]">
              <Image
                src={projectImage}
                alt={`${project.name} Interface Showcase Preview`}
                fill
                priority
                className="object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent opacity-80" />
            </div>

            {/* Bottom Bar on Image Preview */}
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 bg-[#111114] border-t border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f1f23] text-[#e8a064]">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">Verified Architecture Demonstration</p>
                  <p className="text-[11px] text-[#71717a]">Engineered & Tested by Axivon Technologies</p>
                </div>
              </div>

              {isLive && project.demoUrl && (
                <Link
                  href={project.demoUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e8a064] hover:text-[#f0b07a] transition-colors"
                >
                  <span>Experience Live in Fullscreen</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical & Business Architecture Specifications ─────── */}
      <section className="py-16 sm:py-24 border-b border-[#262626] bg-[#0c0c0e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            {/* Left 2 Columns: Problem, Solution & Capabilities */}
            <div className="lg:col-span-2 space-y-12">
              {/* Problem Statement */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e8a064] mb-3">
                  <ShieldCheck className="h-4 w-4" />
                  <span>The Business Challenge</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f4f4f5] tracking-tight mb-4">
                  Why We Engineered This Solution
                </h2>
                <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
                  {project.problemStatement ||
                    `Organizations in the ${project.category} sector often struggle with fragmented digital portals, slow legacy content management systems, and high bounce rates caused by convoluted user journeys.`}
                </p>
              </div>

              {/* Solution Overview */}
              <div className="rounded-2xl border border-[#262626] bg-[#141416] p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
                  <Cpu className="h-4 w-4" />
                  <span>Architectural Solution</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#f4f4f5] tracking-tight mb-3">
                  Production-Grade Digital Blueprint
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed mb-6">
                  {project.solutionOverview ||
                    `Axivon Technologies engineered ${project.name} to demonstrate how modern frontend architectures eliminate friction, boost user engagement, and convert casual visitors into qualified business inquiries.`}
                </p>

                {/* Core Features Grid */}
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71717a] mb-4">
                  Demonstrated Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-start gap-2.5 rounded-xl border border-[#222226] bg-[#0f0f11] p-3.5 text-xs text-[#d4d4d8]"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#e8a064] shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auxiliary Screenshot Gallery (if available) */}
              {project.gallery && project.gallery.length > 1 && (
                <div>
                  <h3 className="text-lg font-bold text-[#f4f4f5] tracking-tight mb-4">
                    Interface Highlights & Subsections
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {project.gallery.slice(1, 4).map((shot, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-[#262626] bg-[#141416] aspect-[4/3] relative group"
                      >
                        <Image
                          src={shot}
                          alt={`${project.name} Detail View ${idx + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Column: Metadata Sidebar */}
            <div className="space-y-6">
              {/* Target Audience Card */}
              <div className="rounded-2xl border border-[#262626] bg-[#141416] p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71717a] mb-3">
                  <Users2 className="h-4 w-4 text-[#e8a064]" />
                  <span>Ideal Customer Profile</span>
                </div>
                <h4 className="text-sm font-bold text-[#f4f4f5] mb-2">Designed For:</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{project.targetAudience}</p>
              </div>

              {/* Technology Stack Card */}
              <div className="rounded-2xl border border-[#262626] bg-[#141416] p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71717a] mb-4">
                  <Code2 className="h-4 w-4 text-[#e8a064]" />
                  <span>Technology Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(project.techStack || ["Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "Lucide React"]).map(
                    (tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-[#2a2a30] bg-[#1c1c20] px-2.5 py-1 text-xs text-[#d4d4d8] font-mono"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Related Axivon Service */}
              <div className="rounded-2xl border border-[#262626] bg-[#141416] p-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e8a064] block mb-2">
                  Related Engineering Capability
                </span>
                <h4 className="text-sm font-bold text-[#f4f4f5] mb-2">Bespoke Production Deployment</h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">
                  Axivon Technologies provides turnkey development, custom CMS integration, cloud hosting setup, and SLA support for platforms like {project.name}.
                </p>
                <Link
                  href={consultationUrl}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222226] hover:bg-[#2c2c32] border border-[#303036] px-4 py-2.5 text-xs font-semibold text-[#f4f4f5] transition-colors"
                >
                  <span>Commission Similar Build</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#e8a064]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing Call to Action ─────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-24 border-t border-[#262626] bg-[#080809]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-72 w-full max-w-4xl rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.06),_transparent_70%)]"
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8a064] mb-3 block">
            CUSTOM SOFTWARE & DIGITAL PRODUCTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f4f4f5] tracking-tight">
            Ready to Bring a Similar Solution to Life?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
            Every business has unique workflows and brand requirements. We tailor architectures to match your specific operational goals, user journeys, and scaling targets.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={consultationUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8a064] px-8 py-3.5 text-sm font-semibold text-[#0a0a0b] shadow-[0_4px_20px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
            >
              <span>Schedule Architecture Consultation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo-projects"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#262626] bg-[#141416] px-6 py-3.5 text-sm font-medium text-[#a1a1aa] hover:border-[#383838] hover:text-[#f4f4f5] transition-colors"
            >
              <span>Browse All Demo Projects</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
