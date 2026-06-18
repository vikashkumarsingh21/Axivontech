import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import ContactFAQ from "@/components/contact/ContactFAQ";
import CTA from "@/components/CTA";

export const metadata = {
  title: "Contact Us | Axivon Technologies",
  description:
    "Get in touch with Axivon Technologies for website development, mobile app development, AI solutions, SEO services, digital marketing, and custom software development.",
};

export default function ContactPage() {
  return (
    <main className="bg-[#050816] overflow-hidden">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactFAQ />
      <CTA />
    </main>
  );
}