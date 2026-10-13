import type { Metadata } from "next";
import { NovaCartProvider } from "@/context/NovaCartContext";
import NovaCartDemoStrip from "@/components/demo-projects/novacart/NovaCartDemoStrip";
import NovaCartHeader from "@/components/demo-projects/novacart/NovaCartHeader";
import NovaCartFooter from "@/components/demo-projects/novacart/NovaCartFooter";
import NovaCartToast from "@/components/demo-projects/novacart/NovaCartToast";

export const metadata: Metadata = {
  title: "NovaCart — Premium Lifestyle E-Commerce Frontend Demo | Axivon Technologies",
  description:
    "Explore NovaCart, a modern lifestyle e-commerce demonstration crafted by Axivon Technologies. Features product discovery, category filtering, interactive shopping cart, wishlist, and responsive checkout flows.",
  keywords: [
    "NovaCart",
    "E-commerce demo",
    "Lifestyle storefront",
    "Axivon Technologies",
    "React shopping cart",
    "Product filter",
    "Frontend demo",
  ],
  openGraph: {
    title: "NovaCart — Premium E-Commerce Demo | Axivon Technologies",
    description:
      "A fast, modern lifestyle storefront showcase engineered by Axivon Technologies with intuitive shopping interactions and responsive design.",
    url: "https://axivontech.in/demo-projects/ecommerce/novacart",
    siteName: "Axivon Technologies",
    type: "website",
    images: [
      {
        url: "/images/demo-projects/novacart/hero-lifestyle.jpg",
        width: 1200,
        height: 630,
        alt: "NovaCart — E-Commerce Demo by Axivon Technologies",
      },
    ],
  },
};

export default function NovaCartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NovaCartProvider>
      <div className="novacart-theme demo-light-theme min-h-screen flex flex-col bg-[#F7F7F2] text-[#1C1D1A] font-sans antialiased selection:bg-[#D8F16A] selection:text-[#1C1D1A]">
        {/* 1. Axivon Demo Preview Strip */}
        <NovaCartDemoStrip />

        {/* 2. Main Store Header */}
        <NovaCartHeader />

        {/* 3. Page Content */}
        <main className="flex-1">{children}</main>

        {/* 4. Main Store Footer */}
        <NovaCartFooter />

        {/* 5. Toast Feedback Container */}
        <NovaCartToast />
      </div>
    </NovaCartProvider>
  );
}
