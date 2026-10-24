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
    "bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/25 active:scale-[0.98] border border-indigo-400/20",
  secondary:
    "bg-[#1E293B] hover:bg-[#283548] border border-[#334155] hover:border-indigo-500/40 text-[#F8FAFC] font-semibold shadow-sm active:scale-[0.98]",
  outline:
    "bg-transparent hover:bg-indigo-500/10 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 font-medium active:scale-[0.98]",
  ghost:
    "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium active:scale-[0.98]",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-semibold active:scale-[0.98]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-xs rounded-xl gap-2",
  lg: "px-5 py-2.5 text-sm rounded-xl gap-2",
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
