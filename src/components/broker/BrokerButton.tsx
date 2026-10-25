"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface BrokerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent-ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function BrokerButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  icon,
  iconRight,
  ...props
}: BrokerButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2A878] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0D]";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs md:text-sm px-4 py-2 gap-2",
    lg: "text-sm md:text-base px-5 py-2.5 gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#C2A878] text-[#0A0B0D] hover:bg-[#D4BE92] active:bg-[#A88E5E] font-semibold shadow-sm",
    secondary:
      "bg-transparent text-[#E6E8EB] border border-[#22262D] hover:bg-[#171A1F] hover:border-[#2C313A] active:bg-[#1E232B]",
    ghost:
      "bg-transparent text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] active:bg-[#1E232B]",
    "accent-ghost":
      "bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25 hover:bg-[#C2A878]/15 active:bg-[#C2A878]/20",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 active:bg-red-500/20",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
