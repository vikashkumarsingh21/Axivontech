"use client";

import { Bot } from "lucide-react";
import { useReducedMotion } from "framer-motion";

export function TypingIndicator() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex gap-2.5 justify-start animate-in fade-in slide-in-from-bottom-1 duration-200 w-full mb-3">
      {/* Bot Avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1D242D] border border-[#29313B] text-[#10B981] shadow-xs">
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-[#29313B] bg-[#171C23] px-3.5 py-2.5 shadow-xs">
          <span className="text-[11px] font-medium text-[#A7B0BC]">Thinking</span>
          <div className="flex items-center gap-1 ml-1" aria-label="Assistant is thinking">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[#10B981] ${
                shouldReduceMotion ? "opacity-75" : "animate-bounce"
              }`}
              style={{ animationDuration: "1s" }}
            />
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[#10B981] ${
                shouldReduceMotion ? "opacity-75" : "animate-bounce"
              }`}
              style={{ animationDelay: "0.2s", animationDuration: "1s" }}
            />
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[#10B981] ${
                shouldReduceMotion ? "opacity-75" : "animate-bounce"
              }`}
              style={{ animationDelay: "0.4s", animationDuration: "1s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
