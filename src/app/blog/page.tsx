import type { Metadata } from "next";

import BlogHero from "@/components/blog/BlogHero";

// Future Sections
import FeaturedArticle from "@/components/blog/FeaturedArticle";
import BlogCategories from "@/components/blog/BlogCategories";
import LatestArticles from "@/components/blog/LatestArticles";
import TrendingTopics from "@/components/blog/TrendingTopics";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Explore insights, technology trends, AI innovations, web development guides, startup strategies, cloud computing, and digital transformation articles from Axivon Technologies.",

  keywords: [
    "Axivon Blog",
    "Technology Blog",
    "Web Development",
    "Next.js",
    "React",
    "Artificial Intelligence",
    "Machine Learning",
    "Cloud Computing",
    "Digital Transformation",
    "Startup Growth",
    "SEO",
    "Software Development",
    "Technology Insights",
    "Programming",
    "Axivon Technologies",
  ],

  alternates: {
    canonical: "https://axivontech.in/blog",
  },

  openGraph: {
    title: "Blog | Axivon Technologies",
    description:
      "Read technology insights, development guides, AI innovations, startup strategies, and digital transformation articles from Axivon Technologies.",
    url: "https://axivontech.in/blog",
    siteName: "Axivon Technologies",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog | Axivon Technologies",
    description:
      "Technology insights, AI innovations, development guides, and startup knowledge from Axivon Technologies.",
  },
};

export default function BlogPage() {
  return (
    <main className="overflow-hidden bg-[#050816]">
      {/* Hero Section */}
      <BlogHero />

      {/* Featured Article */}
      <FeaturedArticle />

      {/* Blog Categories */}
      <BlogCategories />

      {/* Latest Articles */}
      <LatestArticles />

      {/* Trending Topics */}
      <TrendingTopics />
    </main>
  );
}