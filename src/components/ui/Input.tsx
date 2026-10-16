import * as React from "react";
import { cn } from "./Button";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#566171] pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 sm:h-9 w-full rounded-lg border border-[#29313B] bg-[#10151B] px-3 py-1.5 text-base sm:text-sm text-[#F3F5F7] shadow-xs transition-colors",
            "placeholder:text-[#566171]",
            "focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20",
            "disabled:cursor-not-allowed disabled:bg-[#0B0D10] disabled:text-[#566171] disabled:border-[#1E2530]",
            {
              "pl-9": !!leftIcon,
              "pr-9": !!rightIcon,
              "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20": !!error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#566171]">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
