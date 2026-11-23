import type { Metadata, Viewport } from "next";
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

/* Default chrome is the lime studio. Next emits theme-color from this
   viewport export. The inline head script below is what actually runs before
   first paint: it reads ohf-theme and sets data-theme and theme-color. A
   next/script beforeInteractive tag does not — the App Router queues that
   through self.__next_s until the runtime chunk loads. */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: STUDIO_BG,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
