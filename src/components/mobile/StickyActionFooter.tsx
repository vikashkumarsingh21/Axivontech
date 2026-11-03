import type { ReactNode } from "react";

interface StickyActionFooterProps {
  children: ReactNode;
  className?: string;
}

export function StickyActionFooter({ children, className = "" }: StickyActionFooterProps) {
  return (
    <div
      className={`fixed bottom-[calc(var(--app-tab-bar-height,56px)+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 p-3 bg-[#121212]/95 backdrop-blur-md border-t border-[#2E2E30] flex items-center gap-3 ${className}`}
    >
      <div className="w-full max-w-lg mx-auto flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
