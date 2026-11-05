import type { ReactNode } from "react";

interface StickyActionFooterProps {
  children: ReactNode;
  className?: string;
}

export function StickyActionFooter({ children, className = "" }: StickyActionFooterProps) {
  return (
    <div
      className={`fixed bottom-[calc(var(--app-tab-bar-height,56px)+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex items-center gap-3 ${className}`}
    >
      <div className="w-full max-w-lg mx-auto flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
