// ==============================================
// Portfolio Project Type
// Axivon Technologies
// ==============================================
import { LucideIcon } from "lucide-react";

export interface PortfolioProject {
  // ==========================================
  // Basic Information
  // ==========================================

  id: string;

  slug: string;

  title: string;

  category: string;

  industry: string;

  // ==========================================
  // Project Description
  // ==========================================

  shortDescription: string;

  fullDescription: string;

  problem: string;

  solution: string;

  // ==========================================
  // Features & Technologies
  // ==========================================

  features: string[];

  technologies: string[];

  // ==========================================
  // Project Status
  // ==========================================

  status: "Completed" | "Live" | "In Development";

  duration: string;

  completionDate: string;

  // ==========================================
  // Client Information
  // ==========================================

  client: string;

  role: string;

  // ==========================================
  // Project Links
  // ==========================================

  liveUrl: string;

  githubUrl: string;

  // ==========================================
  // Images
  // ==========================================

  thumbnail: string;

  heroImage: string;

  gallery: string[];

    // ==========================================
  // UI Settings
  // ==========================================

  icon: LucideIcon;

  accentPrimary: string;

  accentSecondary: string;

  visual:
    | "business"
    | "agriculture"
    | "water"
    | "ai"
    | "cloud"
    | "ecommerce"
    | "healthcare";

  // ==========================================
  // Portfolio Settings
  // ==========================================

  featured: boolean;

  // ==========================================
  // SEO
  // ==========================================

  seoTitle: string;

  seoDescription: string;
}