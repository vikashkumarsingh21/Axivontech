import { FileText, Search, MessageSquare, Rocket } from "lucide-react";
import { RECRUITMENT_STAGES } from "@/data/careers";

const STAGE_ICONS = [FileText, Search, MessageSquare, Rocket];

export default function HiringProcess() {
  return (
    <section id="hiring-process" className="py-16 sm:py-24 bg-[#101318] border-b border-[#1E2530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            How We Hire
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F3F5F7] tracking-tight mt-2 mb-4">
            Our Recruitment Process
          </h2>
          <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed font-light">
            We keep our hiring process transparent, efficient, and respectful of your time. Here is what you can expect after applying.
          </p>
        </div>

        {/* 4-Step Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {RECRUITMENT_STAGES.map((stage, idx) => {
            const Icon = STAGE_ICONS[idx] || FileText;
            return (
              <div
                key={stage.number}
                className="relative p-6 sm:p-7 rounded-2xl bg-[#151A21] border border-[#29313B] flex flex-col justify-between hover:border-[#10B981]/40 transition-colors group"
              >
                <div>
                  {/* Step Number + Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black font-mono text-[#D6B779]/80 group-hover:text-[#D6B779] transition-colors">
                      {stage.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center text-[#10B981] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#F3F5F7] mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed font-light">
                    {stage.description}
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
