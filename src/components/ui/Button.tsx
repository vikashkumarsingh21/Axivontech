import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

// ── Types ────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  href?: string;
  children: React.ReactNode;
}

// ── Button ────────────────────────────────────────────────────────

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1c1c1e] text-[#f4f4f5] border border-[#303030] hover:bg-[#242424] hover:border-[#3f3f46] shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
  secondary:
    "bg-transparent text-[#f4f4f5] border border-[#303030] hover:border-[#e8a064]/40 hover:text-[#e8a064]",
  ghost:
    "bg-transparent text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1c1c1e]",
  accent:
    "bg-[#e8a064] text-[#0f0f0f] border border-transparent hover:bg-[#f0b07a] shadow-[0_4px_16px_rgba(232,160,100,0.25)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm:  "px-4 py-2 text-xs",
  md:  "px-6 py-3 text-sm",
  lg:  "px-7 py-3.5 text-sm",
};

// On light sections (class="section-light")
export const buttonLightVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#111111] text-white border border-[#111111] hover:bg-[#1c1c1e]",
  secondary:
    "bg-transparent text-[#111111] border border-[#e5e5e3] hover:border-[#e8a064] hover:text-[#c47a3a]",
  ghost:
    "bg-transparent text-[#404040] hover:text-[#111111]",
  accent:
    "bg-[#e8a064] text-[#0f0f0f] hover:bg-[#f0b07a] shadow-[0_4px_16px_rgba(232,160,100,0.2)]",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
