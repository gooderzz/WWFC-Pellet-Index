import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// "Archivo Expanded" is Archivo's own variable width axis, not a separate
// Google Fonts family — see docs/05-design/brand-foundation.md §Typography.
// Expanded width is applied via `font-stretch` on `.font-display`.
const archivoDisplay = Archivo({
  variable: "--font-archivo-expanded",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Westminster Wanderers Pellet Index",
  description: "Match results, appearances and the Pellet Index for Westminster Wanderers FC.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoDisplay.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
