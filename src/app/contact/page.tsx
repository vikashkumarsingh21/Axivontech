import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import ContactHero from "@/components/contact/ContactHero";
import ContactOptions from "@/components/contact/ContactOptions";
import ContactForm from "@/components/contact/ContactForm";

const ContactTrust = dynamic(() => import("@/components/contact/ContactTrust"));
const ContactPresence = dynamic(() => import("@/components/contact/ContactPresence"));
const ContactFAQ = dynamic(() => import("@/components/contact/ContactFAQ"));
const ContactCTA = dynamic(() => import("@/components/contact/ContactCTA"));

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Axivon Technologies for website development, mobile app development, AI solutions, SEO services, digital marketing, and custom software development.",
  path: "/contact",
  keywords: [
    "Contact Axivon",
    "Hire Developers India",
    "Software Consultation",
    "Web Development Inquiry",
  ],
});

import { getPublishedFaqs } from "@/lib/content/content-db";

export default async function ContactPage() {
  const faqs = await getPublishedFaqs("ALL", "CONTACT");

  return (
    <main className="bg-[#0f0f0f]">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Contact", url: "https://axivontech.in/contact" },
        ]}
      />
      
      {/* Section 01 */}
      <ContactHero />
      
      {/* Section 02 */}
      <ContactOptions />
      
      {/* Sections 03 & 04 (Two-column layout) */}
      <Suspense fallback={<div className="min-h-[400px] bg-[#0f0f0f]" />}>
        <ContactForm />
      </Suspense>
      
      {/* Section 05 */}
      <ContactTrust />
      
      {/* Section 06 */}
      <ContactPresence />
      
      {/* Section 07 */}
      <ContactFAQ faqs={faqs} />
      
      {/* Section 08 */}
      <ContactCTA />
    </main>
  );
}