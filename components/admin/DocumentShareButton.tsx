
"use client";

import { useState } from "react";
import { FiShare2 } from "react-icons/fi";

type Props = {
  fileName: string;
  fileUrl: string;
};

export default function DocumentShareButton({
  fileName,
  fileUrl,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (
        !navigator.share ||
        !navigator.canShare
      ) {
        throw new Error(
          "Bu tarayıcı dosya paylaşımını desteklemiyor. İndir butonunu kullanabilirsiniz.",
        );
      }

      const response = await fetch(fileUrl, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Belgeye erişim izniniz bulunmuyor."
            : "Belge alınamadı.",
        );
      }

      const blob = await response.blob();

      if (blob.size > 25 * 1024 * 1024) {
        throw new Error("Dosya paylaşım için çok büyük.");
      }

      const file = new File(
        [blob],
        fileName,
        {
          type:
            blob.type ||
            "application/octet-stream",
        },
      );

      if (!navigator.canShare({ files: [file] })) {
        throw new Error(
          "Bu cihaz dosya paylaşımını desteklemiyor. İndir butonunu kullanabilirsiniz.",
        );
      }

      await navigator.share({
        files: [file],
      });
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Dosya paylaşılamadı.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0 flex-1 sm:flex-none">
      <button
        type="button"
        disabled={loading}
        onClick={handleShare}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#152741] transition-colors hover:border-[#EFB059] hover:bg-[#FFF8EE] disabled:cursor-wait disabled:opacity-60 sm:px-4"
      >
        <FiShare2 className="shrink-0 text-[15px]" />
        {loading ? "Hazırlanıyor" : "Paylaş"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 text-[11px] text-red-600 sm:max-w-48"
        >
          {error}
        </p>
      )}
    </div>
  );
}
