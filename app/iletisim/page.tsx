
import type { Metadata } from "next";

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteContent } from "@/lib/content-store";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "RDM Hukuk Bürosu ile iletişime geçin. Hukuki danışmanlık, adres ve iletişim bilgilerine ulaşın.",
  alternates: {
    canonical: "/iletisim",
  },
};

export default async function ContactPage() {
  const { contact } = await getSiteContent();
  return (
    <>
      <ContactHero contactInfo={contact} />

      {/* GOOGLE MAPS */}
      <section
        aria-label="RDM Hukuk Bürosu Konum"
        className="w-full"
      >
        <iframe
          title="RDM Hukuk Bürosu - Google Maps"
          src={contact.mapEmbedUrl}
          width="100%"
          height="700"
          className="h-[400px] w-full border-0 sm:h-[500px] md:h-[700px]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <ContactForm contact={contact} />
    </>
  );
}
