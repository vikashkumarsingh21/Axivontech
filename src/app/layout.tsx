import type { Metadata, Viewport } from "next";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import WebSiteSchema from "@/components/seo/WebSiteSchema";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import dynamic from 'next/dynamic';
import NextTopLoader from 'nextjs-toploader';
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import CookieSettingsButton from "@/components/legal/CookieSettingsButton";
import { ToastProvider } from "@/components/notifications/ToastProvider";

const ChatWidget = dynamic(() => import('@/components/chatbot/ChatWidget'));
const FloatingWhatsAppButton = dynamic(() => import('@/components/conversion/FloatingWhatsAppButton'));

import { Inter, Manrope, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/seo/config";
import { isCareersPageEnabled } from "@/lib/careers/careers-db";
import { getSeoSettings } from "@/lib/content/content-db";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0D10",
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const canonicalUrl = seo.canonicalBase || SITE_URL;
  const title = seo.defaultTitle || DEFAULT_TITLE;
  const description = seo.defaultDescription || DEFAULT_DESCRIPTION;
  const ogImage = seo.defaultOgImage || DEFAULT_OG_IMAGE;

  const verification: { google?: string; other?: Record<string, string> } = {};
  if (seo.googleSiteVerification?.trim()) {
    verification.google = seo.googleSiteVerification.trim();
  }
  if (seo.bingSiteVerification?.trim()) {
    verification.other = { "msvalidate.01": seo.bingSiteVerification.trim() };
  }

  return {
    metadataBase: new URL(canonicalUrl),
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    title: {
      default: title,
      template: seo.titleTemplate || `%s | ${SITE_NAME}`,
    },
    description,
    keywords: seo.keywords && seo.keywords.length > 0 ? seo.keywords : [
      "Web Development Company",
      "Mobile App Development",
      "AI Solutions",
      "Custom Software Development",
      "UI UX Design",
      SITE_NAME,
    ],
    authors: [
      {
        name: "Vikash Kumar",
      },
    ],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: seo.allowIndexing,
      follow: seo.allowIndexing,
    },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [careersEnabled, seo] = await Promise.all([
    isCareersPageEnabled(),
    getSeoSettings(),
  ]);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F3F5F7]">
        <ToastProvider />
        <NextTopLoader color="#10B981" showSpinner={false} />
        <OrganizationSchema />
        <LocalBusinessSchema />
        <WebSiteSchema />
        <Navbar careersEnabled={careersEnabled} />

        <main className="flex-1">
          {children}
        </main>

        <Footer careersEnabled={careersEnabled} />

        <GoogleAnalytics measurementId={seo.gaMeasurementId} />

        <FloatingWhatsAppButton />
        <ChatWidget />
        <CookieConsentBanner />
        <CookieSettingsButton />
      </body>
    </html>
  );
}