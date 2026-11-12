
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaChevronRight } from "react-icons/fa";
import { toast } from "sonner";
import { sendEmail } from "@/app/actions/sendEmail";
import PrivacyNotice from "./PrivacyNotice";
import { FaPhone } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { ImLocation2 } from "react-icons/im";
import { contactInfo } from "@/data/contact";

type FieldProps = {
  label: string;
  name: string;
  type?: "text" | "email";
  placeholder?: string;
  multiline?: boolean;
};

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  multiline = false,
}: FieldProps) {
  const inputClasses =
    "w-full rounded-lg border border-dotted border-black " +
    "bg-transparent px-4 py-3 text-[14px] text-[#152741] " +
    "outline-none transition-colors focus:border-solid" +
    "focus:border-[#EFB059]";

  return (
    <div className="flex w-full flex-col gap-3">
      <label
        htmlFor={name}
        className="flex items-center gap-3"
      >
        <Image
          src="/images/home/title-tag.svg"
          alt=""
          width={14}
          height={14}
          className="h-3 w-3 shrink-0"
        />

        <span className=" text-[16px] font-bold text-[#152741] font-tusli">
          {label}
        </span>
      </label>

      {multiline ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required
          minLength={10}
          maxLength={5000}
          rows={3}
          className={`${inputClasses} resize-y`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required
          maxLength={name === "name" ? 120 : 254}
          placeholder={placeholder}
          className={`${inputClasses} h-[50px]`}
        />
      )}
    </div>
  );
}

export default function ContactForm() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (isSubmitting || !isAccepted) return;

    setIsSubmitting(true);

    try {
      const result = await sendEmail(formData);

      if (result.success) {
        toast.success("Form başarıyla gönderildi.");
        formRef.current?.reset();
        setIsAccepted(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="iletisim-formu"
      className="relative w-full"
    >
      {/* DESKTOP SPACING */}
      <div className="hidden h-[20px] md:block" />



{/* CONTACT INTRO - DESKTOP */}
<div className="relative hidden w-full flex-col items-center justify-center bg-white px-5 pb-[100px] pt-[60px] md:flex">
  <div className="flex w-full max-w-[750px] flex-col items-center gap-5">

    {/* TITLE */}
    <div className="flex items-center justify-center gap-3">
      <Image
        src="/images/home/title-tag.svg"
        alt=""
        width={24}
        height={40}
        className="h-[40px] w-auto object-contain"
      />

      <h2 className="font-tusli text-[22px] font-bold text-[#152741]">
        İLETİŞİME GEÇ
      </h2>
    </div>

    {/* DESCRIPTION */}
    <p className="max-w-[750px] text-center text-[14px] leading-[1.6] text-[#738595]">
      Merak ettiğiniz konular hakkında bilgi almak,
      hizmetlerimizle ilgili daha fazla detay öğrenmek
      veya hukuki danışmanlık talebinde bulunmak için
      bizimle iletişime geçebilirsiniz.
    </p>

    {/* CONTACT INFORMATION */}
    <div className="mt-1 flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 lg:justify-between lg:gap-x-5">

      {/* PHONE */}
      <a
        href={contactInfo.phoneHref}
        className="group flex items-center gap-3"
      >
        <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#152741]">
          <FaPhone className="text-[18px] text-[#EFB059]" />
        </span>

        <span className="whitespace-nowrap text-[15px] font-bold text-[#152741] transition-colors group-hover:text-[#EFB059]">
          0242 317 07 84
        </span>
      </a>

      {/* EMAIL */}
      <a
        href={contactInfo.emailHref}
        className="group flex items-center gap-3"
      >
        <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#152741]">
          <IoIosMail className="text-[19px] text-[#EFB059]" />
        </span>

        <span className="whitespace-nowrap text-[15px] font-bold text-[#152741] transition-colors group-hover:text-[#EFB059]">
          {contactInfo.email}
        </span>
      </a>

      {/* LOCATION */}
      <div className="flex items-center gap-3">
        <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#152741]">
          <ImLocation2 className="text-[18px] text-[#EFB059]" />
        </span>

        <span className="whitespace-nowrap text-[15px] font-bold text-[#152741]">
          {contactInfo.location}
        </span>
      </div>
    </div>
  </div>
</div>


      {/* FORM AREA */}
<div className="relative w-full bg-[#EFB059] px-5 pt-8 pb-10 md:h-[200px] md:pt-0 md:pb-0]">

        <div
          className="relative z-10 mx-auto w-full max-w-[750px]
            md:-translate-y-[80px]"
        >
          {/* DECORATIVE TYPEWRITER */}
         <div
  className="pointer-events-none absolute
    -left-[330px] -top-[40px] z-0
    hidden h-[370px] w-[370px] xl:block
    2xl:-left-[460px] 2xl:-top-[100px]
    2xl:h-[500px] 2xl:w-[500px]"
>
            <Image
              src="/images/home/daktilo.png"
              alt=""
              fill
              sizes="500px"
              className="object-contain"
            />
          </div>

          {/* CONTACT FORM */}
          <form
            ref={formRef}
            action={handleSubmit}
            className="relative z-10 grid w-full
              grid-cols-1 gap-5 rounded-lg
              bg-[#F8FAFD] p-5
              shadow-[0_0_30px_rgba(0,0,0,0.20)]
              md:grid-cols-2 md:bg-white"
          >
            {/* MOBILE INTRO */}
            <div className="flex flex-col gap-4 md:hidden">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/home/title-tag.svg"
                  alt=""
                  width={14}
                  height={14}
                />
                <h2 className=" text-[15px] font-bold text-[#152741]">
                  İLETİŞİME GEÇ
                </h2>
              </div>

              <p className="text-justify text-[12px] leading-relaxed text-[#738595]">
                Merak ettiğiniz konular hakkında bilgi almak,
                hizmetlerimizle ilgili daha fazla detay öğrenmek
                veya hukuki danışmanlık talebinde bulunmak için
                bizimle iletişime geçebilirsiniz.
              </p>
            </div>

            {/* LEFT PANEL */}
            <div
              className="flex flex-col justify-center gap-6
                rounded-lg md:bg-[#F8FAFD] md:p-4"
            >
              <FormField
                label="İSİM SOYİSİM"
                name="name"
                placeholder="Adınız Soyadınız"
                
              />

              <FormField
                label="E-POSTA ADRESİ"
                name="email"
                type="email"
                placeholder="ornek@mail.com"
              />
            </div>

            {/* RIGHT PANEL */}
            <div
              className="flex flex-col justify-center gap-5
                rounded-lg md:bg-[#F8FAFD] md:p-4"
            >
              <FormField
                label="MESAJINIZ"
                name="message"
                placeholder="Lütfen mesajınızı buraya yazınız"
                multiline
              />

              {/* BOT TRAP */}
              <div
                className="absolute -left-[9999px]"
                aria-hidden="true"
              >
                <label htmlFor="website-field">
                  Website
                </label>
                <input
                  id="website-field"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* PRIVACY */}
              <div className="flex items-start gap-2">
                <input
                  id="privacy-accept"
                  name="privacy-accept"
                  type="checkbox"
                  checked={isAccepted}
                  onChange={(event) =>
                    setIsAccepted(event.target.checked)
                  }
                  required
                  className="mt-1 accent-[#152741]"
                />

                <div className="text-[11px] leading-relaxed text-[#152741] sm:text-[12px]">
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="cursor-pointer underline underline-offset-2"
                  >
                    Aydınlatma metnini
                  </button>
                  {" "}okudum.
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={!isAccepted || isSubmitting}
                className="flex h-[50px] w-full
                  items-center justify-center gap-3
                  rounded-md bg-[#152741] text-white
                  transition-opacity
                  disabled:cursor-not-allowed
                  disabled:opacity-50"
              >
                <FaChevronRight />

                <span className="text-[13px] font-bold">
                  {isSubmitting
                    ? "GÖNDERİLİYOR..."
                    : "GÖNDER"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PRIVACY MODAL */}
      <PrivacyNotice
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </section>
  );
}
