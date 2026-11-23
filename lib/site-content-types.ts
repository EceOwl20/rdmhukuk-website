import type { BlogPost } from "@/data/blog";
import type { HeroSlide } from "@/data/hero";
import type { ServiceSlide } from "@/data/serviceSlides";
import type { ServiceItem } from "@/data/services";

export type SiteContent = {
  home: {
    heroSlides: HeroSlide[];
    heroDesktopImage: string;
    heroMobileImage: string;
    servicesTitle: string;
    servicesIntro: string;
    services: ServiceItem[];
    serviceSlides: ServiceSlide[];
    about: {
      title: string;
      paragraphs: string[];
      lawyer: { name: string; description: string };
      desktopImage: string;
      mobileImage: string;
    };
    staff: {
      name: string;
      specialization: string;
      description: string;
      image: string;
    };
  };
  contact: {
    title: string;
    heroImage: string;
    phone: string;
    phoneHref: string;
    email: string;
    emailHref: string;
    location: string;
    address: string;
    intro: string;
    mapEmbedUrl: string;
  };
  blog: {
    title: string;
    description: string;
    posts: BlogPost[];
  };
};

export type StoredDocument = {
  id: string;
  name: string;
  storedName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type StoredImage = {
  id: string;
  name: string;
  storedName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  url: string;
  sha256?: string;
  source?: "upload" | "site";
};
