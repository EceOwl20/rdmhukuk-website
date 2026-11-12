
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const tussilago = localFont({
  src: [
    {
      path: "../font/TussilagoRg-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../font/TussilagoHv-Regular.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-tussilago",
});

export const metadata: Metadata = {
  title: {
    default: "RDM Hukuk Bürosu",
    template: "%s | RDM Hukuk",
  },
  description: "RDM Hukuk Bürosu resmi web sitesi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${montserrat.variable} ${tussilago.variable} antialiased`}
      >
        <Navbar />

        <main className="min-h-screen pt-15">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
