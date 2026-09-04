import { Metadata } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from "./config";

interface PageMetadataProps {
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  keywords = [],
  noindex = false,
}: PageMetadataProps): Metadata {
  const url = `${SITE_URL}${path}`;

  const robots = noindex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
        },
      };

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
