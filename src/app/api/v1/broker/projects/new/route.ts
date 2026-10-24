import { NextRequest } from "next/server";
import { requireBroker, apiSuccess } from "@/lib/api/broker";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile, user } = await requireBroker(req);

    const metadata = {
      broker: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: brokerProfile.referralCode,
        companyName: brokerProfile.companyName,
      },
      availableServices: [
        "Full-Stack Web Application",
        "Mobile App Development (iOS & Android)",
        "Enterprise SaaS Platform",
        "AI & Machine Learning Integration",
        "Cloud Architecture & DevOps",
        "E-Commerce & Payment Systems",
        "Custom ERP / CRM System",
        "Cybersecurity & Code Audit",
      ],
      budgetRanges: [
        "₹50,000 - ₹1,00,000",
        "₹1,00,000 - ₹3,00,000",
        "₹3,00,000 - ₹5,00,000",
        "₹5,00,000 - ₹10,00,000",
        "₹10,00,000 - ₹25,00,000",
        "₹25,00,000+",
      ],
      timelineOptions: [
        "Less than 1 month",
        "1 - 3 months",
        "3 - 6 months",
        "6 - 12 months",
        "Flexible / Ongoing",
      ],
    };

    return apiSuccess(metadata);
  } catch (error) {
    return handleApiError(error);
  }
}
