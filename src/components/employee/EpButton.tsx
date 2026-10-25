"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface EpButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-[#4F9D83] hover:bg-[#5BB094] active:bg-[#418671] text-[#0F1A16] font-semibold shadow-xs active:scale-[0.98] border border-[#4F9D83]/30",
  secondary:
    "bg-[#232324] hover:bg-[#28282A] border border-[#2E2E30] hover:border-[#3A3A3D] text-[#EDEBE6] font-medium shadow-xs active:scale-[0.98]",
  outline:
    "bg-transparent hover:bg-[#232324] border border-[#2E2E30] hover:border-[#3A3A3D] text-[#EDEBE6] hover:text-[#EDEBE6] font-medium active:scale-[0.98]",
  ghost:
    "text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#232324] font-medium active:scale-[0.98]",
  danger:
    "bg-[#C46A62]/10 hover:bg-[#C46A62]/20 text-[#C46A62] border border-[#C46A62]/25 font-semibold active:scale-[0.98]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-xs rounded-lg gap-2",
  lg: "px-5 py-2.5 text-sm rounded-lg gap-2",
};

export function EpButton({
  variant = "primary",
  size = "md",
  loading,
  isLoading,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: EpButtonProps) {
  const isSpinning = loading || isLoading;
  return (
    <button
      disabled={disabled || isSpinning}
      className={`inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isSpinning ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
