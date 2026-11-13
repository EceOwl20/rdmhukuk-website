"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBell, FiShield } from "react-icons/fi";

const pageTitles = [
  { path: "/yonetim/gorevler", title: "Görevler" },
  { path: "/yonetim/blog", title: "Blog" },
  { path: "/yonetim/gorseller", title: "Görseller" },
  { path: "/yonetim/belgeler", title: "Belgeler" },
] as const;

function getPageTitle(pathname: string) {
  return pageTitles.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`))?.title
    ?? "İçerikler";
}

export default function MobileAdminHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const tasksActive = pathname === "/yonetim/gorevler";

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/10 bg-[#152741]/95 px-4 text-white shadow-sm backdrop-blur-xl lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-center gap-3">
        <Link
          href="/yonetim"
          aria-label="Yönetim paneli ana ekranı"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EFB059]/25 bg-[#EFB059]/10"
        >
          <FiShield className="text-xl text-[#EFB059]" />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-[#EFB059]">RDM Hukuk</p>
          <p className="mt-0.5 truncate text-base font-bold tracking-tight">{pageTitle}</p>
        </div>

        <Link
          href="/yonetim/gorevler"
          aria-label="Görev bildirimlerini görüntüle"
          aria-current={tasksActive ? "page" : undefined}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl transition-colors ${
            tasksActive
              ? "border-[#EFB059]/30 bg-[#EFB059]/15 text-[#EFB059]"
              : "border-white/15 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          <FiBell />
        </Link>
      </div>
    </header>
  );
}
