interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
}

export default function ServiceSchema({
  name,
  description,
  url,
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",

    serviceType: name,

    name,

    description,

    provider: {
      "@type": "Organization",
      name: "Axivon Technologies",
      url: "https://axivontech.in",
    },

    areaServed: {
      "@type": "Country",
      name: "India",
    },

    url,
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