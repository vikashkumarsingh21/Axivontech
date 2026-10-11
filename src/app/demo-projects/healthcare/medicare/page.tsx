import MediCareDemoStrip from "@/components/demo-projects/medicare/MediCareDemoStrip";
import MediCareHeader from "@/components/demo-projects/medicare/MediCareHeader";
import MediCareHero from "@/components/demo-projects/medicare/MediCareHero";
import MediCareTrustStrip from "@/components/demo-projects/medicare/MediCareTrustStrip";
import MediCareDepartments from "@/components/demo-projects/medicare/MediCareDepartments";
import MediCareDoctors from "@/components/demo-projects/medicare/MediCareDoctors";
import MediCareServices from "@/components/demo-projects/medicare/MediCareServices";
import MediCarePhilosophy from "@/components/demo-projects/medicare/MediCarePhilosophy";
import MediCareAppointment from "@/components/demo-projects/medicare/MediCareAppointment";
import MediCarePatientInfo from "@/components/demo-projects/medicare/MediCarePatientInfo";
import MediCareAbout from "@/components/demo-projects/medicare/MediCareAbout";
import MediCareFAQ from "@/components/demo-projects/medicare/MediCareFAQ";
import MediCareContact from "@/components/demo-projects/medicare/MediCareContact";
import MediCareFooter from "@/components/demo-projects/medicare/MediCareFooter";

export const metadata = {
  title: "MediCare — Premium Healthcare Website Demo | Axivon Technologies",
  description:
    "Explore MediCare, a modern multispeciality healthcare website demo by Axivon Technologies. Features department navigation, doctor profiles, appointment booking interface, accessible FAQ, and patient-centred design.",
  keywords: [
    "MediCare",
    "healthcare website demo",
    "hospital website",
    "medical website design",
    "Axivon Technologies",
    "healthcare UI",
    "doctor directory",
    "appointment booking interface",
  ],
  openGraph: {
    title: "MediCare — Healthcare Website Demo | Axivon Technologies",
    description:
      "A premium, responsive healthcare website frontend built by Axivon Technologies, showcasing patient-centred design, department navigation, and interactive appointment interfaces.",
    url: "https://axivontech.in/demo-projects/healthcare/medicare",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/images/demo-projects/medicare/hero-consultation.jpg",
        width: 1200,
        height: 630,
        alt: "MediCare Health Centre — Healthcare Website Demo by Axivon Technologies",
      },
    ],
  },
};

export default function MediCarePage() {
  return (
    <div className="min-h-screen bg-white text-[#263746]">
      {/* Axivon Demo Showcase Strip */}
      <MediCareDemoStrip />

      {/* MediCare Health Centre Brand Header */}
      <MediCareHeader />

      {/* Hero Section */}
      <MediCareHero />

      {/* Trust & Patient Information Strip */}
      <MediCareTrustStrip />

      {/* Medical Departments */}
      <MediCareDepartments />

      {/* Doctor Profiles */}
      <MediCareDoctors />

      {/* Healthcare Services */}
      <MediCareServices />

      {/* Why MediCare — Philosophy & Principles */}
      <MediCarePhilosophy />

      {/* Appointment Booking Interface */}
      <MediCareAppointment />

      {/* Patient Information & Preparation */}
      <MediCarePatientInfo />

      {/* About MediCare Health Centre */}
      <MediCareAbout />

      {/* Frequently Asked Questions */}
      <MediCareFAQ />

      {/* Contact Section */}
      <MediCareContact />

      {/* Footer */}
      <MediCareFooter />
    </div>
  );
}
