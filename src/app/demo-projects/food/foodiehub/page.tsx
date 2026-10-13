import type { Metadata } from "next";
import FoodieHubDemoStrip from "@/components/demo-projects/foodiehub/FoodieHubDemoStrip";
import FoodieHubHeader from "@/components/demo-projects/foodiehub/FoodieHubHeader";
import FoodieHubHero from "@/components/demo-projects/foodiehub/FoodieHubHero";
import FoodieHubStory from "@/components/demo-projects/foodiehub/FoodieHubStory";
import FoodieHubMenu from "@/components/demo-projects/foodiehub/FoodieHubMenu";
import FoodieHubSignatures from "@/components/demo-projects/foodiehub/FoodieHubSignatures";
import FoodieHubExperience from "@/components/demo-projects/foodiehub/FoodieHubExperience";
import FoodieHubGallery from "@/components/demo-projects/foodiehub/FoodieHubGallery";
import FoodieHubSpecialExperiences from "@/components/demo-projects/foodiehub/FoodieHubSpecialExperiences";
import FoodieHubReservation from "@/components/demo-projects/foodiehub/FoodieHubReservation";
import FoodieHubContact from "@/components/demo-projects/foodiehub/FoodieHubContact";
import FoodieHubFooter from "@/components/demo-projects/foodiehub/FoodieHubFooter";

export const metadata: Metadata = {
  title: "FoodieHub — Saffron & Stone Premium Restaurant Demo | Axivon Technologies",
  description:
    "Explore FoodieHub (Saffron & Stone), an editorial contemporary Indian restaurant demo by Axivon Technologies. Features rich digital menus, signature dishes, atmosphere gallery, and table reservation interface.",
  keywords: [
    "FoodieHub",
    "Saffron & Stone",
    "restaurant website demo",
    "contemporary Indian dining",
    "hospitality web design",
    "table reservation UI",
    "digital food menu",
    "Axivon Technologies",
  ],
  openGraph: {
    title: "FoodieHub — Saffron & Stone Restaurant Demo | Axivon Technologies",
    description:
      "A premium, responsive contemporary Indian dining website frontend built by Axivon Technologies, showcasing digital menus, signature dishes, and reservation UI.",
    url: "https://axivontech.in/demo-projects/food/foodiehub",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/images/demo-projects/foodiehub/hero-dish.jpg",
        width: 1200,
        height: 630,
        alt: "Saffron & Stone — Contemporary Indian Dining Website Demo by Axivon Technologies",
      },
    ],
  },
};

export default function FoodieHubPage() {
  return (
    <div className="demo-light-theme min-h-screen bg-[#F8F3EA] text-[#24221F] selection:bg-[#B85C38] selection:text-white">
      {/* Axivon Demo Showcase Strip */}
      <FoodieHubDemoStrip />

      {/* Saffron & Stone Brand Navigation Header */}
      <FoodieHubHeader />

      {/* Hero Section */}
      <FoodieHubHero />

      {/* Our Restaurant Story */}
      <FoodieHubStory />

      {/* Interactive Digital Menu Section */}
      <FoodieHubMenu />

      {/* Signature Dishes Showcase */}
      <FoodieHubSignatures />

      {/* Dining Atmosphere & Experience */}
      <FoodieHubExperience />

      {/* Visual Photography Gallery with Lightbox */}
      <FoodieHubGallery />

      {/* Special Experiences & Private Dining */}
      <FoodieHubSpecialExperiences />

      {/* Table Reservation Interface */}
      <FoodieHubReservation />

      {/* Location & Contact Information */}
      <FoodieHubContact />

      {/* Restaurant Footer */}
      <FoodieHubFooter />
    </div>
  );
}
