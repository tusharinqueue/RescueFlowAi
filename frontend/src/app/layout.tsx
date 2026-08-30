import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RescueFlowAI – AI-Powered Emergency Response",
    template: "%s | RescueFlowAI",
  },
  description:
    "AI-powered emergency response and dispatch system. Report incidents, get instant AI triage, and coordinate first responders in real time.",
  keywords: ["emergency response", "AI dispatch", "incident management", "rescue", "first responders"],
  authors: [{ name: "RescueFlowAI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env["NEXT_PUBLIC_APP_URL"],
    title: "RescueFlowAI – AI-Powered Emergency Response",
    description: "AI-powered emergency response and dispatch system.",
    siteName: "RescueFlowAI",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
