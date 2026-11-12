import { aboutContent, staffContent } from "@/data/about";
import { blogPosts } from "@/data/blog";
import { contactInfo } from "@/data/contact";
import { heroSlides } from "@/data/hero";
import { serviceSlides } from "@/data/serviceSlides";
import { services, servicesIntro } from "@/data/services";
import type { SiteContent } from "@/lib/site-content-types";

export const defaultSiteContent: SiteContent = {
  home: {
    heroSlides,
    heroDesktopImage: "/images/home/main-image.jpg",
    heroMobileImage: "/images/home/mobilehero.jpg",
    servicesTitle: "HİZMETLERİMİZ",
    servicesIntro,
    services,
    serviceSlides,
    about: {
      ...aboutContent,
      desktopImage: "/images/home/about-us.jpg",
      mobileImage: "/images/home/about-mobile.jpg",
    },
    staff: staffContent,
  },
  contact: {
    title: "İLETİŞİM",
    heroImage: "/images/contact/contact-hero.png",
    ...contactInfo,
    intro:
      "Merak ettiğiniz konular hakkında bilgi almak, hizmetlerimizle ilgili daha fazla detay öğrenmek veya hukuki danışmanlık talebinde bulunmak için bizimle iletişime geçebilirsiniz.",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12769.265712659482!2d30.7410184!3d36.8588441!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c39bc39322921b%3A0x19989ab998d407a3!2sRDM%20HUKUK%20%2F%20AV.YAREN%20ERDEM!5e0!3m2!1str!2str!4v1708523869735!5m2!1str!2str",
  },
  blog: {
    title: "BLOG & MAKALELER",
    description:
      "Hukuki gelişmeleri, güncel konuları ve farklı hukuk alanlarına ilişkin bilgilendirici yazılarımızı keşfedin.",
    posts: blogPosts,
  },
};
