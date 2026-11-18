import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  STUDIO_BG,
  openGraphFor,
  twitterFor,
} from "@/site";
import { THEME_BOOT } from "@/openhiggsfield/theme";

import "./base.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  referrer: "origin-when-cross-origin",
  /* Nothing on the surface is a phone number, address, or email; leaving the
     heuristic on lets iOS Safari rewrite prompt text and model ids as links. */
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: { title: SITE_NAME },
  openGraph: openGraphFor({ path: "/" }),
  twitter: twitterFor(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* The lime studio is the default chrome. theme.ts repaints theme-color before
   paint when this browser has a Falcon theme stored. */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: STUDIO_BG,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="ohf-theme-boot" strategy="beforeInteractive">
          {THEME_BOOT}
        </Script>
        {children}
      </body>
    </html>
  );
}
