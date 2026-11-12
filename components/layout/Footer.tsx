
import Image from "next/image";
import Link from "next/link";

import {
  FaYoutube,
  FaFacebookF,
  FaInstagram,
  FaPhone,
} from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

const footerLinks = [
  { label: "HİZMETLERİMİZ", href: "/#hizmetlerimiz" },
  { label: "Blog", href: "/#blog" },
  { label: "HAKKIMIZDA", href: "/#hakkimizda" },
  { label: "İLETİŞİM", href: "/iletisim" },
];

const legalLinks = [
  { label: "ÇEREZ POLİTİKASI", href: "/cerez-politikasi" },
  { label: "YASAL İZİNLER", href: "/yasal-izinler" },
];

const socialLinks = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/watch?v=9-zD1-rIWEk",
    icon: FaYoutube,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100063570836149",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/rdmhukuk/",
    icon: FaInstagram,
  },
];

function FooterLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative w-fit font-medium font-tusli text-[16px] text-white transition-colors duration-300"
    >
      {label}

      <span
        className="absolute bottom-[-4px] left-1/2 h-[2px] w-0
        -translate-x-1/2 bg-[#EFB059] transition-all
        duration-500 group-hover:w-full"
      />
    </Link>
  );
}

function FooterSocials({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile
          ? "flex flex-col items-center gap-4"
          : "mt-4 flex items-center justify-center gap-5"
      }
    >
      {mobile && (
        <>
          <a
            href="tel:+902423170784"
            aria-label="Telefon"
            className="flex h-10 w-12 items-center justify-center rounded-md bg-[#738595] text-white"
          >
            <FaPhone className="text-xl" />
          </a>

          <a
            href="mailto:info@rdmhukuk.com.tr"
            aria-label="E-posta"
            className="flex h-10 w-12 items-center justify-center rounded-md bg-[#738595] text-white"
          >
            <IoIosMail className="text-2xl" />
          </a>
        </>
      )}

      {socialLinks.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className={
            mobile
              ? "flex h-10 w-12 items-center justify-center rounded-md bg-[#738595] text-white transition-colors hover:bg-[#EFB059]"
              : "flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#152741] transition-colors hover:bg-[#EFB059]"
          }
        >
          <Icon className={mobile ? "text-2xl" : "text-xl"} />
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#152741] text-white">

      {/* DESKTOP FOOTER */}
      <div className="hidden min-h-[250px] items-center justify-center px-6 py-10 md:flex">
        <div className="mx-auto grid w-full max-w-[1250px] grid-cols-[1fr_auto_1fr] items-center gap-8">

          {/* LEFT LINKS */}
          <div className="flex items-center justify-end gap-6 lg:gap-14">
            {footerLinks.slice(0, 2).map((item) => (
              <FooterLink key={item.label} {...item} />
            ))}
          </div>

          {/* CENTER LOGO */}
          <div className="flex min-w-[190px] flex-col items-center justify-center gap-1">
            <Link
              href="/"
              className="flex flex-col items-center gap-1"
              aria-label="RDM Hukuk Ana Sayfa"
            >
              <Image
                src="/images/home/footer-logo.svg"
                alt="RDM Hukuk Bürosu"
                width={120}
                height={70}
                className="h-auto w-[120px] object-contain"
              />
            </Link>

            <FooterSocials />
          </div>

          {/* RIGHT LINKS */}
          <div className="flex items-center justify-start gap-6 lg:gap-12">
            {footerLinks.slice(2).map((item) => (
              <FooterLink key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP COPYRIGHT */}
      <div className="hidden min-h-[50px] items-center justify-between gap-4 bg-[#8D9CA5] px-8 py-3 text-[13px] text-[#152741] md:flex lg:px-20">
        <p>
          © {year} RDM Hukuk Bürosu, Her hakkı saklıdır.
        </p>

        <a
          href="https://dgtlface.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <span>Powered by company ©</span>
          <span className="font-bold tracking-wide">
            DGTLFACE
          </span>
        </a>
      </div>

      {/* MOBILE FOOTER */}
      <div className="flex flex-col md:hidden">

        <div className="flex w-full items-start justify-between gap-3 px-[18px] pb-8 pt-9">

          {/* MOBILE LEFT */}
          <div className="flex min-w-0 flex-col items-start gap-5">

            <Link
              href="/"
              className="mb-2 flex items-center gap-3"
              aria-label="RDM Hukuk Ana Sayfa"
            >
              <Image
                src="/images/home/footer-logo.svg"
                alt="RDM Hukuk Bürosu"
                width={145}
                height={90}
                className="h-auto w-[145px] object-contain"
              />
            </Link>

            {footerLinks.map((item) => (
              <FooterLink key={item.label} {...item} />
            ))}

            {legalLinks.map((item) => (
              <FooterLink key={item.label} {...item} />
            ))}
          </div>

          {/* MOBILE RIGHT */}
          <div className="mt-[70px] shrink-0">
            <FooterSocials mobile />
          </div>
        </div>

        {/* MOBILE COPYRIGHT */}
        <div className="border-t border-[#738595] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[13px] text-[#8D9CA5]">
              RDM Hukuk © {year}
            </p>

            <a
              href="https://dgtlface.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DGTLFACE"
              className="font-bold tracking-wide text-white"
            >
              DGTLFACE
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}
