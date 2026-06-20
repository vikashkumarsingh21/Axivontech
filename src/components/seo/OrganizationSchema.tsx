export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "Axivon Technologies",

    url: "https://axivontech.in",

    logo: "https://axivontech.in/logo.png",

    description:
      "Axivon Technologies provides Web Development, Mobile App Development, AI Solutions, Cloud Solutions, SEO Services, Digital Marketing, MVP Development, UI/UX Design, and Custom Software Development.",

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
      addressCountry: "IN",
    },

    sameAs: [],
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