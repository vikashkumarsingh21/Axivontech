import { Code2, Compass, Cpu, Layers, Rocket, Users } from "lucide-react";

const REASONS = [
  {
    icon: Code2,
    title: "Practical Engineering Experience",
    description:
      "Contribute to real production applications, databases, and enterprise platforms rather than synthetic toy projects.",
  },
  {
    icon: Cpu,
    title: "Exposure to Modern Tech",
    description:
      "Build with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, and modern LLM APIs.",
  },
  {
    icon: Users,
    title: "Mentorship & Code Reviews",
    description:
      "Receive constructive, hands-on feedback on your pull requests, architectural decisions, and code quality.",
  },
  {
    icon: Compass,
    title: "Flexible Remote Culture",
    description:
      "Collaborate asynchronously from anywhere in India with a strong culture focused on clear outcomes and personal responsibility.",
  },
  {
    icon: Layers,
    title: "Cross-Disciplinary Learning",
    description:
      "Collaborate closely across frontend, backend, design, and AI automation to broaden your full-stack perspectives.",
  },
  {
    icon: Rocket,
    title: "Path to Full-Time Roles",
    description:
      "Top-performing interns who demonstrate technical rigor and dedication are prioritized for full-time junior developer positions.",
  },
];

export default function WhyWorkWithUs() {
  return (
    <section id="why-axivon" className="py-16 sm:py-24 bg-[#101318] border-b border-[#1E2530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            Culture & Environment
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F3F5F7] tracking-tight mt-2 mb-4">
            Why Build Your Career at Axivon?
          </h2>
          <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed font-light">
            We offer an engineering-first environment where early-career developers and designers can build meaningful experience on production systems.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-[#151A21] border border-[#29313B] hover:border-[#10B981]/40 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center text-[#10B981] mb-5 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F3F5F7] mb-2.5">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-[#A7B0BC] leading-relaxed font-light">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
