import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Northfield Ireland | Job Search, Careers & Hiring",
    template: "%s | Northfield Ireland",
  },
  description:
    "Search for jobs hiring in your area using Northfield's job search engine - the best way to find a job. Find jobs hiring near you and apply with just 1 click.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={`${sans.variable} ${mono.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#F2F4F4] text-[#002325] selection:bg-[#45DB61] selection:text-[#002325] min-h-screen">
        {children}
      </body>
    </html>
  );
}
