
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { heroSlides } from "@/data/hero";

export default function HeroSwiper() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: false,
    watchDrag: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="relative h-full w-full">

      {/* SLIDER CONTENT */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_100%]"
            >
              <div className="max-w-[550px]">
                <h1
                  className=" text-[32px]
                    leading-[1.4] font-bold text-[#152741]
                    lg:text-[34px] font-tusli xl:text-[36px]"
                >
                  {slide.title}
                </h1>

                <p
                  className="mt-4 text-[17px] leading-[1.55]
                     text-[#738595]
                    lg:text-[19px] font-medium"
                >
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION DOTS */}
      <div className="absolute left-0 top-[440px] flex items-center gap-2">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`${index + 1}. slayta geç`}
            aria-current={index === selectedIndex ? "true" : undefined}
            className={`h-3 w-3 rounded-full transition-colors duration-300 ${
              selectedIndex === index
                ? "bg-[#152741]"
                : "bg-[#8D9CA5]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
