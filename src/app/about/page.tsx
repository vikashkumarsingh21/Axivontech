import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, PlayCircle, Shield, Code, Cpu, Target, Briefcase, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Axivon Technologies | Website & Software Development Company",
  description:
    "Learn about Axivon Technologies, founded by Vikash Kumar. We specialize in Website Development, Mobile App Development, AI Solutions, UI/UX Design and Custom Software Development.",
  alternates: {
    canonical: "https://axivontech.in/about",
  },
  openGraph: {
    title: "About Axivon Technologies",
    description:
      "Discover our mission, vision, values, executive leadership and technology solutions that help businesses grow digitally.",
    url: "https://axivontech.in/about",
    siteName: "Axivon Technologies",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Axivon Technologies",
    description:
      "Learn more about Axivon Technologies and our digital transformation services.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <main className="bg-[#0a0a0a] text-white selection:bg-[#e8a064] selection:text-[#0a0a0a] min-h-screen font-sans">
      
      {/* 01 — ABOUT HERO */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center pt-24 overflow-hidden border-b border-white/[0.05]">
        {/* Video Background Layer */}
        <div className="absolute inset-0 z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/images/team/vikas-kumar-founder.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.35]"
          >
            <source src="/assets/about/hero/axivon-about-hero-team.mp4" type="video/mp4" />
          </video>
          {/* Subtle gradient overlay to ensure text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#e8a064]/50" />
              About Axivon
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-bold leading-[1.05] tracking-tight mb-8">
              Building Digital Products, <br className="hidden md:block" />
              AI Systems &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Intelligent Technology.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed font-light mb-10">
              Axivon Technologies builds digital products, AI solutions, automation systems and custom software for businesses that want technology to solve real problems.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/contact"
                className="bg-[#e8a064] text-[#1a1a1a] px-8 py-4 rounded-sm font-semibold hover:bg-white transition-colors duration-300"
              >
                Start a Conversation
              </Link>
              <Link
                href="#story"
                className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors duration-300 uppercase tracking-widest text-xs font-semibold"
              >
                Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — COMPANY INTRODUCTION */}
      <section id="story" className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Who We Are
              </h2>
            </div>
            <div className="lg:col-span-8">
              <h3 className="text-3xl md:text-4xl font-medium leading-snug mb-8 text-white">
                We are a technology company focused on delivering resilient architecture and intuitive user experiences.
              </h3>
              <div className="text-gray-400 space-y-6 text-lg leading-relaxed max-w-3xl font-light">
                <p>
                  Axivon Technologies was founded with a vision to help businesses embrace digital transformation through modern technology solutions. We believe every business deserves access to enterprise-grade infrastructure.
                </p>
                <p>
                  Whether we are engineering complex custom software, developing consumer mobile applications, or implementing machine learning automation, our focus remains on outcomes rather than just deliverables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — WHAT WE BELIEVE / OUR APPROACH */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Our Approach
              </h2>
              <p className="text-gray-400 text-sm max-w-xs mt-6">
                The core principles that guide how we engineer software and design digital products.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                {/* Principle 1 */}
                <div>
                  <div className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center mb-6">
                    <span className="text-[#e8a064] font-mono text-sm">01</span>
                  </div>
                  <h4 className="text-xl font-medium mb-3">Understand the Problem First</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    We don't write code until we deeply understand the business context. Solutions are only valuable if they solve the right problem.
                  </p>
                </div>
                {/* Principle 2 */}
                <div>
                  <div className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center mb-6">
                    <span className="text-[#e8a064] font-mono text-sm">02</span>
                  </div>
                  <h4 className="text-xl font-medium mb-3">Build for Real Users</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    Technology should adapt to humans, not the other way around. We prioritize usability, accessibility, and intuitive design.
                  </p>
                </div>
                {/* Principle 3 */}
                <div>
                  <div className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center mb-6">
                    <span className="text-[#e8a064] font-mono text-sm">03</span>
                  </div>
                  <h4 className="text-xl font-medium mb-3">Keep Systems Maintainable</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    We architect clean, scalable codebases. A successful product is one that can evolve safely long after the initial launch.
                  </p>
                </div>
                {/* Principle 4 */}
                <div>
                  <div className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center mb-6">
                    <span className="text-[#e8a064] font-mono text-sm">04</span>
                  </div>
                  <h4 className="text-xl font-medium mb-3">Measure Outcomes</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    We rely on data and analytics to validate our decisions. Every deployment is an opportunity to learn and improve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 & 05 — WHAT WE BUILD & CAPABILITIES */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-20">
            <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6">
              What We Build
            </h2>
            <h3 className="text-3xl md:text-5xl font-medium leading-tight max-w-3xl">
              From robust enterprise architecture to precise consumer experiences.
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-20 mb-20">
            <div className="space-y-4">
              <Code className="w-6 h-6 text-[#e8a064]" />
              <h4 className="text-xl font-medium">Digital Products & Apps</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Full-cycle development of Web Applications, SaaS platforms, and native Mobile Applications designed for scale and performance.
              </p>
            </div>
            <div className="space-y-4">
              <Cpu className="w-6 h-6 text-[#e8a064]" />
              <h4 className="text-xl font-medium">AI & ML Systems</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Intelligent automation, predictive models, data processing pipelines, and integration of Large Language Models into existing workflows.
              </p>
            </div>
            <div className="space-y-4">
              <Shield className="w-6 h-6 text-[#e8a064]" />
              <h4 className="text-xl font-medium">Custom Enterprise Software</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Internal portals, CRM systems, secure databases, and cloud infrastructure modernization tailored to complex operational needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <h4 className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-6">Technology Stack</h4>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
              <div className="space-y-3">
                <span className="block text-white font-medium border-b border-white/10 pb-2">Frontend</span>
                <ul className="text-gray-400 text-sm space-y-2 font-light">
                  <li>Next.js</li>
                  <li>React</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="block text-white font-medium border-b border-white/10 pb-2">Backend</span>
                <ul className="text-gray-400 text-sm space-y-2 font-light">
                  <li>Node.js</li>
                  <li>Python</li>
                  <li>Express</li>
                  <li>REST & GraphQL</li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="block text-white font-medium border-b border-white/10 pb-2">Database</span>
                <ul className="text-gray-400 text-sm space-y-2 font-light">
                  <li>PostgreSQL</li>
                  <li>Prisma ORM</li>
                  <li>Firebase</li>
                  <li>Redis</li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="block text-white font-medium border-b border-white/10 pb-2">Cloud & AI</span>
                <ul className="text-gray-400 text-sm space-y-2 font-light">
                  <li>AWS / Vercel</li>
                  <li>Docker</li>
                  <li>Machine Learning</li>
                  <li>IoT Integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — HOW WE WORK */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Process
              </h2>
            </div>
            <div className="lg:col-span-8">
              <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-16 pb-8">
                
                <div className="relative pl-10">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#0e0e0e] border-2 border-[#e8a064]" />
                  <h4 className="text-xl font-medium text-white mb-2">01. Understand & Plan</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    We align on business objectives, user needs, and technical constraints. We define the project scope, architecture, and timeline before writing a single line of code.
                  </p>
                </div>
                
                <div className="relative pl-10">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#0e0e0e] border-2 border-white/20" />
                  <h4 className="text-xl font-medium text-white mb-2">02. Design & Prototype</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    We map out user journeys and create intuitive interfaces. Prototypes ensure we validate usability and visual direction early.
                  </p>
                </div>

                <div className="relative pl-10">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#0e0e0e] border-2 border-white/20" />
                  <h4 className="text-xl font-medium text-white mb-2">03. Build & Validate</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    Our engineering team develops the product using modern, scalable practices. Continuous testing guarantees security, performance, and reliability.
                  </p>
                </div>

                <div className="relative pl-10">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#0e0e0e] border-2 border-white/20" />
                  <h4 className="text-xl font-medium text-white mb-2">04. Launch & Improve</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    We handle deployment and infrastructure. Post-launch, we monitor analytics and user feedback to iterate and optimize the system.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08 — HUMAN / FOUNDER SECTION */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-16 md:mb-24 max-w-2xl">
            <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4">
              Our Leadership
            </h2>
            <h3 className="text-3xl md:text-5xl font-medium leading-tight">
              The people behind Axivon Technologies.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Founder Profile */}
            <div className="flex flex-col group">
              <div className="relative aspect-[4/5] w-full max-w-[280px] mb-8 overflow-hidden bg-[#111] border border-white/10 rounded-sm">
                <Image
                  src="/assets/images/team/vikas-kumar-founder.jpg"
                  alt="Vikas Kumar, Founder of Axivon Technologies"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <h4 className="text-2xl font-medium text-white mb-1">Vikas Kumar</h4>
              <p className="text-[#e8a064] text-sm font-semibold mb-4">Founder</p>
              <div className="text-gray-400 font-light leading-relaxed space-y-4 max-w-sm">
                <p>
                  <strong className="text-gray-300 font-medium">Focus:</strong> Strategic Direction, Software Architecture & AI Innovation
                </p>
                <p className="italic text-gray-500 border-l-2 border-[#e8a064]/30 pl-4 py-1">
                  "Building purposeful digital solutions that turn ambitious ideas into market leadership."
                </p>
              </div>
            </div>

            {/* Co-Founder Profile */}
            <div className="flex flex-col group">
              <div className="relative aspect-[4/5] w-full max-w-[280px] mb-8 overflow-hidden bg-[#111] border border-white/10 rounded-sm">
                <Image
                  src="/assets/images/team/rokhiya-khanam-cofounder.jpg"
                  alt="P. Rokhiya Khanam, Co-Founder of Axivon Technologies"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <h4 className="text-2xl font-medium text-white mb-1">P. Rokhiya Khanam</h4>
              <p className="text-[#e8a064] text-sm font-semibold mb-4">Co-Founder</p>
              <div className="text-gray-400 font-light leading-relaxed space-y-4 max-w-sm">
                <p>
                  <strong className="text-gray-300 font-medium">Focus:</strong> Operational Excellence, Client Experience & Business Growth
                </p>
                <p className="italic text-gray-500 border-l-2 border-[#e8a064]/30 pl-4 py-1">
                  "Ensuring every client engagement achieves real business results and flawless execution."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — COMPANY JOURNEY / MILESTONES */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4">
                Milestones
              </h2>
              <h3 className="text-3xl font-medium">The Journey</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            <div className="bg-[#0e0e0e] p-8">
              <span className="text-[#e8a064] font-mono text-xl mb-4 block">2026</span>
              <h4 className="text-lg font-medium text-white mb-3">Company Founded</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Axivon Technologies launched with a mission to make modern, future-ready technology accessible to every business.
              </p>
            </div>
            <div className="bg-[#0e0e0e] p-8">
              <span className="text-[#e8a064] font-mono text-xl mb-4 block">2026</span>
              <h4 className="text-lg font-medium text-white mb-3">First Client Project</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Successfully delivered our first major enterprise software project, establishing our reputation for quality.
              </p>
            </div>
            <div className="bg-[#0e0e0e] p-8">
              <span className="text-[#e8a064] font-mono text-xl mb-4 block">2026</span>
              <h4 className="text-lg font-medium text-white mb-3">Website Launch</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Launched our official digital presence, reflecting our capabilities in web, mobile, and AI technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — FAQ */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Frequently Asked
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-2">
              
              <details className="group border-b border-white/10 pb-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between py-4 text-lg font-medium text-white">
                  What types of businesses do you work with?
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-500">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <div className="text-gray-400 font-light leading-relaxed pb-4 pr-8">
                  We partner with ambitious startups, growing mid-market companies, and established enterprises across industries like healthcare, education, retail, and manufacturing who need reliable digital solutions.
                </div>
              </details>

              <details className="group border-b border-white/10 pb-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between py-4 text-lg font-medium text-white">
                  Do you build custom software?
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-500">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <div className="text-gray-400 font-light leading-relaxed pb-4 pr-8">
                  Yes. A significant portion of our work involves architecting and developing bespoke software, internal tools, and CRM systems that out-of-the-box solutions cannot support.
                </div>
              </details>

              <details className="group border-b border-white/10 pb-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between py-4 text-lg font-medium text-white">
                  How does a typical project start?
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-500">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <div className="text-gray-400 font-light leading-relaxed pb-4 pr-8">
                  Every engagement begins with a discovery conversation. We discuss your business goals, technical challenges, and timeline. From there, we provide a structured proposal outlining architecture, scope, and deliverables.
                </div>
              </details>

            </div>
          </div>
        </div>
      </section>

      {/* 12 — FINAL CTA */}
      <section className="py-20 sm:py-14 sm:py-20 lg:py-32 bg-[#e8a064] text-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-medium mb-8 max-w-2xl mx-auto">
            Have a problem worth solving? Let's talk about what you're building.
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-[#0a0a0a] text-white px-8 py-4 rounded-sm font-semibold hover:bg-[#1a1a1a] transition-colors duration-300"
          >
            Start a Conversation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  );
}

