import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

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

export default function ContactPage() {
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
      <ContactForm />
      
      {/* Section 05 */}
      <ContactTrust />
      
      {/* Section 06 */}
      <ContactPresence />
      
      {/* Section 07 */}
      <ContactFAQ />
      
      {/* Section 08 */}
      <ContactCTA />
    </main>
  );
}