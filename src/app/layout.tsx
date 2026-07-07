import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "InsightHub — Field Intelligence Platform",
  description:
    "Plateforme propriétaire de Market & Consumer Intelligence : collecte terrain offline, audit prix, merchandising et analytics IBP/6P.",
  manifest: "/manifest.webmanifest",
  applicationName: "InsightHub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InsightHub",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D32F2F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
