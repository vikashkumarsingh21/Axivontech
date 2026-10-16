import * as React from "react";
import { cn } from "./Button";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "neutral" | "brand" | "info";
  size?: "sm" | "default" | "lg";
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  size = "default",
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full transition-colors",
        {
          // Sizes
          "px-2 py-0.5 text-[11px] gap-1": size === "sm",
          "px-2.5 py-0.5 text-xs gap-1.5": size === "default",
          "px-3 py-1 text-sm gap-2": size === "lg",

          // Variants
          "bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]": variant === "default" || variant === "neutral",
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20": variant === "success" || variant === "brand",
          "bg-amber-500/10 text-amber-400 border border-amber-500/20": variant === "warning",
          "bg-red-500/10 text-red-400 border border-red-500/20": variant === "danger",
          "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20": variant === "info",
        },
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
