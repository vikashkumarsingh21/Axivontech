import type { Metadata } from "next";
import OakfieldClientView from "@/components/demo-projects/oakfield/OakfieldClientView";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "Oakfield International School — CBSE K-12 Education Demo | Axivon Technologies",
  description:
    "Explore Oakfield International School, a realistic CBSE K-12 institutional website demonstration created by Axivon Technologies. Features progressive academic wings, Principal's message, online admissions workflow, faculty roster, and campus infrastructure showcase.",
  keywords: [
    "Oakfield International School",
    "School Website Demo",
    "CBSE School Portal",
    "Education Website Design",
    "Admissions Enquiry UI",
    "School Curriculum Showcase",
    "K-12 Website Template",
    "Axivon Technologies",
  ],
  openGraph: {
    title: "Oakfield International School — Education Website Demo | Axivon Technologies",
    description:
      "A premium, responsive CBSE K-12 school website demonstration engineered by Axivon Technologies, showcasing academic wings, admissions, and campus infrastructure.",
    url: "https://axivontech.in/demo-projects/education/oakfield",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/demo-assets/education/oakfield/hero-campus.jpg",
        width: 1200,
        height: 800,
        alt: "Oakfield International School Heritage Campus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oakfield International School — Education Website Demo | Axivon Technologies",
    description:
      "A premium, responsive CBSE K-12 school website demonstration engineered by Axivon Technologies.",
    images: ["/demo-assets/education/oakfield/hero-campus.jpg"],
  },
};

export default function OakfieldPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Demo Projects", url: "https://axivontech.in/demo-projects" },
          {
            name: "Oakfield International School (Education)",
            url: "https://axivontech.in/demo-projects/education/oakfield",
          },
        ]}
      />
      <OakfieldClientView />
    </>
  );
}
