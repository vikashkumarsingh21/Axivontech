import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BrokerPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  backHref?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function BrokerPageHeader({
  title,
  subtitle,
  badge,
  backHref,
  breadcrumbs,
  actions,
  className = "",
}: BrokerPageHeaderProps) {
  return (
    <div className={`mb-6 md:mb-8 space-y-2 ${className}`}>
      {/* Breadcrumbs or Back Link */}
      {(backHref || (breadcrumbs && breadcrumbs.length > 0)) && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8B94A1] mb-2 font-mono">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-[#8B94A1] hover:text-[#C2A878] transition-colors mr-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          )}
          {breadcrumbs?.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#566171]">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#E6E8EB] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#E6E8EB]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#E6E8EB]">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-[#8B94A1] mt-1 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
