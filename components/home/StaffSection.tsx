
import Image from "next/image";
import { FaChevronRight } from "react-icons/fa";
import Link from "next/link";

import { staffContent } from "@/data/about";

export default function StaffSection() {
  const { name, specialization, description, image } =
    staffContent;

  return (
    <section
      id="ekibimiz"
      className="relative isolate flex min-h-[600px] w-full
        items-center justify-center overflow-hidden
        bg-[#152741] py-12 text-white
        md:min-h-[517px] md:py-16"
    >
      {/* DECORATIVE SVG */}
      <Image
        src="/images/home/ekip.svg"
        alt=""
        width={500}
        height={500}
        className="pointer-events-none absolute right-0
          top-1/2 z-0 hidden h-auto w-auto
          max-w-[35%] -translate-y-1/2
          object-contain lg:block"
      />

      {/* CONTENT CONTAINER */}
      <div
        className="relative z-10 mx-auto flex w-full
          max-w-[1150px] flex-col items-center
          justify-center gap-8 px-5
          md:gap-12 xl:flex-row xl:gap-24"
      >
        {/* LEFT CONTENT */}
        <div
          className="flex w-full max-w-[370px]
            flex-col items-start gap-5
            xl:max-w-[407px] xl:gap-10"
        >
          {/* TITLE */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/home/title-tag.svg"
              alt=""
              width={22}
              height={22}
              className="h-4 w-4 shrink-0 object-contain
                lg:h-5 lg:w-5"
            />

            <h2
              className=" text-[20px]
                font-bold text-white md:text-[25px]"
            >
              {name}
            </h2>
          </div>

          {/* DESCRIPTION */}
          <p
            className="text-justify text-[12px]
              leading-relaxed text-white
              md:text-[15px]"
          >
            {description}
          </p>
        </div>

        {/* RIGHT STAFF CARD */}
        <div
          className="flex min-h-[230px] w-full
            max-w-[370px] items-center justify-center
            rounded-xl bg-white px-4 py-5
            text-[#152741]"
        >
          <div className="flex w-full items-center justify-between gap-3">

            {/* STAFF INFO */}
            <div
              className="flex min-w-0 flex-1
                flex-col gap-3"
            >
              <div className="flex items-start gap-2">
                <Image
                  src="/images/home/title-tag.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="mt-1 h-4 w-4 shrink-0"
                />

                <h3
                  className=" text-[18px]
                    leading-snug font-bold
                    text-[#152741] sm:text-[20px]"
                >
                  {name}
                </h3>
              </div>

              <p
                className="text-[12px]
                  leading-relaxed text-black
                  sm:text-[15px]"
              >
                {specialization}
              </p>
            </div>

            {/* STAFF PHOTO */}
            <div className="relative h-[150px] w-[130px] shrink-0 sm:w-[150px]">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 130px, 150px"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* MOBILE BUTTON */}
        <Link
          href="/#hakkimizda"
          className="flex w-full max-w-[370px]
            items-center justify-center gap-3
            rounded-xl bg-gray-300 py-4
            text-sm font-medium text-[#152741]
            transition-colors hover:bg-[#EFB059]
            md:hidden"
        >
          <FaChevronRight />
          HAKKIMIZDA
        </Link>
      </div>
    </section>
  );
}
