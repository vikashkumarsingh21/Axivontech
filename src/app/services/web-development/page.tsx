// import { servicesData } from "@/data/services";
import { getServiceBySlug } from "@/data/services";

import ServiceHero from "@/components/service-pages/ServiceHero";

// Future Components
import ServiceBenefits from "@/components/service-pages/ServiceBenefits";
import ServiceProcess from "@/components/service-pages/ServiceProcess";
import ServiceTechStack from "@/components/service-pages/ServiceTechStack";
// import ServiceFAQ from "@/components/service-pages/ServiceFAQ";
// import ServiceCTA from "@/components/service-pages/ServiceCTA";

const service = getServiceBySlug("web-development");
if (!service) {
  throw new Error("Service not found");
}

export const metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
};

export default function WebDevelopmentPage() {
  return (
    <main className="bg-[#050816] overflow-hidden">
      <ServiceHero service={service} />

      <ServiceBenefits service={service} />

      <ServiceProcess service={service} />

      <ServiceTechStack service={service} />

      {/* <ServiceFAQ service={service} /> */}

      {/* <ServiceCTA service={service} /> */}
     
    </main>
  );
}