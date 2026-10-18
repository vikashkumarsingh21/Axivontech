import { FaqItem, DEFAULT_FAQS } from "@/lib/content/content-db";

interface HomeFAQSchemaProps {
  faqs?: FaqItem[];
}

export default function HomeFAQSchema({ faqs }: HomeFAQSchemaProps) {
  const items = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData),
      }}
    />
  );
}
