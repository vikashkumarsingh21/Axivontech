import { Sparkles, ArrowRight } from "lucide-react";

const ACTIONS = [
  "Explore Services",
  "Get a Project Quote",
  "Build a Website",
  "AI & Automation",
];

export function ChatWelcome({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-col p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex h-14 w-14 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2a1f14] to-[#141414] border border-[#e8a064]/20 text-[#e8a064] mb-2 shadow-[0_8px_24px_rgba(232,160,100,0.15)]">
          <Sparkles className="h-6 w-6 sm:h-5 sm:w-5" />
        </div>
        <h4 className="text-[17px] sm:text-base font-semibold text-[#f4f4f5] tracking-tight">How can we help you build something better?</h4>
        <p className="text-[13px] sm:text-xs text-[#a1a1aa] leading-relaxed max-w-[260px]">
          I can help you explore Axivon's services, technology capabilities, projects, and solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => onSelect(action)}
            className="group flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] px-4 py-3.5 sm:py-3 text-[13px] sm:text-xs font-medium text-[#d4d4d4] transition-all hover:border-[#e8a064]/40 hover:bg-[#1c1c1e] hover:text-[#f4f4f5] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
          >
            <span>{action}</span>
            <ArrowRight className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#52525b] transition-all group-hover:translate-x-0.5 group-hover:text-[#e8a064]" />
          </button>
        ))}
      </div>
    </div>
  );
}
