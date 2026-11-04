import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B0D10",
};

export const metadata: Metadata = {
  title: "Axivon Business Application",
  description: "Official Axivon Technologies Authenticated Business Mobile Application",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * Dedicated Application Layout
 * Strictly isolates the authenticated business application from all public marketing layouts.
 * No public navbar, no marketing banners, no promotional content, and no public footer.
 */
export default function DedicatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] flex flex-col antialiased selection:bg-emerald-500/20 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <main className="flex-1 flex flex-col w-full max-w-full">
        {children}
      </main>
    </div>
  );
}
