
"use client";

import { useState } from "react";
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentFileInput() {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("Dosya boyutu en fazla 25 MB olabilir.");

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError(null);
  }

  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-[#FAFBFD] px-4 py-8 text-center transition-colors hover:border-[#EFB059] hover:bg-[#FFFCF7] sm:px-6 sm:py-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#152741] shadow-sm">
        <FiUploadCloud className="text-[27px]" />
      </span>

      <span className="text-[13px] font-semibold text-[#152741] sm:text-[15px]">
        Dosyanızı buradan seçin
      </span>

      <span className="max-w-md text-[11px] leading-5 text-slate-500 sm:text-xs">
        Yükleyeceğiniz belgeler yalnızca yönetim panelinde saklanır.
      </span>

      <span className="rounded-lg bg-[#152741] px-4 py-2.5 text-xs font-semibold text-white transition-colors group-hover:bg-[#203B61]">
        {selectedFile ? "Dosyayı Değiştir" : "Dosya Seç"}
      </span>

      <input
        name="document"
        type="file"
        required
        aria-label="Yüklenecek belge"
        className="sr-only"
        onChange={handleFileChange}
      />

      {selectedFile && (
        <span className="mt-3 flex w-full max-w-md items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left">
          <FiFileText className="shrink-0 text-xl text-emerald-600" />

          <span className="min-w-0 flex-1">
            <span className="block break-all text-[12px] font-semibold text-[#152741]">
              {selectedFile.name}
            </span>

            <span className="mt-1 block text-[11px] text-slate-500">
              {formatFileSize(selectedFile.size)}
            </span>
          </span>

          <FiCheckCircle className="shrink-0 text-lg text-emerald-600" />
        </span>
      )}

      {error && (
        <span
          role="alert"
          className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600"
        >
          <FiAlertCircle />
          {error}
        </span>
      )}
    </label>
  );
}
