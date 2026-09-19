import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function MessageInput({ onSend, disabled }: { onSend: (text: string) => void, disabled: boolean }) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 sm:p-5 border-t border-[#262626] bg-[#0c0c0d] sm:rounded-b-2xl">
      <div className="relative flex items-end gap-2 rounded-2xl border border-[#303030] bg-[#141414] p-1.5 focus-within:border-[#e8a064]/60 focus-within:ring-1 focus-within:ring-[#e8a064]/30 focus-within:shadow-[0_4px_16px_rgba(232,160,100,0.08)] transition-all duration-300">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message Axivon AI..."
          className="max-h-[120px] min-h-[44px] w-full resize-none bg-transparent px-3 py-3 text-[15px] sm:text-[14px] text-[#f4f4f5] placeholder-[#71717a] outline-none scrollbar-thin scrollbar-thumb-[#262626] disabled:opacity-50"
          rows={1}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="mb-1 mr-1 flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8a064] text-[#0f0f0f] shadow-sm transition-all duration-200 hover:bg-[#d4915c] hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:bg-[#e8a064] disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
        >
          <Send className="h-4 w-4 sm:h-4 sm:w-4" />
        </button>
      </div>
      <div className="mt-2.5 text-center hidden sm:block">
        <span className="text-[10px] font-medium text-[#52525b]">Press <kbd className="font-mono text-[#71717a] mx-0.5 bg-[#1a1a1c] px-1 rounded">Enter</kbd> to send, <kbd className="font-mono text-[#71717a] mx-0.5 bg-[#1a1a1c] px-1 rounded">Shift + Enter</kbd> for new line</span>
      </div>
    </div>
  );
}
