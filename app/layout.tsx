import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookchaowalit - Bookchaowalit",
  description: "Bookchaowalit by Bookchaowalit - A modern web application built with Next.js",
  keywords: ['Bookchaowalit', 'Bookchaowalit', 'Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'Bookchaowalit', url: 'https://bookchaowalit.com' }],
  creator: 'Bookchaowalit',
  publisher: 'Bookchaowalit',
  metadataBase: new URL('https://bookchaowalit.com'),
  alternates: {
    canonical: 'https://bookchaowalit.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookchaowalit.com',
    title: 'Bookchaowalit - Bookchaowalit',
    description: 'Bookchaowalit by Bookchaowalit - A modern web application built with Next.js',
    siteName: 'Bookchaowalit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bookchaowalit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookchaowalit - Bookchaowalit',
    description: 'Bookchaowalit by Bookchaowalit - A modern web application built with Next.js',
    images: ['/og-image.png'],
    creator: '@bookchaowalit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

// SEO TODO: Add Open Graph tags for social sharing
