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
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9473263768",
      contactType: "customer support",
      email: "info@axivontech.in",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Patna",
      addressRegion: "Bihar",
      postalCode: "800001",
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