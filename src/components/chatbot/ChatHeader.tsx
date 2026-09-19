import { X, Sparkles, Minimize2 } from "lucide-react";

export function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[#262626] bg-[#141414] px-5 py-4 sm:rounded-t-2xl z-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#2a1f14] border border-[#e8a064]/20 text-[#e8a064] shadow-sm">
          <Sparkles className="h-4 w-4 sm:h-4 sm:w-4" />
        </div>
        <div>
          <h3 className="text-[15px] sm:text-sm font-semibold text-[#f4f4f5] tracking-tight">AXIVON AI</h3>
          <p className="text-[11px] font-medium text-[#71717a]">Business & Technology Assistant</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onClose}
          aria-label="Close AI Assistant"
          className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-[#a1a1aa] hover:bg-[#1c1c1e] hover:text-[#f4f4f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
        >
          <X className="h-5 w-5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}
