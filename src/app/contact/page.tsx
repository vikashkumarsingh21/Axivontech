import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import ContactFAQ from "@/components/contact/ContactFAQ";
import CTA from "@/components/CTA";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { createPageMetadata } from "@/lib/seo/metadata";

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
    <main className="bg-[#0f0f0f] overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Contact", url: "https://axivontech.in/contact" },
        ]}
      />
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactFAQ />
      <CTA />
    </main>
  );
}