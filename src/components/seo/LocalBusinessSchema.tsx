export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",

    name: "Axivon Technologies",

    url: "https://axivontech.in",

    logo: "https://axivontech.in/assets/logo/logo-full.png",

    image: "https://axivontech.in/assets/logo/logo-full.png",

    telephone: "+91-9473263768",

    email: "info@axivontech.in",

    description:
      "Axivon Technologies is a Website Development, Mobile App Development, AI Solutions, SEO, UI/UX Design and Software Development Company.",

    address: {
      "@type": "PostalAddress",
      addressLocality: "Patna",
      addressRegion: "Bihar",
      postalCode: "800001",
      addressCountry: "IN",
    },

    areaServed: "India",

    priceRange: "$$",

    sameAs: [
      "https://www.linkedin.com/company/axivon-technologies",
      "https://www.instagram.com/axivontechnology/",
      "https://www.facebook.com/profile.php?id=100088604305929"
    ],

    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Technology Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Website Development",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mobile App Development",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Software Development",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Solutions",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "SEO Services",
          },
        },
      ],
    },
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