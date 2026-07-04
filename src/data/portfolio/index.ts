// ===============================
// Portfolio Data Exports
// Axivon Technologies
// ===============================

import { PortfolioProject } from "./types";

import { axivonProject } from "./axivon";
import { jalmitraProject } from "./jalmitra";
import { krishiProject } from "./krishi";
import { naniProject } from "./nani";

// ===============================
// Portfolio Projects
// ===============================

export const portfolioProjects: PortfolioProject[] = [
  axivonProject,
  krishiProject,
  jalmitraProject,
  naniProject,
];

// ===============================
// Featured Projects
// ===============================

export const featuredProjects = portfolioProjects.filter(
  (project) => project.featured
);

// ===============================
// Live Projects
// ===============================

export const liveProjects = portfolioProjects.filter(
  (project) => project.status === "Live"
);

// ===============================
// Completed Projects
// ===============================

export const completedProjects = portfolioProjects.filter(
  (project) => project.status === "Completed"
);

// ===============================
// Find Project By Slug
// ===============================

export const getProjectBySlug = (slug: string) => {
  return portfolioProjects.find(
    (project) => project.slug === slug
  );
};

// ===============================
// Find Project By ID
// ===============================

export const getProjectById = (id: string) => {
  return portfolioProjects.find(
    (project) => project.id === id
  );
};

// ===============================
// Portfolio Categories
// ===============================

export const portfolioCategories = [
  "All",
  "Business Website",
  "Business Automation",
  "Smart Agriculture",
  "Environmental Technology",
];

// ===============================
// Technology List
// ===============================

export const portfolioTechnologies = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "HTML",
  "CSS",
  "Bootstrap",
  "Node.js",
  "Firebase",
  "Google Apps Script",
  "Google Sheets",
  "Arduino",
  "ESP8266",
  "IoT",
  "Artificial Intelligence",
];