
import HeroSection from "@/components/home/HeroSection";
import OurServices from "@/components/home/OurServices";
import AboutSection from "@/components/home/AboutSection";
import StaffSection from "@/components/home/StaffSection";
import ContactForm from "@/components/contact/ContactForm";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OurServices />
      <AboutSection />
      <StaffSection />
      <ContactForm/>
    </>
  );
}
