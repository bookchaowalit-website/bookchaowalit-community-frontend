import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community Hub | Bookchaowalit",
  description: "A browser-local directory of the channels and community resources behind a solo practice.",
  keywords: ["community", "portfolio"],
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Community Hub | Bookchaowalit",
    description: "Channels and community resources.",
    siteName: "Bookchaowalit",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* impeccable:contract
          THESIS: A community directory should make the next room easy to locate, not pretend to be a social network.
          OWN-WORLD: Neighborhood field notes with a signal map, channel index, and one focused room view.
          STORY: Search the index, open a room, and add a local resource when one is missing.
          FIRST VIEWPORT: The room-finding thesis and orbital directory motif appear before the index.
          FORM: One directory split into index and active room, with an inline add form instead of repeated cards.
          FINISH: Status dots have text labels, local-only limits are visible, and mobile preserves the room path.
          CONCEPT-SEED: d150cb30 / assigned candidate 3 / direction
        */}
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
