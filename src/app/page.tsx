import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import HomeFAQSchema from "@/components/seo/HomeFAQSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

import {
  getHomepageContent,
  getPublishedFaqs,
  getSeoSettings,
  getPublishedServices,
  getPublishedIndustries,
  getPublishedPortfolioProjects,
} from "@/lib/content/content-db";

const Services = dynamic(() => import("@/components/Services"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const IndustriesWeServe = dynamic(() => import("@/components/IndustriesWeServe"));
const Portfolio = dynamic(() => import("@/components/Portfolio"));
const Process = dynamic(() => import("@/components/Process"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const ClientReviews = dynamic(() => import("@/components/ClientReviews"));
const CTA = dynamic(() => import("@/components/CTA"));

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  const seo = await getSeoSettings();

  const title = content.seo?.title || seo.defaultTitle;
  const description = content.seo?.description || seo.defaultDescription;
  const keywords = content.seo?.keywords?.length ? content.seo.keywords : seo.keywords;

  return createPageMetadata({
    title,
    description,
    path: "/",
    keywords,
    noindex: !seo.allowIndexing,
  });
}

export default async function Home() {
  const [content, faqs, services, industries, projects] = await Promise.all([
    getHomepageContent(),
    getPublishedFaqs("ALL", "HOME"),
    getPublishedServices(),
    getPublishedIndustries(),
    getPublishedPortfolioProjects(),
  ]);

  return (
    <>
      <HomeFAQSchema faqs={faqs} />
      {content.sectionsVisibility.hero && <Hero content={content.hero} />}
      {content.sectionsVisibility.services && <Services services={services} />}
      {content.sectionsVisibility.whyChooseUs && <WhyChooseUs />}
      {content.sectionsVisibility.industries && <IndustriesWeServe industries={industries} />}
      {content.sectionsVisibility.portfolio && <Portfolio projects={projects} />}
      {content.sectionsVisibility.process && <Process />}
      {content.sectionsVisibility.reviews && <ClientReviews />}
      {content.sectionsVisibility.faq && <FAQ faqs={faqs} />}
      {content.sectionsVisibility.cta && <CTA content={content.closingCta} />}
    </>
  );
}