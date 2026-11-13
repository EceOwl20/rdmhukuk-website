import Image from "next/image";

import { uploadLibraryImageAction } from "@/app/yonetim/actions";
import { PanelSection, SaveButton } from "@/components/admin/FormFields";
import { getImages } from "@/lib/content-store";

export default async function ImagesPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const [images, params] = await Promise.all([getImages(), searchParams]);
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D79B43]">Medya kütüphanesi</p>
        <h1 className="mt-2 text-3xl font-bold">Görseller</h1>
        <p className="mt-2 text-sm text-slate-500">Sitenin mevcut görselleri ve sonradan yüklenen dosyalar burada birlikte saklanır. Önceki görsellere istediğiniz zaman geri dönebilirsiniz.</p>
      </div>
      {params.durum && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Görsel kütüphaneye eklendi.</p>}
      <PanelSection title="Yeni görsel yükle" description="JPG, PNG, WebP, GIF veya SVG; en fazla 8 MB. Aynı dosya yeniden yüklenirse mevcut kayıt kullanılır.">
        <form action={uploadLibraryImageAction} className="flex flex-wrap items-end gap-4">
          <label className="min-w-[260px] flex-1 text-sm font-semibold">Görsel<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" required className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#152741] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#203b61]" /></label>
          <SaveButton>Görseli yükle</SaveButton>
        </form>
      </PanelSection>
      {images.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-100">
                <Image src={image.url} alt={image.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain" />
                <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${image.source === "site" ? "bg-[#152741] text-white" : "bg-[#EFB059] text-[#152741]"}`}>{image.source === "site" ? "Site görseli" : "Yüklenen"}</span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold" title={image.name}>{image.name}</p>
                <p className="mt-1 text-xs text-slate-500">{new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(image.size / 1024)} KB</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-white p-8 text-slate-500">Henüz kütüphaneye görsel yüklenmedi.</p>
      )}
    </div>
  );
}
