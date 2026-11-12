
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdClose, MdMenu } from "react-icons/md";
import { FaChevronRight } from "react-icons/fa";

const navigationItems = [
  { label: "HİZMETLERİMİZ", href: "/#hizmetlerimiz" },
  { label: "BLOG", href: "/blog" },
  { label: "HAKKIMIZDA", href: "/#hakkimizda" },
  { label: "İLETİŞİM", href: "/iletisim" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClass =
    "group relative flex items-center justify-center " +
    " text-[16px] text-white transition-colors";

  const underlineClass =
    "absolute bottom-[-5px] left-1/2 h-[2px] w-0 " +
    "-translate-x-1/2 bg-[#EFB059] transition-all " +
    "duration-500 ease-out group-hover:w-full";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-[#152741] text-white shadow-lg font-tusli font-medium">
      <div className="mx-auto flex h-[70px] w-full max-w-[1600px] items-center justify-between px-4 md:justify-center md:px-6">

        {/* MOBILE LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center md:hidden"
          aria-label="RDM Hukuk Ana Sayfa"
        >
          <Image
            src="/images/home/header-logo.svg"
            alt="RDM Hukuk"
            width={45}
            height={45}
            priority
            className="h-auto w-[110px] object-contain"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center justify-center gap-8 md:flex lg:gap-16 xl:gap-24 2xl:gap-29">

          {navigationItems.slice(0, 2).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={navLinkClass}
            >
              {item.label}
              <span className={underlineClass} />
            </Link>
          ))}

          {/* CENTER LOGO */}
          <Link
            href="/"
            className="mx-2 transition-transform duration-300 hover:scale-105"
            aria-label="RDM Hukuk Ana Sayfa"
          >
            <Image
              src="/images/home/header-logo.svg"
              alt="RDM Hukuk"
              width={35}
              height={35}
              priority
              className="h-[45px] w-auto object-contain"
            />
          </Link>

          {navigationItems.slice(2).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={navLinkClass}
            >
              {item.label}
              <span className={underlineClass} />
            </Link>
          ))}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className="flex h-11 w-11 items-center justify-center text-[#EFB059] md:hidden"
        >
          {isMenuOpen ? (
            <MdClose className="text-3xl" />
          ) : (
            <MdMenu className="text-3xl" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        className={`absolute left-0 top-full w-full overflow-hidden
          bg-[#152741] shadow-xl transition-all duration-300
          ease-in-out md:hidden ${
            isMenuOpen
              ? "visible max-h-[400px] opacity-100"
              : "invisible max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col gap-7 px-7 py-8">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
              className=" flex items-center justify-between text-[15px] text-white transition-colors hover:text-[#EFB059]"
            >
              <span>{item.label}</span>
              <FaChevronRight className="text-sm text-[#EFB059]" />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
