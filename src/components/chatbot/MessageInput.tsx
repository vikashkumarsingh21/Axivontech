"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  draftText?: string;
}

const MAX_CHAR_LIMIT = 1000;

export function MessageInput({ onSend, disabled, draftText = "" }: MessageInputProps) {
  const [text, setText] = useState(draftText);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (draftText && !text) {
      setText(draftText);
    }
  }, [draftText]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea dynamically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const charCount = text.length;
  const isNearLimit = charCount > 750;
  const isAtLimit = charCount >= MAX_CHAR_LIMIT;

  return (
    <div className="p-3 sm:p-4 border-t border-[#29313B] bg-[#101318] sm:rounded-b-2xl">
      <div className="relative flex items-end gap-2 rounded-xl border border-[#29313B] bg-[#171C23] p-1.5 focus-within:border-[#10B981]/80 focus-within:ring-1 focus-within:ring-[#10B981]/30 transition-all duration-200">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHAR_LIMIT) {
              setText(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask us anything about Axivon..."
          className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-[14px] sm:text-[13px] text-[#F3F5F7] placeholder-[#7D8795] outline-none scrollbar-thin scrollbar-thumb-[#29313B] disabled:opacity-50"
          rows={1}
          aria-label="Ask Axivon AI Assistant"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          title="Send message (Enter)"
          className="mb-0.5 mr-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#10B981] text-[#04130E] font-semibold transition-all duration-200 hover:bg-[#059669] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-25 disabled:hover:scale-100 disabled:hover:bg-[#10B981] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/40"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Footer Meta / Hints */}
      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[#7D8795]">
        <span className="hidden sm:inline">
          Press <kbd className="font-mono text-[#A7B0BC] bg-[#171C23] border border-[#29313B] px-1 rounded text-[10px]">Enter</kbd> to send, <kbd className="font-mono text-[#A7B0BC] bg-[#171C23] border border-[#29313B] px-1 rounded text-[10px]">Shift+Enter</kbd> for line break
        </span>
        <span className="sm:hidden text-[10px]">Axivon AI Assistant</span>

        {isNearLimit && (
          <span className={`font-mono text-[10px] ${isAtLimit ? "text-red-400 font-semibold" : "text-[#D6B779]"}`}>
            {charCount}/{MAX_CHAR_LIMIT}
          </span>
        )}
      </div>
    </div>
  );
}
