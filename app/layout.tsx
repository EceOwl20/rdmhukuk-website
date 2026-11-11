
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
      <body className={montserrat.className}>
        <Navbar />
       <main className="min-h-screen pt-15">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
