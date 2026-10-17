import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RescueFlowAI – AI-Powered Emergency Response",
    template: "%s | RescueFlowAI",
  },
  description:
    "AI-powered emergency response and dispatch system. Report incidents via voice, image, or text. Get instant AI triage and coordinate first responders in real time.",
  keywords: [
    "emergency response", "AI dispatch", "incident management",
    "rescue", "first responders", "safety", "workplace safety",
    "industrial safety", "Gemini AI", "smart dispatch",
  ],
  authors: [{ name: "RescueFlowAI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env["NEXT_PUBLIC_APP_URL"],
    title: "RescueFlowAI – AI-Powered Emergency Response",
    description: "AI-powered emergency response and dispatch system. Every second counts.",
    siteName: "RescueFlowAI",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080d17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
