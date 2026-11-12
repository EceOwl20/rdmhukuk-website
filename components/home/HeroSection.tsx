
import Image from "next/image";
import HeroSwiper from "./HeroSwiper";
import type { SiteContent } from "@/lib/site-content-types";

export default function HeroSection({ content }: { content: SiteContent["home"] }) {
  return (
    <section
      id="hero"
      className="relative h-[265px] w-full overflow-hidden
        sm:h-[420px] md:h-[calc(100svh-60px)] md:min-h-[650px]"
    >
      {/* MOBILE IMAGE */}
      <Image
        src={content.heroMobileImage}
        alt="RDM Hukuk Bürosu"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 1px"
        className="object-cover md:hidden"
      />

      {/* DESKTOP IMAGE */}
      <Image
        src={content.heroDesktopImage}
        alt="RDM Hukuk Bürosu - Adalet heykeli"
        fill
        priority
        sizes="(min-width: 768px) 100vw, 1px"
        className="hidden object-cover md:block"
      />

      {/* TEXT SLIDER */}
      <div className="absolute inset-0 hidden md:block">
        <div className="relative mx-auto h-full w-full max-w-[1600px]">

          <div
            className="absolute left-[10%] top-[35%]
              w-[35%] max-w-[550px]"
          >
            <HeroSwiper slides={content.heroSlides} />
          </div>

        </div>
      </div>
    </section>
  );
}
