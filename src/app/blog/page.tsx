import type { Metadata } from "next";
import BlogClientView from "@/components/blog/BlogClientView";

export const metadata: Metadata = {
  title: "Blog & Insights | Axivon Technologies",
  description:
    "Expert technical articles, technology evaluation guides, AI automation blueprints, custom software insights, and comprehensive robotics project guides from Axivon Technologies in Gujarat.",

  keywords: [
    "Axivon Technology Blog",
    "Software Development Gujarat",
    "Robotics Projects Guide",
    "AI Business Automation",
    "App Development Company Rajkot",
    "Custom Software Ahmedabad",
    "IoT Devices Gujarat",
  ],

  alternates: {
    canonical: "https://axivontech.in/blog",
  },

  openGraph: {
    title: "Blog & Insights | Axivon Technologies",
    description:
      "Expert technology guides, AI automation blueprints, custom software insights, and robotics guides for Gujarat businesses, startups, and institutions.",
    url: "https://axivontech.in/blog",
    siteName: "Axivon Technologies",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog & Insights | Axivon Technologies",
    description:
      "Expert technology guides, AI automation blueprints, and robotics guides from Axivon Technologies.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <BlogClientView />
    </main>
  );
}