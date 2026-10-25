import { SITE_URL, SITE_NAME, SHORT_NAME, DEFAULT_OG_IMAGE, SOCIAL_PROFILES, CONTACT_INFO, FOUNDED_YEAR } from "@/lib/seo/config";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: [SHORT_NAME, "Axivon", "Axivon Technology"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: DEFAULT_OG_IMAGE,
          caption: SITE_NAME,
        },
        image: DEFAULT_OG_IMAGE,
        description:
          "Axivon Technologies engineers custom software, web platforms, mobile apps, and AI solutions for startups and growing businesses in the USA and India.",
        foundingDate: FOUNDED_YEAR,
        founders: [
          {
            "@type": "Person",
            "@id": `${SITE_URL}/team/vikas-kumar/#person`,
            name: "Vikas Kumar",
            alternateName: "Vikash Kumar",
            jobTitle: "Founder",
            url: `${SITE_URL}/team/vikas-kumar`,
          },
          {
            "@type": "Person",
            "@id": `${SITE_URL}/team/rokhiya-khanam/#person`,
            name: "Rokhiya Khanam",
            alternateName: "P. Rokhiya Khanam",
            jobTitle: "Co-Founder",
            url: `${SITE_URL}/team/rokhiya-khanam`,
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: CONTACT_INFO.phone,
          contactType: "customer service",
          email: CONTACT_INFO.email,
          areaServed: ["US", "IN"],
          availableLanguage: ["English", "Hindi"],
        },
        sameAs: [
          SOCIAL_PROFILES.linkedin,
          SOCIAL_PROFILES.instagram,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
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
