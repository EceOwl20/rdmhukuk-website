"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export default function PanelError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Yönetim paneli yüklenemedi:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center py-10">
      <section className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
          <FiAlertTriangle aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-xl font-bold text-[#152741] sm:text-2xl">
          Panel verileri yüklenemedi
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          Veri kaybını önlemek için işlem durduruldu. Sunucudaki içerik ve kayıt
          dosyalarını kontrol ettikten sonra tekrar deneyin.
        </p>

        <button
          type="button"
          onClick={retry}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#152741] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#203b61]"
        >
          <FiRefreshCw aria-hidden="true" />
          Tekrar dene
        </button>
      </section>
    </div>
  );
}
