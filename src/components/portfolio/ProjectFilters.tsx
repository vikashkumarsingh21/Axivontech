import React from 'react';
import { portfolioCategories } from '@/data/portfolio';

interface ProjectFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProjectFilters({
  activeCategory,
  onCategoryChange,
}: ProjectFiltersProps) {
  return (
    <nav aria-label="Filter projects by category" className="mb-8">
      <div className="flex flex-wrap gap-3">
        {portfolioCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] ${
                isActive
                  ? 'bg-[#e8a064] text-[#0f0f0f] font-semibold'
                  : 'bg-[#1a1a1a] text-[#a1a1aa] hover:bg-[#222] hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
