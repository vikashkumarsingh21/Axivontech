import React from "react";

interface BrokerCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function BrokerCard({
  children,
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  className = "",
  ...props
}: BrokerCardProps) {
  return (
    <div
      className={`rounded-xl border border-[#22262D] bg-[#111317] text-[#E6E8EB] shadow-sm transition-colors hover:border-[#2C313A] flex flex-col ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E232B] gap-4">
          <div>
            {typeof title === "string" ? (
              <h3 className="text-sm font-semibold text-[#E6E8EB] tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[#8B94A1] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`flex-1 ${noPadding ? "" : "p-5"}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-[#1E232B] bg-[#0E1013] rounded-b-xl text-xs text-[#8B94A1]">
          {footer}
        </div>
      )}
    </div>
  );
}
