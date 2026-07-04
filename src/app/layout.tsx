import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
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
  
  
  icons: {
  icon: "/favicon.png",
  shortcut: "/favicon.png",
  apple: "/favicon.png",
},

  title: {
  default:
    "Website Development & Mobile App Development Company | Axivon Technologies",
  template: "%s | Axivon Technologies",
},

  description:
"Axivon Technologies is a professional Website Development, Mobile App Development, AI Solutions, UI/UX Design, SEO Services and Custom Software Development Company helping startups and businesses across India build fast, secure and scalable digital products.",

  keywords: [
  "Website Development Company",
  "Web Development Company",
  "Website Design Company",
  "Website Designer",
  "Website Developer",
  "Mobile App Development Company",
  "Android App Development",
  "iOS App Development",
  "AI Development Company",
  "Software Development Company",
  "Custom Software Development",
  "SEO Services",
  "Digital Marketing",
  "Cloud Solutions",
  "UI UX Design",
  "React Development",
  "Next.js Development",
  "Ecommerce Website Development",
  "Startup Website Development",
  "Axivon Technologies",
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
  <LocalBusinessSchema />
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