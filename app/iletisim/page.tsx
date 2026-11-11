
import type { Metadata } from "next";

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "RDM Hukuk Bürosu ile iletişime geçin. İletişim bilgileri ve iletişim formu.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactForm />
    </>
  );
}
