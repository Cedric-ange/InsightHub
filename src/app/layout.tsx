import type { Metadata, Viewport } from "next";
// Utilisation de l'alias absolu pour garantir que TypeScript trouve le module
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "InsightHub — FrieslandCampina FIP",
  description:
    "Plateforme propriétaire de Market & Consumer Intelligence : collecte terrain offline, audit prix, merchandising et analytics IBP/6P pour Bonnet Rouge.",
  manifest: "/manifest.webmanifest",
  applicationName: "InsightHub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InsightHub",
  },
  icons: {
    icon: "/icon.png",  // Ajusté pour cibler la nouvelle icône rouge à la racine du dossier public
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D32F2F", // Le Rouge Bonnet Rouge officiel configuré à la place du rouge générique
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
      <body className="font-sans antialiased text-neutral-dark bg-neutral-light">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}