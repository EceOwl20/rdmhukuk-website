
import { Suspense } from "react";
import Image from "next/image";

import ImageLibraryUpload from "@/components/admin/ImageLibraryUpload";
import { PanelSection } from "@/components/admin/FormFields";
import { requireAdmin } from "@/lib/admin-auth";
import { getImages } from "@/lib/content-store";
import { FiLock, FiTrash2 } from "react-icons/fi";
import AdminForm from "@/components/admin/AdminForm";
import { deleteImageAction } from "@/app/yonetim/actions";

type Props = {
  searchParams: Promise<{ durum?: string }>;
};

/* -----------------------------------------
   PAGE
----------------------------------------- */

export default function ImagesPage({
  searchParams,
}: Props) {
  return (
    <Suspense fallback={<ImagesPageLoading />}>
      <ImagesPageContent searchParams={searchParams} />
    </Suspense>
  );
}

/* -----------------------------------------
   LOADING STATE
----------------------------------------- */

function ImagesPageLoading() {
  return (
    <div
      role="status"
      className="mx-auto max-w-7xl space-y-6 animate-pulse"
    >
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-9 w-48 rounded bg-slate-200" />
        <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
      </div>

      <div className="h-48 rounded-2xl bg-slate-200" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl bg-slate-200"
          />
        ))}
      </div>

      <span className="sr-only">
        Görseller yükleniyor...
      </span>
    </div>
  );
}

/* -----------------------------------------
   CONTENT
----------------------------------------- */

async function ImagesPageContent({
  searchParams,
}: Props) {
  await requireAdmin();

  const [images, params] = await Promise.all([
    getImages(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 lg:space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D79B43] lg:text-sm">
          Medya kütüphanesi
        </p>

        <h1 className="mt-1 text-2xl font-bold lg:mt-2 lg:text-3xl">
          Görseller
        </h1>

        <p className="mt-1 text-xs text-slate-500 lg:mt-2 lg:text-sm">
          Sitenin mevcut görselleri ve sonradan yüklenen
          dosyalar burada birlikte saklanır. Önceki
          görsellere istediğiniz zaman geri dönebilirsiniz.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
     {params.durum && (
  <p
    role="status"
    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
  >
    {params.durum === "silindi"
      ? "Görsel başarıyla silindi."
      : "Görsel kütüphaneye eklendi."}
  </p>
)}

      {/* UPLOAD */}
      <PanelSection
        title="Yeni görsel yükle"
        description="JPG, PNG, WebP veya GIF; en fazla 8 MB. Aynı dosya yeniden yüklenirse mevcut kayıt kullanılır."
      >
        <ImageLibraryUpload />
      </PanelSection>

      {/* IMAGE LIBRARY */}
      {images.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
           
<article
  key={image.id}
  className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
>
  {/* IMAGE PREVIEW */}
  <div className="relative aspect-square overflow-hidden bg-[#F3F6FA]">
    <Image
      src={image.url}
      alt={image.name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
    />

    <span
      className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[9px] font-semibold sm:text-[10px] ${
        image.source === "site"
          ? "bg-[#152741] text-white"
          : "bg-[#EFB059] text-[#152741]"
      }`}
    >
      {image.source === "site"
        ? "Site görseli"
        : "Yüklenen"}
    </span>
  </div>

  {/* IMAGE DETAILS */}
  <div className="space-y-3 p-3 sm:p-4">
    <div className="min-w-0">
      <h3
        className="truncate text-[12px] font-semibold text-[#152741] sm:text-[13px]"
        title={image.name}
      >
        {image.name}
      </h3>

      <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
        {new Intl.NumberFormat("tr-TR", {
          maximumFractionDigits: 1,
        }).format(image.size / 1024)} KB
      </p>
    </div>

    {/* IMAGE ACTIONS */}
    {image.source === "site" ? (
      <div className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-100 px-2 text-[11px] font-medium text-slate-500">
        <FiLock className="shrink-0 text-[13px]" />
        <span>Korunan görsel</span>
      </div>
    ) : (
     <AdminForm
  action={deleteImageAction}
  confirmation={{
    title: "Görsel silinsin mi?",
    description:
      `“${image.name}” kalıcı olarak silinecek. ` +
      "Görsel kullanılıyorsa silme işlemi engellenecektir.",
    confirmLabel: "Görseli sil",
  }}
>
  <input type="hidden" name="id" value={image.id} />

  <button
    type="submit"
    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
  >
    Görseli Sil
  </button>
</AdminForm>
    )}
  </div>
</article>

          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-white p-8 text-slate-500">
          Henüz kütüphaneye görsel yüklenmedi.
        </p>
      )}
    </div>
  );
}
