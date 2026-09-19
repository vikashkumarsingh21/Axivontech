"use client";

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioProjects } from '@/data/portfolio';
import { PortfolioProject } from '@/data/portfolio/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import ProjectFilters from './ProjectFilters';

export default function ProjectGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const shouldReduceMotion = useReducedMotion();

  const filteredProjects = portfolioProjects.filter((project: PortfolioProject) => 
    activeCategory === 'All' ? true : project.category === activeCategory
  );

  return (
    <section id="all-projects" className="bg-[#0f0f0f] py-20 sm:py-14 sm:py-20 lg:py-32" aria-labelledby="all-projects-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="all-projects-heading" className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5] mb-4">All Projects</h2>
        <p className="text-[#a1a1aa] text-lg max-w-xl mb-10">Browse our complete portfolio of work.</p>
        
        <ProjectFilters 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProjects.map((project: PortfolioProject, index: number) => {
            const isFirst = index === 0;
            const cardClasses = `bg-[#141414] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors rounded-xl overflow-hidden flex flex-col ${isFirst ? 'lg:col-span-2' : ''}`;
            
            const statusColor = project.status === 'Live' ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#60a5fa]/10 text-[#60a5fa]';
            
            const content = (
              <article role="article" className="h-full flex flex-col">
                <div className="w-full relative overflow-hidden">
                  {project.thumbnail && !project.thumbnail.includes("thumbnail.webp") ? (
                    <div className={`relative w-full ${isFirst ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                      <Image
                        src={project.thumbnail}
                        alt={`${project.title} - representative industry imagery`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes={isFirst ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"}
                      />
                    </div>
                  ) : (
                    <ImagePlaceholder 
                      aspectRatio={isFirst ? '16/9' : '4/3'} 
                      label="Project Thumbnail" 
                      alt={project.title}
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="uppercase text-[11px] tracking-widest text-[#e8a064]">
                      {project.category}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColor}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[#f4f4f5] mb-2">{project.title}</h3>
                  <p className="text-sm text-[#a1a1aa] line-clamp-2 mb-6 flex-grow">{project.shortDescription}</p>
                  
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.slice(0, 4).map(tech => (
                        <span key={tech} className="text-[11px] text-[#a1a1aa] bg-[#1a1a1a] px-2 py-1 rounded-md border border-white/5">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-5 text-sm font-medium">
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#e8a064] hover:text-[#d4915c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-sm"
                        >
                          Visit Live Project
                        </a>
                      )}
                      <Link 
                        href={`/portfolio/${project.slug}`} 
                        className="text-white hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-sm"
                      >
                        Read Case Study
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );

            if (shouldReduceMotion) {
              return <div key={project.slug} className={cardClasses}>{content}</div>;
            }

            return (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
                className={cardClasses}
              >
                {content}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

