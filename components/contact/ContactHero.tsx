
import Image from "next/image";

import { FaPhone } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { ImLocation2 } from "react-icons/im";

import { contactInfo } from "@/data/contact";

export default function ContactHero() {
  return (
    <section className="relative w-full">

      {/* HERO IMAGE */}
      <div className="relative h-[300px] w-full sm:h-[350px] md:h-[418px]">

        <Image
          src="/images/contact/contact-hero.png"
          alt="RDM Hukuk Bürosu İletişim"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <h1
            className=" text-[30px] font-bold
              text-white sm:text-[50px] xl:text-[80px]"
          >
            İLETİŞİM
          </h1>
        </div>
      </div>

      {/* MOBILE CONTACT INFORMATION */}
      <div
        className="flex w-full flex-col items-center
          gap-3 bg-gray-100 px-4 py-3 md:hidden"
      >
        {/* PHONE AND EMAIL */}
        <div
          className="flex w-full flex-wrap items-center
            justify-between gap-3 rounded-lg
            bg-[#EFB059] px-3 py-3"
        >
          <a
            href={contactInfo.phoneHref}
            className="flex items-center gap-2"
          >
            <span
              className="flex h-9 w-9 shrink-0
                items-center justify-center rounded-lg
                bg-[#152741]"
            >
              <FaPhone className="text-lg text-[#EFB059]" />
            </span>

            <span className="text-[11px] font-bold text-[#152741] sm:text-[14px]">
              {contactInfo.phone}
            </span>
          </a>

          <a
            href={contactInfo.emailHref}
            className="flex items-center gap-2"
          >
            <span
              className="flex h-9 w-9 shrink-0
                items-center justify-center rounded-lg
                bg-[#152741]"
            >
              <IoIosMail className="text-xl text-[#EFB059]" />
            </span>

            <span className="text-[11px] font-bold text-[#152741] sm:text-[14px]">
              {contactInfo.email}
            </span>
          </a>
        </div>

        {/* ADDRESS */}
        <div
          className="flex w-full items-center gap-3
            rounded-lg bg-[#152741] px-3 py-3"
        >
          <span
            className="flex h-9 w-9 shrink-0
              items-center justify-center rounded-lg
              bg-white"
          >
            <ImLocation2 className="text-xl text-[#152741]" />
          </span>

          <p className="text-[11px] leading-relaxed text-white sm:text-[13px]">
            {contactInfo.address}
          </p>
        </div>
      </div>

      {/* DESKTOP CONTACT BAR */}
      <div
        className="absolute bottom-0 left-1/2 z-10
          hidden h-[75px] w-[calc(100%-48px)]
          max-w-[1170px] -translate-x-1/2
          translate-y-1/2 items-center justify-center
          rounded-full bg-[#EFB059]
          md:flex lg:h-[100px]"
      >
        <div className="flex items-center justify-between gap-8 lg:gap-16">

          {/* PHONE */}
          <a
            href={contactInfo.phoneHref}
            className="flex items-center gap-3"
          >
            <div className="rounded-lg bg-[#152741] p-2">
              <FaPhone className="text-xl text-[#EFB059]" />
            </div>

            <span className="text-[12px] font-bold text-[#152741] lg:text-[18px]">
              0242 317 07 84
            </span>
          </a>

          {/* EMAIL */}
          <a
            href={contactInfo.emailHref}
            className="flex items-center gap-3"
          >
            <div className="rounded-lg bg-[#152741] p-2">
              <IoIosMail className="text-xl text-[#EFB059]" />
            </div>

            <span className="text-[12px] font-bold text-[#152741] lg:text-[18px]">
              {contactInfo.email}
            </span>
          </a>

          {/* LOCATION */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#152741] p-2">
              <ImLocation2 className="text-xl text-[#EFB059]" />
            </div>

            <span className="text-[12px] font-bold text-[#152741] lg:text-[18px]">
              {contactInfo.location}
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP ADDRESS BAR */}
      <div
        className="absolute bottom-[-170px] left-1/2 z-10
          hidden min-h-[74px] w-[calc(100%-80px)]
          max-w-[1000px] -translate-x-1/2
          items-center justify-center rounded-full
          bg-[#152741] px-10 md:flex"
      >
        <p className="text-center text-[12px] text-white lg:text-[17px] xl:text-[20px]">
          {contactInfo.address}
        </p>
      </div>

    </section>
  );
}
