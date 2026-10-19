import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const DEFAULT_CHATBOT_CONFIG = {
  enabled: true,
  botName: "Axivon AI",
  welcomeHeading: "How can we help you build something better?",
  welcomeSubtitle: "I can help you explore Axivon's services, verified portfolio projects, and technical solutions.",
  suggestedQuestions: [
    "Explore Services",
    "Build a Web Application",
    "Mobile App Development",
    "AI Solutions & Automation",
  ],
  contactChannels: {
    email: "info@axivontech.in",
    phone: "+91 9473263768",
    whatsappUrl: "https://wa.me/919473263768",
    contactUrl: "/contact",
  },
};

export async function GET() {
  try {
    const setting = await db.organizationSetting.findUnique({
      where: { key: "CHATBOT_CONFIG" },
    });

    if (setting && typeof setting.value === "object" && setting.value !== null) {
      const stored = setting.value as any;
      return NextResponse.json({
        enabled: typeof stored.enabled === "boolean" ? stored.enabled : DEFAULT_CHATBOT_CONFIG.enabled,
        botName: stored.botName || DEFAULT_CHATBOT_CONFIG.botName,
        welcomeHeading: stored.welcomeHeading || DEFAULT_CHATBOT_CONFIG.welcomeHeading,
        welcomeSubtitle: stored.welcomeSubtitle || DEFAULT_CHATBOT_CONFIG.welcomeSubtitle,
        suggestedQuestions: Array.isArray(stored.suggestedQuestions) && stored.suggestedQuestions.length > 0
          ? stored.suggestedQuestions
          : DEFAULT_CHATBOT_CONFIG.suggestedQuestions,
        contactChannels: DEFAULT_CHATBOT_CONFIG.contactChannels,
      });
    }

    return NextResponse.json(DEFAULT_CHATBOT_CONFIG);
  } catch (error) {
    console.error("[ChatConfig API] Error fetching chatbot configuration:", error);
    return NextResponse.json(DEFAULT_CHATBOT_CONFIG);
  }
}
