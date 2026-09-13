import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, SOCIAL_PROFILES } from "@/lib/seo/config";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description:
      "Axivon Technologies provides Web Development, Mobile App Development, AI Solutions, Cloud Solutions, SEO Services, Digital Marketing, UI/UX Design, and Custom Software Development.",
    founder: {
      "@type": "Person",
      name: "Vikash Kumar",
    },
    alternateName: ["Axivon Technology", "Axivon Tech", "AxivonTech"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9473263768",
      contactType: "customer support",
      email: "contact@axivontech.in",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi", "Gujarati"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rajkot",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    sameAs: [
      SOCIAL_PROFILES.linkedin,
      SOCIAL_PROFILES.instagram,
      SOCIAL_PROFILES.facebook,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}