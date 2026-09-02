import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

interface SectionHeaderProps {
  overline?: string;
  heading: React.ReactNode;
  body?: React.ReactNode;
  align?: "left" | "center";
  /** Pass true when the header sits on a light-bg section */
  light?: boolean;
  className?: string;
  maxWidthClass?: string;
}

export function SectionHeader({
  overline,
  heading,
  body,
  align = "center",
  light = false,
  className,
  maxWidthClass = "max-w-2xl",
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col",
        isCenter ? "items-center text-center" : "items-start text-left",
        isCenter && "mx-auto",
        maxWidthClass,
        className
      )}
    >
      {overline && (
        <span
          className={cn(
            "mb-4 text-[11px] font-semibold uppercase tracking-[0.18em]",
            light ? "text-[#c47a3a]" : "text-[#e8a064]"
          )}
        >
          {overline}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl",
          light ? "text-[#111111]" : "text-[#f4f4f5]"
        )}
      >
        {heading}
      </h2>
      {body && (
        <p
          className={cn(
            "mt-4 text-base leading-7 sm:text-lg",
            light ? "text-[#525252]" : "text-[#a1a1aa]"
          )}
        >
          {body}
        </p>
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export function Badge({ children, className, light = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
        light
          ? "border border-[#e5e5e3] bg-white text-[#c47a3a]"
          : "border border-[rgba(232,160,100,0.25)] bg-[#2a1f14] text-[#e8a064]",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Container ─────────────────────────────────────────────────────

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10",
        className
      )}
    >
      {children}
    </Tag>
  );
}

// ── Divider ───────────────────────────────────────────────────────

export function Divider({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <hr
      className={cn(
        "border-0 border-t",
        light ? "border-[#e5e5e3]" : "border-[#262626]",
        className
      )}
    />
  );
}
