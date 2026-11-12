
import type { Metadata } from "next";

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "RDM Hukuk Bürosu ile iletişime geçin. Hukuki danışmanlık, adres ve iletişim bilgilerine ulaşın.",
  alternates: {
    canonical: "/iletisim",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />

      {/* GOOGLE MAPS */}
      <section
        aria-label="RDM Hukuk Bürosu Konum"
        className="w-full"
      >
        <iframe
          title="RDM Hukuk Bürosu - Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12769.265712659482!2d30.7410184!3d36.8588441!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c39bc39322921b%3A0x19989ab998d407a3!2sRDM%20HUKUK%20%2F%20AV.YAREN%20ERDEM!5e0!3m2!1str!2str!4v1708523869735!5m2!1str!2str"
          width="100%"
          height="700"
          className="h-[400px] w-full border-0 sm:h-[500px] md:h-[700px]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <ContactForm />
    </>
  );
}
