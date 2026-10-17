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
  maxWidthClass = "max-w-3xl",
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
            "mb-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] border",
            light
              ? "border-[#e5e5e3] bg-white text-[#c47a3a]"
              : "border-[rgba(232,160,100,0.25)] bg-[#2a1f14] text-[#e8a064]"
          )}
        >
          {overline}
        </span>
      )}
      <h2
        className={cn(
          "font-heading text-2xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight leading-[1.18] sm:leading-[1.15] text-balance",
          light ? "text-[#111111]" : "text-[#F3F5F7]"
        )}
      >
        {heading}
      </h2>
      {body && (
        <p
          className={cn(
            "mt-4 text-sm sm:text-base lg:text-lg leading-relaxed font-light text-pretty",
            light ? "text-[#525252]" : "text-[#A7B0BC]"
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] leading-normal",
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
