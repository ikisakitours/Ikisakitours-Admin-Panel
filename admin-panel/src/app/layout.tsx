import type { Metadata, Viewport } from "next";
import { Roboto_Mono, Geist } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { DesktopOnlyGuard } from "@/components/DesktopOnlyGuard";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ikisakitours-admin-panel.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ikisaki Tours | Admin Panel",
    template: "%s | Ikisaki Tours Admin",
  },
  description:
    "Internal operations and content management dashboard for Ikisaki Tours — manage Sri Lanka tour packages, dynamic group pricing, bookings, multilingual content (EN/JA), destinations, and availability.",
  applicationName: "Ikisaki Tours Admin Panel",
  keywords: [
    "Ikisaki Tours",
    "Admin Panel",
    "Sri Lanka Tours",
    "Tour Management System",
    "Booking Operations",
  ],
  authors: [{ name: "Aetheria Labs — Shehan_W" }],
  creator: "Aetheria Labs",
  publisher: "Ikisaki Tours",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: [
      { url: "/Layout-Icons/favicon.ico", sizes: "any" },
      { url: "/Layout-Icons/image-200x200.webp", sizes: "200x200", type: "image/webp" },
      { url: "/Layout-Icons/image-400x400.webp", sizes: "400x400", type: "image/webp" },
    ],
    shortcut: ["/Layout-Icons/favicon.ico"],
    apple: [
      { url: "/Layout-Icons/image-200x200.webp", sizes: "200x200", type: "image/webp" },
      { url: "/Layout-Icons/image-600x600.webp", sizes: "600x600", type: "image/webp" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    url: "/",
    siteName: "Ikisaki Tours Admin Panel",
    title: "Ikisaki Tours | Operations & Tour Management Admin Panel",
    description:
      "Centralized enterprise dashboard for managing Ikisaki Tours Sri Lanka packages, dynamic group pricing tiers, bookings, multilingual itineraries, and date availability.",
    images: [
      {
        url: "/Layout-Icons/image-1200x630.webp",
        width: 1200,
        height: 630,
        alt: "Ikisaki Tours Admin Panel",
        type: "image/webp",
      },
      {
        url: "/Layout-Icons/image-600x315.webp",
        width: 600,
        height: 315,
        alt: "Ikisaki Tours Admin Panel Preview",
        type: "image/webp",
      },
      {
        url: "/Layout-Icons/image-600x600.webp",
        width: 600,
        height: 600,
        alt: "Ikisaki Tours Brand Emblem",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ikisaki Tours | Admin Panel",
    description:
      "Internal operations and CMS dashboard for Ikisaki Tours (www.ikisakitours.com).",
    images: [
      {
        url: "/Layout-Icons/image-1200x630.webp",
        alt: "Ikisaki Tours Admin Panel",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      {/* Apply the font class directly to the body so it inherits everywhere */}
      <body className={`${robotoMono.className} min-h-full bg-slate-50 text-slate-900`}>
        <DesktopOnlyGuard>
          <div className="flex min-h-screen">

            {/* Static Sidebar: locked in place, never reloads */}
            <Sidebar />

            {/* Dynamic Content Area: Only this section reloads when you change pages */}
            <main className="flex-1 p-8">
              {children}
            </main>

          </div>
        </DesktopOnlyGuard>
      </body>
    </html>
  );
}