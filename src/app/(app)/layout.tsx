"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="fr">
      <body className="font-sans antialiased text-slate-900 bg-slate-50">
        {/* On ne rend les composants applicatifs que lorsque l'état du client est parfaitement stable */}
        {isMounted ? (
          <AppProviders>{children}</AppProviders>
        ) : (
          <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Initialisation InsightHub...</p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}