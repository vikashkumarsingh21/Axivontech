import type { Metadata } from "next";
import FitZoneClientView from "@/components/demo-projects/fitzone/FitZoneClientView";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "FitZone — Premium 3D Gym & Athletic Club Demo | Axivon Technologies",
  description:
    "Explore FitZone, an immersive 3D gym and athletic club demo by Axivon Technologies. Featuring interactive 3D perspective hero tracking, 7-day class timetable, master trainer rosters, interactive split planner, and VIP trial booking.",
  keywords: [
    "FitZone",
    "Gym Website Demo",
    "3D Fitness Website",
    "Athletic Club Platform",
    "Class Schedule Calendar",
    "Personal Trainer Profiles",
    "Fitness Membership Comparison",
    "Interactive Workout Planner",
    "Axivon Technologies Demo Projects",
    "Sports Science Web Design",
  ],
  openGraph: {
    title: "FitZone — Premium 3D Gym & Athletic Club Showcase | Axivon Technologies",
    description:
      "A high-performance 3D athletic club demonstration engineered with responsive CSS perspective tilt, live schedule capacity tracking, and frontend booking workflows by Axivon Technologies.",
    url: "https://axivontech.in/demo-projects/fitness/fitzone",
    siteName: "Axivon Technologies",
    type: "website",
  },
};

export default function FitZonePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://axivontech.in" },
          { name: "Demo Projects", url: "https://axivontech.in/demo-projects" },
          {
            name: "FitZone (Fitness & Wellness)",
            url: "https://axivontech.in/demo-projects/fitness/fitzone",
          },
        ]}
      />
      <FitZoneClientView />
    </>
  );
}
