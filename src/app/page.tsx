import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Serif, Inter, Work_Sans } from "next/font/google";

import { OpenHiggsfieldApp } from "@/openhiggsfield/openhiggsfield-app";

import "@/openhiggsfield/openhiggsfield.css";
import "@/openhiggsfield/falcon.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ohf-inter",
  display: "swap",
});

/* Falcon faces load with the page and apply only under data-theme="falcon".
   They are not preloaded, so the lime studio does not wait on them. */
const falconDisplay = Big_Shoulders({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-falcon-display",
  display: "swap",
  preload: false,
  fallback: ["Impact", "sans-serif"],
});

const falconBody = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-falcon-serif",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

const falconUi = Work_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-falcon-ui",
  display: "swap",
  preload: false,
  fallback: ["Arial", "sans-serif"],
});

/* Title, description and the Open Graph block all come from the root, which
   already describes this surface. Only the canonical link is route-specific. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function OpenHiggsfieldPage() {
  return (
    <OpenHiggsfieldApp
      fontClassName={`${inter.variable} ${falconDisplay.variable} ${falconBody.variable} ${falconUi.variable}`}
    />
  );
}
