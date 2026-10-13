import React from "react";
import NovaCartHero from "@/components/demo-projects/novacart/NovaCartHero";
import NovaCartCategoryGrid from "@/components/demo-projects/novacart/NovaCartCategoryGrid";
import NovaCartFeaturedSection from "@/components/demo-projects/novacart/NovaCartFeaturedSection";
import NovaCartEditorialStory from "@/components/demo-projects/novacart/NovaCartEditorialStory";
import NovaCartValuePillars from "@/components/demo-projects/novacart/NovaCartValuePillars";

export default function NovaCartHomePage() {
  return (
    <>
      {/* 1. Hero Showcase */}
      <NovaCartHero />

      {/* 2. Shop by Category Discovery Grid */}
      <NovaCartCategoryGrid />

      {/* 3. Featured Products & New Arrivals Grid */}
      <NovaCartFeaturedSection />

      {/* 4. Editorial Narrative and Brand Ethos */}
      <NovaCartEditorialStory />

      {/* 5. Value Pillars */}
      <NovaCartValuePillars />
    </>
  );
}
