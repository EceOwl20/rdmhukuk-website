
"use client";

import { useState } from "react";
import Image from "next/image";
import { FaChevronDown } from "react-icons/fa";

import ServicesSwiper from "./ServicesSwiper";

import {
  services,
  servicesIntro,
  type ServiceItem,
} from "@/data/services";

function ServiceCard({
  title,
  description,
}: ServiceItem) {
  return (
    <article className="flex min-w-0 flex-col gap-3.5">
      {/* SERVICE TITLE */}
      <div className="flex items-start gap-3">
        <Image
          src="/images/home/title-tag.svg"
          alt=""
          width={20}
          height={20}
          className="mt-1 h-3 w-3 shrink-0 object-contain sm:h-5 sm:w-5"
        />

        <h3
          className="min-w-0 font-tusli text-[15px]
            leading-snug font-bold text-[#738595]
            sm:text-[20px]"
        >
          {title}
        </h3>
      </div>

      {/* SERVICE DESCRIPTION */}
      <p
        className="ml-6 text-[13px] leading-relaxed
          font-normal text-[#738595]
          sm:ml-8 sm:text-[15px]"
      >
        {description}
      </p>
    </article>
  );
}

export default function OurServices() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="hizmetlerimiz"
      className="flex w-full flex-col items-center
        justify-center pt-10 sm:pt-16"
    >
      {/* SECTION INTRO */}
      <div
        className="flex w-full max-w-[500px]
          flex-col items-start gap-5 px-5
          sm:max-w-[540px] md:max-w-[700px]
          lg:max-w-[970px] xl:max-w-[1074px]"
      >
        {/* SECTION HEADING */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/home/title-tag.svg"
            alt=""
            width={24}
            height={24}
            className="h-4 w-4 object-contain sm:h-6 sm:w-6"
          />

          <h2
            className="font-tusli text-[15px]
              font-bold text-[#152741]
              sm:text-[25px]"
          >
            HİZMETLERİMİZ
          </h2>
        </div>

        {/* INTRO DESCRIPTION */}
        <p
          className="text-justify text-[13px]
            leading-relaxed font-normal
            text-[#738595] sm:text-[15px]"
        >
          {servicesIntro}
        </p>
      </div>

      {/* SERVICES CAROUSEL */}
      <div
        className="mb-10 mt-6 flex w-full
          items-center justify-center
          md:mb-20 md:mt-10"
      >
        <ServicesSwiper />
      </div>

      {/* SERVICES DETAILS */}
      <div
        className="w-full max-w-[500px] px-5
          sm:max-w-[540px] md:max-w-[700px]
          lg:max-w-[970px] xl:max-w-[1074px]"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

          {/* FIRST TWO SERVICES */}
          {services.slice(0, 2).map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
            />
          ))}

          {/* ADDITIONAL SERVICES */}
          <div
            id="additional-services"
            className={`grid min-h-0
              transition-[grid-template-rows]
              duration-500 ease-in-out
              md:col-span-2 md:!grid-rows-[1fr] ${
                isExpanded
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]"
              }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {services.slice(2).map((service) => (
                  <ServiceCard
                    key={service.id}
                    {...service}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE EXPAND BUTTON */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="additional-services"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="mt-6 flex h-[35px]
          w-[calc(100%-40px)] max-w-[360px]
          items-center justify-center gap-2
          rounded bg-[#F8FAFD]
          text-center text-sm font-medium
          text-[#152741] md:hidden"
      >
        <FaChevronDown
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />

        <span>
          {isExpanded ? "Daha Az" : "Daha Fazla"}
        </span>
      </button>
    </section>
  );
}
