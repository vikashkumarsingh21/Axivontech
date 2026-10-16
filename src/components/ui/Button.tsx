import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none touch-manipulation active:scale-[0.98]",
          {
            // Primary Brand
            "bg-emerald-500 text-[#04130E] hover:bg-emerald-600 active:bg-emerald-700 shadow-xs focus-visible:ring-emerald-500":
              variant === "default" || variant === "primary",

            // Secondary Neutral
            "bg-[#1B222B] text-[#A7B0BC] border border-[#29313B] hover:bg-[#202833] hover:text-[#F3F5F7] shadow-xs focus-visible:ring-[#364152]":
              variant === "secondary",

            // Outline
            "border border-[#29313B] bg-transparent hover:bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] focus-visible:ring-[#364152]":
              variant === "outline",

            // Ghost
            "hover:bg-[#202833] text-[#7E8997] hover:text-[#F3F5F7] focus-visible:ring-[#364152]":
              variant === "ghost",

            // Danger
            "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 focus-visible:ring-red-500":
              variant === "danger",

            // Sizing (touch-friendly on mobile)
            "h-10 sm:h-9 px-4 py-2 text-sm rounded-lg gap-2": size === "default" || size === "md",
            "h-9 sm:h-8 px-3 text-xs rounded-md gap-1.5": size === "sm",
            "h-12 sm:h-10 px-6 text-base rounded-lg gap-2.5": size === "lg",
            "h-10 sm:h-9 w-10 sm:w-9 p-0 rounded-lg": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";
