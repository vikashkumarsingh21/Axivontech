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
  primary: "bg-[#5FA8A0] hover:bg-[#6DB8B0] text-[#071918] font-bold shadow-sm",
  secondary: "bg-[#171A1F] hover:bg-[#1E2530] border border-[#22262D] text-[#E6E8EB] font-semibold",
  outline: "bg-transparent hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#22262D] text-[#8B94A1] hover:text-[#E6E8EB] font-medium",
  ghost: "text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F]",
  danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold",
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
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isSpinning ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
