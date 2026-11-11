
import Image from "next/image";
import HeroSwiper from "./HeroSwiper";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative h-[265px] w-full overflow-hidden
        sm:h-[420px] md:h-[calc(100svh-60px)] md:min-h-[650px]"
    >
      {/* MOBILE IMAGE */}
      <Image
        src="/images/home/mobilehero.jpg"
        alt="RDM Hukuk Bürosu"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 1px"
        className="object-cover md:hidden"
      />

      {/* DESKTOP IMAGE */}
      <Image
        src="/images/home/main-image.jpg"
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
            className="absolute left-[12.7%] top-[34%]
              w-[35%] max-w-[550px]"
          >
            <HeroSwiper />
          </div>

        </div>
      </div>
    </section>
  );
}
