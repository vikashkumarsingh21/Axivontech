import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reminders",
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

export default function RemindersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
