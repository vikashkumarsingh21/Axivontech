import { describe, it, expect } from "vitest";
import { portfolioProjects, getProjectBySlug } from "@/data/portfolio";
import { generateStaticParams, generateMetadata } from "@/app/portfolio/[slug]/page";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Portfolio Case Studies & SEO Synchronization Tests", () => {
  it("should have all 4 canonical projects with comprehensive case study data", () => {
    expect(portfolioProjects.length).toBeGreaterThanOrEqual(4);

    const slugs = portfolioProjects.map((p) => p.slug);
    expect(slugs).toContain("axivon-technologies");
    expect(slugs).toContain("krishi-drishti");
    expect(slugs).toContain("jalmitra");
    expect(slugs).toContain("nani-tathagat");

    for (const project of portfolioProjects) {
      expect(project.title).toBeTruthy();
      expect(project.category).toBeTruthy();
      expect(project.shortDescription).toBeTruthy();
      expect(project.fullDescription).toBeTruthy();
      expect(project.problem).toBeTruthy();
      expect(project.solution).toBeTruthy();
      expect(project.features.length).toBeGreaterThan(0);
      expect(project.technologies.length).toBeGreaterThan(0);
      expect(project.status).toMatch(/Live|Completed|In Development/);
    }
  });

  it("should generate static params for all portfolio slugs", async () => {
    const params = await generateStaticParams();
    expect(params.length).toBe(portfolioProjects.length);
    const generatedSlugs = params.map((p) => p.slug);
    expect(generatedSlugs).toContain("axivon-technologies");
    expect(generatedSlugs).toContain("krishi-drishti");
    expect(generatedSlugs).toContain("jalmitra");
    expect(generatedSlugs).toContain("nani-tathagat");
  });

  it("should generate correct metadata for valid project slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "krishi-drishti" }),
    });

    expect(meta.title).toContain("Krishi Drishti");
    expect(meta.alternates?.canonical).toBe("https://axivontech.in/portfolio/krishi-drishti");
    expect(meta.openGraph?.url).toBe("https://axivontech.in/portfolio/krishi-drishti");
  });

  it("should handle invalid slug gracefully in generateMetadata", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "non-existent-project-slug" }),
    });

    expect(meta.title).toContain("Case Study Not Found");
  });

  it("should include all portfolio case studies and new services in sitemap", async () => {
    const map = await sitemap();
    const urls = map.map((entry) => entry.url);

    // Dynamic case studies
    expect(urls).toContain("https://axivontech.in/portfolio/axivon-technologies");
    expect(urls).toContain("https://axivontech.in/portfolio/krishi-drishti");
    expect(urls).toContain("https://axivontech.in/portfolio/jalmitra");
    expect(urls).toContain("https://axivontech.in/portfolio/nani-tathagat");

    // Missing services and business pages
    expect(urls).toContain("https://axivontech.in/services/automation");
    expect(urls).toContain("https://axivontech.in/services/robotics-iot");
    expect(urls).toContain("https://axivontech.in/industries");
    expect(urls).toContain("https://axivontech.in/business-partner");
    expect(urls).toContain("https://axivontech.in/reviews");
  });

  it("should enforce robots disallow rules for internal portals and logout endpoint", () => {
    const config = robots();
    const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];

    expect(disallow).toContain("/admin/");
    expect(disallow).toContain("/employee/");
    expect(disallow).toContain("/executive/");
    expect(disallow).toContain("/broker/");
    expect(disallow).toContain("/client/");
    expect(disallow).toContain("/logout");
  });
});
