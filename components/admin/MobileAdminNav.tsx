"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiClipboard,
  FiExternalLink,
  FiFolder,
  FiGrid,
  FiImage,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { logoutAction } from "@/app/yonetim/actions";

type MobileNavItem = {
  href: string;
  label: string;
  icon: IconType;
};

const items: MobileNavItem[] = [
  { href: "/yonetim", label: "İçerikler", icon: FiGrid },
  { href: "/yonetim/gorevler", label: "Görevler", icon: FiClipboard },
  { href: "/yonetim/blog", label: "Blog", icon: FiBookOpen },
  { href: "/yonetim/gorseller", label: "Görseller", icon: FiImage },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/yonetim") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileAdminNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreIsActive = isActivePath(pathname, "/yonetim/belgeler");

  useEffect(() => {
    if (!isMoreOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMoreOpen]);

  return (
    <>
      {isMoreOpen && (
        <>
          <button
            type="button"
            aria-label="Daha fazla menüsünü kapat"
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 z-40 bg-[#152741]/45 backdrop-blur-[2px] lg:hidden"
          />
          <section
            id="mobile-admin-more-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-admin-more-title"
            className="fixed inset-x-3 z-[60] mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl lg:hidden"
            style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D79B43]">Yönetim paneli</p>
                <h2 id="mobile-admin-more-title" className="mt-1 text-lg font-bold text-[#152741]">Daha Fazla</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Menüyü kapat"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-[#152741]"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-2 p-3">
              <Link
                href="/yonetim/belgeler"
                onClick={() => setIsMoreOpen(false)}
                className={`flex min-h-14 items-center gap-4 rounded-xl px-4 py-3 font-semibold ${
                  moreIsActive ? "bg-[#152741] text-white" : "bg-slate-50 text-[#152741]"
                }`}
              >
                <FiFolder className={`text-xl ${moreIsActive ? "text-[#EFB059]" : "text-slate-500"}`} />
                <span className="flex-1">Belgeler</span>
                <span className="text-sm opacity-60">›</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMoreOpen(false)}
                className="flex min-h-14 items-center gap-4 rounded-xl bg-slate-50 px-4 py-3 font-semibold text-[#152741]"
              >
                <FiExternalLink className="text-xl text-slate-500" />
                <span className="flex-1">Siteyi Görüntüle</span>
                <span className="text-sm opacity-60">↗</span>
              </Link>
              <form action={logoutAction}>
                <button className="flex min-h-14 w-full items-center gap-4 rounded-xl bg-red-50 px-4 py-3 text-left font-semibold text-red-700">
                  <FiLogOut className="text-xl" />
                  <span className="flex-1">Çıkış Yap</span>
                </button>
              </form>
            </div>
          </section>
        </>
      )}

      <nav
        aria-label="Mobil yönetim menüsü"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pt-2 shadow-[0_-10px_30px_rgba(21,39,65,0.10)] backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
                  active
                    ? "bg-[#152741] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#152741]"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`text-[19px] ${active ? "text-[#EFB059]" : "text-slate-500"}`}
                />
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            aria-expanded={isMoreOpen}
            aria-controls="mobile-admin-more-menu"
            onClick={() => setIsMoreOpen((current) => !current)}
            className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
              isMoreOpen || moreIsActive
                ? "bg-[#152741] text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-[#152741]"
            }`}
          >
            <FiMenu
              aria-hidden="true"
              className={`text-[19px] ${isMoreOpen || moreIsActive ? "text-[#EFB059]" : "text-slate-500"}`}
            />
            <span className="w-full truncate text-center">Daha Fazla</span>
          </button>
        </div>
      </nav>
    </>
  );
}
