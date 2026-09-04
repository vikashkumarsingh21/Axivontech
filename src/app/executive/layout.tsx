import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {children}
    </div>
  );
}
