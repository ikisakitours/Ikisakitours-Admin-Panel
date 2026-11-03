import type { Metadata } from "next";
import { Roboto_Mono, Geist } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { DesktopOnlyGuard } from "@/components/DesktopOnlyGuard";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Internal company admin dashboard",
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