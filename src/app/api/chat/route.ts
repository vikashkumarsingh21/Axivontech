import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const AXIVON_KNOWLEDGE_BASE = [
  {
    keywords: ["web", "website", "react", "next.js", "frontend", "backend"],
    answer:
      "We specialize in high-performance Web Development using Next.js 16, React 19, TypeScript, and Tailwind CSS. We build enterprise websites, SaaS platforms, and e-commerce portals. Would you like to see our portfolio or request a free quote?",
  },
  {
    keywords: ["mobile", "app", "android", "ios", "react native", "flutter"],
    answer:
      "Our Mobile App Development team builds native and cross-platform apps for iOS and Android using React Native and Flutter, complete with cloud backend integrations, intuitive UI/UX, and App Store publishing.",
  },
  {
    keywords: ["ai", "machine learning", "bot", "llm", "automation"],
    answer:
      "Axivon Technologies delivers custom AI Solutions including AI chatbots, workflow automation, predictive analytics, and custom LLM integrations tailored for startups and enterprises.",
  },
  {
    keywords: ["cloud", "aws", "devops", "server", "deployment"],
    answer:
      "We offer Cloud & DevOps solutions including AWS/GCP cloud infrastructure setup, Docker containerization, CI/CD pipeline automation, and 99.9% uptime SLA management.",
  },
  {
    keywords: ["seo", "digital marketing", "ranking", "google"],
    answer:
      "Our SEO & Digital Marketing services help your business rank #1 on Google through technical SEO audits, strategic content marketing, high-authority link building, and targeted growth marketing.",
  },
  {
    keywords: ["price", "cost", "pricing", "quote", "budget", "estimate"],
    answer:
      "Projects at Axivon Technologies start from ₹5,000. The final cost depends on the project scope, features, design, technology, integrations, and requirements. For an accurate estimate, please connect with our team.",
  },
  {
    keywords: ["founder", "ceo", "team", "who", "vikash", "pathan", "rokhiya", "owner"],
    answer:
      "Axivon Technologies is led by:\n👨‍💻 **Vikash Kumar** — Founder & CEO (Strategic & Technical Visionary)\n👩‍💼 **Pathan Rokhiya Khanam** — Co-Founder (Operations & Client Growth)\n\nTogether with a team of expert engineers and designers based in India.",
  },
  {
    keywords: ["contact", "email", "phone", "whatsapp", "location", "address", "reach"],
    answer:
      "You can reach Axivon Technologies directly via:\n📱 **WhatsApp/Call**: +91 94732 63768\n📧 **Email**: contact@axivontech.in\n🌐 **Website**: https://axivontech.in/contact",
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const lastUserMessage =
      messages.filter((m) => m.role === "user").pop()?.content.toLowerCase() || "";

    if (!lastUserMessage.trim()) {
      return NextResponse.json({
        reply: "Hello! How can Axivon Technologies assist you with your digital project today?",
      });
    }

    // Match keywords from knowledge base
    let reply = "";
    let showLeadCapture = false;

    for (const item of AXIVON_KNOWLEDGE_BASE) {
      if (item.keywords.some((kw) => lastUserMessage.includes(kw))) {
        reply = item.answer;
        break;
      }
    }

    if (!reply) {
      const intentKeywords = ["project", "idea", "build", "create", "need", "hire", "want", "develop"];
      const hasIntent = intentKeywords.some((kw) => lastUserMessage.includes(kw));
      
      if (hasIntent) {
        reply = "That sounds like an exciting project! Would you like to share your project requirements with the Axivon Technologies team?";
        showLeadCapture = true;
      } else {
        reply = "Thank you for reaching out! Axivon Technologies is a premier Website & Mobile App Development, AI Solutions, and Custom Software company.\n\nWould you like to discuss a project with our team or get a free estimate? You can also message us directly on WhatsApp at **+91 94732 63768**.";
      }
    }

    return NextResponse.json({ reply, showLeadCapture });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Sorry, I encountered an issue. Please reach out to us at contact@axivontech.in or +91 94732 63768." },
      { status: 500 }
    );
  }
}
