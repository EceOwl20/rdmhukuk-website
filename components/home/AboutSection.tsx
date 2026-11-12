
import Image from "next/image";
import { aboutContent } from "@/data/about";

export default function AboutSection() {
  const { title, paragraphs, lawyer } = aboutContent;

  return (
    <section
      id="hakkimizda"
      className="relative mt-5 h-[350px] w-full overflow-hidden
        sm:h-[420px] md:mt-[120px] md:h-[500px]
        xl:h-[716px] font-medium"
    >
      {/* DESKTOP BACKGROUND */}
      <Image
        src="/images/home/about-us.jpg"
        alt=""
        fill
        sizes="(min-width: 768px) 100vw, 1px"
        className="hidden object-cover md:block"
      />

      {/* MOBILE BACKGROUND */}
      <Image
        src="/images/home/about-mobile.jpg"
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, 1px"
        className="object-cover md:hidden"
      />

      {/* DESKTOP CONTENT */}
      <div
        className="absolute hidden md:flex
          md:top-[70px] md:left-[70px]
          lg:left-[100px]
          xl:top-[156px] xl:left-[130px]
          2xl:left-[20.208vw]"
      >
        <div
          className="flex max-w-[350px] flex-col
            items-start gap-5
            lg:max-w-[450px]
            xl:max-w-[551px]"
        >
          <div className="flex items-center gap-4">
            <Image
              src="/images/home/title-tag.svg"
              alt=""
              width={22}
              height={22}
              className="h-4 w-4 object-contain lg:h-5 lg:w-5"
            />

            <h2
              className=" text-[15px]
                font-bold text-[#152741]
                lg:text-[16px] xl:text-[20px]
                2xl:text-[25px] font-tusli"
            >
              {title}
            </h2>
          </div>

          <p className="text-justify text-[12px] leading-relaxed text-[#738595]">
            {paragraphs[0]}
          </p>

          <p className="hidden text-justify text-[12px] leading-relaxed text-[#738595] xl:block">
            {paragraphs[1]}
          </p>

          <p className="text-justify text-[12px] leading-relaxed text-[#738595]">
            {paragraphs[2]}
          </p>

          <h3 className="hidden  text-[15px] font-bold text-[#152741] xl:block font-tusli">
            {lawyer.name}
          </h3>

          <p className="hidden text-justify text-[12px] leading-relaxed text-[#738595] xl:block">
            {lawyer.description}
          </p>
        </div>
      </div>

      {/* MOBILE CONTENT */}
      <div
        className="absolute top-[30px] right-10 left-10
          flex flex-col gap-3
          sm:top-[70px] sm:max-w-[350px]
          md:hidden"
      >
        <div className="flex items-center gap-4">
          <Image
            src="/images/home/title-tag.svg"
            alt=""
            width={18}
            height={18}
            className="h-4 w-4 object-contain"
          />

          <h2 className=" text-[15px] font-bold text-[#152741]">
            {title}
          </h2>
        </div>

        <p className="text-justify text-[12px] leading-relaxed text-[#738595]">
          {paragraphs[0]}
        </p>

        <p className="hidden text-justify text-[12px] leading-relaxed text-[#738595] sm:block">
          {paragraphs[2]}
        </p>

        <h3 className=" text-[15px] font-bold text-[#152741]">
          {lawyer.name}
        </h3>
      </div>
    </section>
  );
}
