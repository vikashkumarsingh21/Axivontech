import React from 'react';

export interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  ariaLabelledBy?: string;
  background?: 'default' | 'subtle';
}

export function Section({
  children,
  id,
  className = '',
  ariaLabelledBy,
  background = 'default'
}: SectionProps) {
  const bgClass = background === 'subtle' ? 'bg-[#111111]' : 'bg-[#0f0f0f]';

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`py-20 sm:py-24 lg:py-32 w-full ${bgClass} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {children}
      </div>
    </section>
  );
}
