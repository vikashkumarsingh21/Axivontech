import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  header?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, header, description, footer, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-[18px] border border-[#2B323D] bg-[#1B212A] shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
          className
        )}
        {...props}
      >
        {(header || description) && (
          <div className="flex flex-col gap-1 border-b border-[#2B323D] px-6 py-5">
            {header && (
              <div className="text-base font-semibold text-white">
                {header}
              </div>
            )}
            {description && (
              <div className="text-sm text-[#B7BDC7]">{description}</div>
            )}
          </div>
        )}

        {children && <div className="flex-1 px-6 py-5">{children}</div>}

        {footer && (
          <div className="border-t border-[#2B323D] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

export { Card };
export default Card;