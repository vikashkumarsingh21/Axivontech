"use client";

import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Globe,
  Smartphone,
  Cpu,
  Layers,
  Send,
  HelpCircle,
} from "lucide-react";

interface ChatWelcomeProps {
  onSelect: (text: string) => void;
  heading?: string;
  subtitle?: string;
  actions?: string[];
}

const DEFAULT_PROMPTS = [
  { label: "Explore Core Services", icon: Layers },
  { label: "Website & SaaS Engineering", icon: Globe },
  { label: "Mobile App Development", icon: Smartphone },
  { label: "AI & Workflow Automation", icon: Cpu },
  { label: "Discuss My Project Requirements", icon: Send },
  { label: "How Axivon Delivers Projects", icon: HelpCircle },
];

export function ChatWelcome({
  onSelect,
  heading = "How can we assist you with your digital project today?",
  subtitle = "I am your direct connection to Axivon Technologies. Ask questions about our engineering services, verify our tech stack, or discuss your upcoming software build.",
  actions,
}: ChatWelcomeProps) {
  // If dynamic actions are provided from config, use them, otherwise use structured defaults
  const actionItems = actions && actions.length > 0
    ? actions.map((label, idx) => {
        const found = DEFAULT_PROMPTS.find((p) => p.label.toLowerCase() === label.toLowerCase());
        return {
          label,
          icon: found ? found.icon : (idx % 2 === 0 ? Sparkles : ArrowRight),
        };
      })
    : DEFAULT_PROMPTS;

  return (
    <div className="flex flex-col p-5 sm:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Brand Hero Card */}
      <div className="flex flex-col items-center text-center rounded-2xl border border-[#29313B] bg-[#171C23] p-5 shadow-xs">
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D242D] border border-[#29313B] shadow-inner">
          <Image
            src="/assets/logo/logo-icon.png"
            alt="Axivon Technologies"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <Sparkles className="h-6 w-6 text-[#10B981] hidden only:block" />
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#101318]">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[10.5px] font-mono font-medium text-[#10B981] mb-2.5">
          <Sparkles className="h-3 w-3" />
          Axivon Engineering Assistant
        </div>

        <h4 className="text-[15px] sm:text-base font-semibold text-[#F3F5F7] tracking-tight text-balance">
          {heading}
        </h4>
        <p className="mt-1.5 text-xs text-[#A7B0BC] leading-relaxed max-w-[300px] text-pretty font-normal">
          {subtitle}
        </p>
      </div>

      {/* Suggested Actions Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7D8795]">
            Quick Prompts
          </span>
          <span className="text-[11px] text-[#7D8795]">One-click inquiry</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {actionItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className="group flex items-center justify-between rounded-xl border border-[#29313B] bg-[#171C23] px-3.5 py-3 text-left transition-all duration-200 hover:border-[#10B981]/50 hover:bg-[#1D242D] hover:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#101318] border border-[#29313B] text-[#10B981] group-hover:border-[#10B981]/30 transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-[#F3F5F7] group-hover:text-white transition-colors truncate">
                  {label}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#7D8795] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#10B981]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
