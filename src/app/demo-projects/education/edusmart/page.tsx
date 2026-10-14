import type { Metadata } from "next";
import EduSmartDemoStrip from "@/components/demo-projects/edusmart/EduSmartDemoStrip";
import EduSmartHeader from "@/components/demo-projects/edusmart/EduSmartHeader";
import EduSmartHero from "@/components/demo-projects/edusmart/EduSmartHero";
import EduSmartAbout from "@/components/demo-projects/edusmart/EduSmartAbout";
import EduSmartPrograms from "@/components/demo-projects/edusmart/EduSmartPrograms";
import EduSmartApproach from "@/components/demo-projects/edusmart/EduSmartApproach";
import EduSmartCampusLife from "@/components/demo-projects/edusmart/EduSmartCampusLife";
import EduSmartFaculty from "@/components/demo-projects/edusmart/EduSmartFaculty";
import EduSmartAdmissions from "@/components/demo-projects/edusmart/EduSmartAdmissions";
import EduSmartEvents from "@/components/demo-projects/edusmart/EduSmartEvents";
import EduSmartFAQ from "@/components/demo-projects/edusmart/EduSmartFAQ";
import EduSmartContact from "@/components/demo-projects/edusmart/EduSmartContact";
import EduSmartFooter from "@/components/demo-projects/edusmart/EduSmartFooter";

export const metadata: Metadata = {
  title: "EduSmart — Aurevia Academy Premium Education Demo | Axivon Technologies",
  description:
    "Explore EduSmart (Aurevia Academy), a modern academic institution demonstration created by Axivon Technologies. Features curriculum pathways, faculty profiles, campus life gallery, and admissions enquiry UI.",
  keywords: [
    "EduSmart",
    "Aurevia Academy",
    "education website demo",
    "university portal design",
    "academic website",
    "admissions workflow",
    "curriculum showcase",
    "Axivon Technologies",
  ],
  openGraph: {
    title: "EduSmart — Aurevia Academy Education Demo | Axivon Technologies",
    description:
      "A premium, responsive higher education website frontend engineered by Axivon Technologies, showcasing multidisciplinary pathways and admissions UI.",
    url: "https://axivontech.in/demo-projects/education/edusmart",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/images/demo-projects/edusmart/hero-campus.jpg",
        width: 1200,
        height: 630,
        alt: "Aurevia Academy — Higher Education Website Demo by Axivon Technologies",
      },
    ],
  },
};

export default function EduSmartPage() {
  return (
    <div className="demo-light-theme edusmart-theme min-h-screen bg-[#F7F3EB] text-[#27232A] selection:bg-[#3B2A43] selection:text-[#F7F3EB]">
      {/* 1. Axivon Demo Preview Banner */}
      <EduSmartDemoStrip />

      {/* 2. Aurevia Academy Navigation Header */}
      <EduSmartHeader />

      {/* 3. Hero Section: Modern Academic First Impression */}
      <EduSmartHero />

      {/* 4. Supporting Academic Introduction & Philosophy */}
      <EduSmartAbout />

      {/* 5. Academic Programs with Filter & Curriculum Blueprint Modal */}
      <EduSmartPrograms />

      {/* 6. Academic Methodology & Learning Approach */}
      <EduSmartApproach />

      {/* 7. Campus Life & Facility Environments */}
      <EduSmartCampusLife />

      {/* 8. Faculty Directory & Profile Details */}
      <EduSmartFaculty />

      {/* 9. Admissions Section & Interactive Enquiry Interface */}
      <EduSmartAdmissions />

      {/* 10. News & Events Calendar */}
      <EduSmartEvents />

      {/* 11. Accessible FAQ Accordion */}
      <EduSmartFAQ />

      {/* 12. Contact & Campus Directions */}
      <EduSmartContact />

      {/* 13. Academy Footer */}
      <EduSmartFooter />
    </div>
  );
}
