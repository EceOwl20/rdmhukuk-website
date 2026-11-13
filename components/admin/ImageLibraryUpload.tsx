"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { useFormStatus } from "react-dom";
import { FiCheck, FiImage, FiUploadCloud } from "react-icons/fi";

import { uploadLibraryImageAction } from "@/app/yonetim/actions";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function formatFileSize(size: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(size / 1024 / 1024);
}

function UploadButton({ hasFile }: { hasFile: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!hasFile || pending}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#152741] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#203b61] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:min-w-40"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Yükleniyor…
        </>
      ) : (
        <>
          <FiUploadCloud className="text-lg text-[#EFB059]" />
          Görseli yükle
        </>
      )}
    </button>
  );
}

export default function ImageLibraryUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const clearSelectedFile = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl(null);
    setFile(null);
  };

  const selectFile = (candidate: File | null) => {
    setError("");
    if (!candidate) return false;
    if (!ALLOWED_IMAGE_TYPES.has(candidate.type)) {
      clearSelectedFile();
      setError("Yalnızca JPG, PNG, WebP, GIF veya SVG seçebilirsiniz.");
      return false;
    }
    if (candidate.size > MAX_IMAGE_SIZE) {
      clearSelectedFile();
      setError("Görsel dosyası en fazla 8 MB olabilir.");
      return false;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const nextPreview = URL.createObjectURL(candidate);
    previewRef.current = nextPreview;
    setPreviewUrl(nextPreview);
    setFile(candidate);
    return true;
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0] ?? null;
    if (!droppedFile) return;

    const accepted = selectFile(droppedFile);
    if (inputRef.current && accepted) {
      const transfer = new DataTransfer();
      transfer.items.add(droppedFile);
      inputRef.current.files = transfer.files;
    } else if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <form action={uploadLibraryImageAction} className="space-y-4">
      <input
        ref={inputRef}
        id="library-image-upload"
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        required
        className="sr-only"
        onClick={(event) => { event.currentTarget.value = ""; }}
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
      />

      <label
        htmlFor="library-image-upload"
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed p-4 transition sm:p-5 ${
          isDragging
            ? "border-[#EFB059] bg-[#EFB059]/10"
            : file
              ? "border-emerald-300 bg-emerald-50/60"
              : "border-slate-300 bg-slate-50 hover:border-[#EFB059] hover:bg-[#EFB059]/5"
        }`}
      >
        {file && previewUrl ? (
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
              <Image src={previewUrl} alt="Seçilen görsel önizlemesi" fill unoptimized className="object-cover" />
              <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                <FiCheck />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#152741]">{file.name}</p>
              <p className="mt-1 text-xs text-slate-500">{formatFileSize(file.size)} MB</p>
              <span className="mt-2 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#152741] shadow-sm">
                Görseli değiştir
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center px-2 py-4 text-center sm:py-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#152741] text-2xl text-[#EFB059] shadow-sm">
              <FiImage />
            </span>
            <strong className="mt-3 text-sm text-[#152741] sm:text-base">Görsel seçin</strong>
            <span className="mt-1 text-xs leading-5 text-slate-500">Dokunun veya dosyayı buraya sürükleyip bırakın</span>
            <span className="mt-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-500 shadow-sm">
              JPG · PNG · WebP · GIF · SVG · En fazla 8 MB
            </span>
          </div>
        )}
      </label>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}

      <div className="flex justify-end">
        <UploadButton hasFile={Boolean(file)} />
      </div>
    </form>
  );
}
