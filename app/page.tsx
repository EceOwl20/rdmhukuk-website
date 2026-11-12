
import HeroSection from "@/components/home/HeroSection";
import OurServices from "@/components/home/OurServices";
import AboutSection from "@/components/home/AboutSection";
import StaffSection from "@/components/home/StaffSection";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteContent } from "@/lib/content-store";

export default async function HomePage() {
  const { home, contact } = await getSiteContent();
  return (
    <>
      <HeroSection content={home} />
      <OurServices content={home} />
      <AboutSection content={home.about} />
      <StaffSection content={home.staff} />
      <ContactForm contact={contact} />
    </>
  );
}
