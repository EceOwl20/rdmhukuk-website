
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

import { serviceSlides } from "@/data/serviceSlides";

export default function ServicesSwiper() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });

  const handleCardClick = useCallback(
    (index: number) => {
      const nextIndex = activeIndex === index ? null : index;

      setActiveIndex(nextIndex);

      // Kart genişliği değişince Embla ölçülerini yeniler.
      requestAnimationFrame(() => {
        emblaApi?.reInit();
        if (nextIndex !== null) {
          emblaApi?.scrollTo(nextIndex);
        }
      });
    },
    [activeIndex, emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.reInit();
  }, [activeIndex, emblaApi]);

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={emblaRef}
        className="mx-auto w-full max-w-[1223px] overflow-hidden"
      >
        <div className="flex items-stretch gap-[14px] md:gap-[30px] lg:gap-[38px]">
          {serviceSlides.map((slide, index) => {
            const isActive = activeIndex === index;

            return (
              <div
                key={slide.id}
                className="flex min-w-0 shrink-0 items-stretch"
              >
                {/* SERVICE CARD */}
                <button
                  type="button"
                  onClick={() => handleCardClick(index)}
                  aria-expanded={isActive}
                  aria-controls={`service-panel-${slide.id}`}
                  className={`flex h-[170px] shrink-0 cursor-pointer
                    items-center justify-center overflow-hidden
                    rounded-lg bg-[#152741] text-white
                    transition-[width] duration-300 ease-in-out
                    md:h-[200px] lg:h-[270px]
                    xl:h-[300px] 2xl:h-[350px] ${
                    isActive
                      ? "w-[40px] sm:w-[50px] md:w-[70px]"
                      : "w-[170px] md:w-[200px] lg:w-[270px] xl:w-[300px] 2xl:w-[370px]"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center
                      justify-center gap-5
                      transition-all duration-300 ${
                      isActive ? "-rotate-90 gap-0" : ""
                    }`}
                  >
                    <Image
                      src="/images/home/header-logo.svg"
                      alt=""
                      width={90}
                      height={90}
                      className={`h-auto w-[65px] object-contain
                        transition-opacity duration-300
                        lg:w-[90px] ${
                        isActive ? "opacity-0" : "opacity-100"
                      }`}
                    />

                    <span
                      className=" whitespace-nowrap
                        text-[15px] font-bold"
                    >
                      {slide.title}
                    </span>
                  </div>
                </button>

                {/* EXPANDED DETAIL */}
                <div
                  id={`service-panel-${slide.id}`}
                  aria-hidden={!isActive}
                  className={`overflow-hidden
                    transition-[width,opacity,margin]
                    duration-300 ease-in-out
                    ${
                      isActive
                        ? "ml-3 w-[calc(100vw-100px)] opacity-100 sm:w-[450px] md:ml-[30px] lg:ml-[38px] lg:w-[700px]"
                        : "ml-0 w-0 opacity-0"
                    }`}
                >
                  <div
                    className="flex h-[170px] w-[calc(100vw-100px)]
                      flex-col items-center gap-2
                      overflow-y-auto rounded-lg bg-[#F5F7FD]
                      px-4 py-3 sm:w-[500px] sm:gap-5
                      md:h-[200px] md:px-8 lg:h-[270px]
                      lg:w-[700px] lg:pt-8 xl:h-[300px]
                      2xl:h-[350px]"
                  >
                    <h3
                      className=" text-[15px]
                        font-bold text-[#152741]
                        lg:text-[20px] xl:text-[25px]"
                    >
                      {slide.title}
                    </h3>

                    <p
                      className="text-[11px] leading-relaxed
                        font-medium text-[#738595]
                        sm:text-[12px] lg:text-[14px]
                        xl:text-[15px]"
                    >
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
