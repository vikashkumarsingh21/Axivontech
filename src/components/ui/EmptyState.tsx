import React from "react";
import Link from "next/link";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#29313B] bg-[#151A21]/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center text-[#7E8997] mb-4">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-[#F3F5F7] tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-[#7E8997] max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button variant="primary" size="sm">
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="sm" onClick={action.onClick}>
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="secondary" size="sm">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
