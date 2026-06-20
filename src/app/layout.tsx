import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://axivontech.in"),

  title: {
    default: "Axivon Technologies",
    template: "%s | Axivon Technologies",
  },

  description:
    "Axivon Technologies provides Web Development, Mobile App Development, AI Solutions, Cloud Solutions, SEO Services, Digital Marketing, MVP Development, UI/UX Design, and Custom Software Development.",

  keywords: [
    "Axivon Technologies",
    "Web Development",
    "Mobile App Development",
    "AI Solutions",
    "Cloud Solutions",
    "SEO Services",
    "Digital Marketing",
    "Custom Software Development",
    "MVP Development",
    "UI UX Design",
    "Software Company India",
  ],

  authors: [
    {
      name: "Vikas Kumar",
    },
  ],

  creator: "Axivon Technologies",

  publisher: "Axivon Technologies",

  alternates: {
    canonical: "https://axivontech.in",
  },

  openGraph: {
    title: "Axivon Technologies",
    description:
      "Future-Ready Technology Solutions for Modern Businesses.",
    url: "https://axivontech.in",
    siteName: "Axivon Technologies",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Axivon Technologies",
    description:
      "Future-Ready Technology Solutions for Modern Businesses.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#050816]">

  <OrganizationSchema />

  <Navbar />

  <main className="flex-1">
    {children}
  </main>

  <Footer />

  <GoogleAnalytics />

</body>
    </html>
  );
}