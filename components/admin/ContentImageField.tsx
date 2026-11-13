"use client";

import { useState } from "react";
import Image from "next/image";

import type { StoredImage } from "@/lib/site-content-types";

export default function ContentImageField({
  label,
  uploadName,
  libraryName,
  currentUrl,
  images,
}: {
  label: string;
  uploadName: string;
  libraryName: string;
  currentUrl: string;
  images: StoredImage[];
}) {
  const [selectedUrl, setSelectedUrl] = useState("");
  const previewUrl = selectedUrl || currentUrl;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="relative aspect-[16/8] bg-slate-200">
        <Image src={previewUrl} alt={`${label} önizlemesi`} fill sizes="600px" className="object-contain" />
        <span className="absolute left-3 top-3 rounded-full bg-[#152741]/90 px-3 py-1 text-xs font-semibold text-white">{label}</span>
      </div>
      <div className="space-y-4 p-4">
        <label className="block text-sm font-semibold text-[#152741]">
          Kütüphaneden seç
          <select name={libraryName} value={selectedUrl} onChange={(event) => setSelectedUrl(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#EFB059]">
            <option value="">Mevcut görseli koru</option>
            {images.map((image) => (
              <option key={image.id} value={image.url}>{image.name} · {image.source === "site" ? "Site görseli" : "Yüklenen"}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-200" />veya yeni yükle<span className="h-px flex-1 bg-slate-200" /></div>
        <input name={uploadName} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#152741] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#203b61]" />
        <p className="truncate text-xs text-slate-500" title={currentUrl}>Kullanılan: {currentUrl}</p>
      </div>
    </div>
  );
}
