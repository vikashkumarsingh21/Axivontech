export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 w-full mb-4 px-1">
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm border border-[#262626] bg-[#1a1a1c] px-4 py-3 shadow-sm">
          <span className="text-[11px] font-semibold tracking-wide text-[#a1a1aa] uppercase">Thinking</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8a064] opacity-80" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8a064] opacity-80 [animation-delay:0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8a064] opacity-80 [animation-delay:0.3s]" />
          </div>
        </div>
      </div>
    </div>
  );
}
