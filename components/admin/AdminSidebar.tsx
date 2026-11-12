"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/yonetim/actions";

const links = [
  { href: "/yonetim", label: "Sayfa İçerikleri" },
  { href: "/yonetim/gorevler", label: "Görevler ve İşler" },
  { href: "/yonetim/blog", label: "Blog Yazıları" },
  { href: "/yonetim/gorseller", label: "Görseller" },
  { href: "/yonetim/belgeler", label: "Belgeler" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <aside className="bg-[#152741] text-white lg:min-h-screen lg:w-72 lg:shrink-0 lg:px-7 lg:py-10">
      <div className="flex h-[72px] items-center justify-between px-5 lg:h-auto lg:px-0">
        <Link href="/yonetim" onClick={() => setIsOpen(false)} className="block border-l-4 border-[#EFB059] pl-3 lg:pl-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 lg:text-xs">RDM Hukuk</span>
          <strong className="block text-base lg:mt-1 lg:text-xl">Yönetim Paneli</strong>
        </Link>
        <button type="button" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen} aria-controls="admin-mobile-menu" className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 text-2xl lg:hidden">
          <span className="sr-only">Panel menüsünü {isOpen ? "kapat" : "aç"}</span>
          {isOpen ? "×" : "☰"}
        </button>
      </div>

      <div id="admin-mobile-menu" className={`${isOpen ? "block" : "hidden"} border-t border-white/10 px-4 pb-5 lg:block lg:border-0 lg:px-0 lg:pb-0`}>
        <nav className="mt-3 flex flex-col gap-1 lg:mt-8 lg:gap-2">
          {links.map((link) => {
            const active = link.href === "/yonetim" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`rounded-lg px-4 py-3 text-sm transition lg:text-base ${active ? "bg-white text-[#152741]" : "hover:bg-white/10"}`}>
                {link.label}
              </Link>
            );
          })}
          <Link href="/" target="_blank" className="rounded-lg px-4 py-3 text-sm hover:bg-white/10 lg:text-base">Siteyi Görüntüle ↗</Link>
        </nav>
        <form action={logoutAction} className="mt-3 lg:mt-8">
          <button className="w-full rounded-lg border border-white/20 px-4 py-3 text-left text-sm hover:bg-white/10 lg:text-base">Çıkış yap</button>
        </form>
      </div>
    </aside>
  );
}
