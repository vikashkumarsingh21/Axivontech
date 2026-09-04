export default function HomeFAQSchema() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does it take to build a website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most business websites take between 1–4 weeks depending on complexity, specifications, and client feedback cycles.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide SEO services?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we provide search engine optimization, keyword research, technical SEO audits, and ongoing digital marketing campaigns.",
        },
      },
      {
        "@type": "Question",
        name: "Can you build mobile applications?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we develop native iOS and Android apps, as well as cross-platform React Native and Flutter solutions.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide website maintenance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer monthly maintenance plans including hosting management, security updates, regular backups, and technical support.",
        },
      },
      {
        "@type": "Question",
        name: "Can you redesign an existing website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. We specialize in modernizing outdated sites, improving user experience, site speeds, and conversion rates without losing search engine credibility.",
        },
      },
      {
        "@type": "Question",
        name: "What technologies do you use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our main stack includes Next.js, React, Node.js, TypeScript, Tailwind CSS, MongoDB, and modern cloud hosting environments like Vercel and AWS.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide AI solutions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we build custom AI-powered integrations, data-processing automation tools, and smart chatbots based on large language models.",
        },
      },
      {
        "@type": "Question",
        name: "How can I get a quotation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply contact us through our project form, email, or WhatsApp, and we will schedule a brief consultation to provide a tailored quote.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
