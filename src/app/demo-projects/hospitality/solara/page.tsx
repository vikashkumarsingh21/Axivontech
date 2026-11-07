import type { Metadata } from "next";
import SolaraClientView from "@/components/demo-projects/solara/SolaraClientView";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "Solara Retreat & Resort — Luxury Nature Haven Demo | Axivon Technologies",
  description:
    "Explore Solara Retreat & Resort, an interactive luxury eco-hospitality website demo created by Axivon Technologies. Features private pool villa showcase, farm-to-table dining, Ayurvedic wellness spa, stargazing observatory, and reservation booking workflow.",
  keywords: [
    "Solara Retreat",
    "Hotel Website Demo",
    "Luxury Resort Website",
    "Hospitality Web Design",
    "Ayurvedic Spa Demo",
    "Hotel Booking Interface",
    "Eco Resort Website",
    "Axivon Technologies",
  ],
  openGraph: {
    title: "Solara Retreat & Resort — Hospitality Website Demo | Axivon Technologies",
    description:
      "A premium, responsive luxury resort website demonstration engineered by Axivon Technologies, showcasing private plunge-pool villas, farm-to-table dining, and reservation enquiry interface.",
    url: "https://axivontech.in/demo-projects/hospitality/solara",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/demo-assets/hospitality/solara/hero-resort.jpg",
        width: 1200,
        height: 800,
        alt: "Solara Retreat & Resort Mountain Landscape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solara Retreat & Resort — Hospitality Website Demo | Axivon Technologies",
    description:
      "A premium, responsive luxury resort website demonstration engineered by Axivon Technologies.",
    images: ["/demo-assets/hospitality/solara/hero-resort.jpg"],
  },
};

export default function SolaraPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Demo Projects", url: "https://axivontech.in/demo-projects" },
          {
            name: "Solara Retreat & Resort (Hospitality)",
            url: "https://axivontech.in/demo-projects/hospitality/solara",
          },
        ]}
      />
      <SolaraClientView />
    </>
  );
}
