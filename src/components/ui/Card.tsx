import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  children?: ReactNode;
  className?: string;
  header?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "muted" | "dark";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      header,
      title,
      description,
      action,
      footer,
      variant = "default",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-xl transition-all",
          {
            "bg-[#151A21] border border-[#29313B] shadow-xs text-[#F3F5F7]":
              variant === "default",
            "bg-[#101318] border border-[#1E2530] text-[#F3F5F7]":
              variant === "muted",
            "bg-[#151A21] border border-[#29313B] text-[#F3F5F7]":
              variant === "dark",
          },
          className
        )}
        {...props}
      >
        {(header || title || description || action) && (
          <div className="flex items-start justify-between gap-4 border-b border-[#1E2530] px-6 py-4.5">
            <div className="flex flex-col gap-0.5">
              {title && (
                <div className="text-base font-semibold text-[#F3F5F7] tracking-tight">
                  {title}
                </div>
              )}
              {header && !title && (
                <div className="text-base font-semibold text-[#F3F5F7] tracking-tight">
                  {header}
                </div>
              )}
              {description && (
                <div className="text-xs text-[#7E8997] font-normal">
                  {description}
                </div>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}

        {children}

        {footer && (
          <div className="border-t border-[#1E2530] bg-[#101318]/50 px-6 py-3.5 rounded-b-xl text-xs text-[#7E8997]">
            {footer}
          </div>
        )}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-none tracking-tight text-[#F3F5F7]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-[#7E8997]", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
