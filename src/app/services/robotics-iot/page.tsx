import type { Metadata } from "next";

import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
import ServiceSchema from "@/components/seo/ServiceSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const service = getServiceBySlug("robotics-iot");

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: {
    canonical: "https://axivontech.in/services/robotics-iot",
  },
  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: "https://axivontech.in/services/robotics-iot",
    siteName: "Axivon Technologies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: service.metaTitle,
    description: service.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "IoT Development Company",
    "Robotics Prototyping",
    "IoT Sensor Networks",
    "Arduino Projects",
    "Hardware Automation",
    "Smart Devices",
    "Axivon Technologies",
  ],
};

export default function RoboticsIoTPage() {
  return (
    <main className="overflow-hidden bg-[#0f0f0f]">
      <ServiceSchema
        name={service.title}
        description={service.metaDescription}
        url="https://axivontech.in/services/robotics-iot"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Services", url: "https://axivontech.in/services" },
          { name: "Robotics & IoT", url: "https://axivontech.in/services/robotics-iot" },
        ]}
      />
      <ServiceHero service={service} />
      <ServiceBenefits service={service} />
      <ServiceProcess service={service} />
      <ServiceTechStack service={service} />
      <ServiceFAQ service={service} />
      
      {/* SEO Cross-link */}
      <section className="bg-[#141414] py-16 border-t border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Learn More About Educational Projects</h3>
          <p className="text-[#a1a1aa] mb-6">
            Are you a student looking for robotics and IoT project ideas? Check out our comprehensive guide.
          </p>
          <a 
            href="/blog/robotics-projects-guide-school-college-iot-drones"
            className="inline-flex items-center text-[#e8a064] hover:text-[#d4915c] font-medium transition-colors"
          >
            Read the Student Robotics Guide <span className="ml-2">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
