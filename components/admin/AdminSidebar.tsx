
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FiBookOpen,
  FiChevronRight,
  FiClipboard,
  FiExternalLink,
  FiFileText,
  FiFolder,
  FiGrid,
  FiImage,
  FiLogOut,
  FiMenu,
  FiShield,
  FiX,
} from "react-icons/fi";

import { logoutAction } from "@/app/yonetim/actions";

const links = [
  {
    href: "/yonetim",
    label: "Sayfa İçerikleri",
    icon: FiGrid,
  },
  {
    href: "/yonetim/gorevler",
    label: "Görevler ve İşler",
    icon: FiClipboard,
  },
  {
    href: "/yonetim/blog",
    label: "Blog Yazıları",
    icon: FiBookOpen,
  },
  {
    href: "/yonetim/gorseller",
    label: "Görseller",
    icon: FiImage,
  },
  {
    href: "/yonetim/belgeler",
    label: "Belgeler",
    icon: FiFolder,
  },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <aside className="relative z-40 w-full shrink-0 bg-[#152741] text-white lg:flex lg:min-h-screen lg:w-[280px] lg:flex-col lg:border-r lg:border-white/10">
      {/* BRAND HEADER */}
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5 lg:h-auto lg:px-6 lg:pb-7 lg:pt-8">
        <Link
          href="/yonetim"
          onClick={() => setIsOpen(false)}
          className="group flex items-center gap-3"
        >
          {/* LOGO ICON */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#EFB059]/20 bg-[#EFB059]/10 transition-colors group-hover:bg-[#EFB059]/20">
            <FiShield className="text-[23px] text-[#EFB059]" />
          </div>

          {/* BRAND TEXT */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#EFB059]">
              RDM HUKUK
            </span>

            <span className="text-[17px] font-semibold tracking-tight text-white">
              Yönetim Paneli
            </span>
          </div>
        </Link>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="admin-mobile-menu"
          aria-label={
            isOpen ? "Panel menüsünü kapat" : "Panel menüsünü aç"
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xl text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* NAVIGATION AREA */}
      <div
        id="admin-mobile-menu"
        className={`${
          isOpen ? "flex" : "hidden"
        } flex-col px-4 pb-5 lg:flex lg:min-h-0 lg:flex-1 lg:px-4 lg:pb-6`}
      >
        <div className="flex flex-col lg:flex-1">
          {/* MENU LABEL */}
          <div className="mb-3 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8092A7] lg:mt-8 lg:">
            İçerik Yönetimi
          </div>

          {/* LINKS */}
          <nav
            aria-label="Yönetim menüsü"
            className="flex flex-col gap-1.5"
          >
            {links.map((link) => {
              const Icon = link.icon;

              const active =
                link.href === "/yonetim"
                  ? pathname === link.href
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#EFB059]/15 text-white"
                      : "text-[#B8C5D3] hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {/* ACTIVE INDICATOR */}
                  {active && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#EFB059]" />
                  )}

                  <Icon
                    className={`shrink-0 text-[19px] transition-colors ${
                      active
                        ? "text-[#EFB059]"
                        : "text-[#91A4B8] group-hover:text-[#EFB059]"
                    }`}
                  />

                  <span className="flex-1">
                    {link.label}
                  </span>

                  {active && (
                    <FiChevronRight className="shrink-0 text-[15px] text-[#EFB059]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* SECONDARY NAVIGATION */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8092A7]">
              Hızlı Erişim
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium text-[#B8C5D3] transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <FiExternalLink className="shrink-0 text-[19px] text-[#91A4B8] group-hover:text-[#EFB059]" />

              <span className="flex-1">
                Siteyi Görüntüle
              </span>

              <FiChevronRight className="text-[14px] opacity-50" />
            </Link>
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="mt-8 border-t border-white/10 pt-5 lg:mt-auto">
          {/* LOGOUT */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="group flex w-full min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-[#B8C5D3] transition-colors hover:bg-red-400/10 hover:text-red-300"
            >
              <FiLogOut className="shrink-0 text-[19px] text-[#EFB059] transition-colors group-hover:text-red-300" />

              <span>
                Çıkış Yap
              </span>
            </button>
          </form>

          {/* ADMIN INFO */}
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFB059]/10">
              <FiShield className="text-lg text-[#EFB059]" />
            </div>

            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white">
                Yönetici Paneli
              </p>

              <p className="mt-0.5 text-[10px] text-[#91A4B8]">
                RDM Hukuk İçerik Yönetimi
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
