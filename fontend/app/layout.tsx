import type { Metadata, Viewport } from "next";
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
  title: "Vanguard Counter | Cardfight!! Vanguard Power & Crit Tracker",
  description: "Track Vanguard and Rear-Guard power, criticals, and grades across all devices - mobile, tablet, desktop.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full overflow-hidden antialiased select-none overscroll-none`}
    >
      <body className="h-full h-dvh w-full overflow-hidden flex flex-col bg-slate-950 text-slate-100 touch-manipulation overscroll-none">
        {children}
      </body>
    </html>
  );
}


