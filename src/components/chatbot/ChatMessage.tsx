import { Bot, User } from "lucide-react";
import { Message } from "./types";
import { LeadCapture } from "./LeadCapture";

export function ChatMessage({ msg, onLeadComplete, onLeadCancel }: { msg: Message, onLeadComplete: (name: string) => void, onLeadCancel: () => void }) {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex gap-3 w-full mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "justify-end" : "justify-start px-1"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 mt-1 items-center justify-center rounded-[10px] bg-[#2a1f14] border border-[#e8a064]/20 text-[#e8a064] shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] leading-relaxed shadow-sm ${
            isUser
              ? "bg-[#e8a064] text-[#0f0f0f] font-medium rounded-2xl rounded-br-sm"
              : "bg-[#1a1a1c] text-[#f4f4f5] border border-[#262626] rounded-2xl rounded-bl-sm"
          }`}
        >
          <div className="whitespace-pre-wrap">{msg.text}</div>
        </div>
        
        <div className="text-[10px] font-medium text-[#71717a] px-1 opacity-80">
          {msg.timestamp}
        </div>

        {msg.isLeadCapture && (
          <div className="mt-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <LeadCapture onComplete={onLeadComplete} onCancel={onLeadCancel} />
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 mt-1 items-center justify-center rounded-[10px] bg-[#1a1a1c] border border-[#262626] text-[#a1a1aa] shadow-sm">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
