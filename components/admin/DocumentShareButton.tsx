
"use client";

import { useState } from "react";
import {
  FiCheck,
  FiClock,
  FiCopy,
  FiLink,
  FiMail,
  FiMessageCircle,
  FiShare2,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  createDocumentShareAction,
  revokeDocumentShareAction,
} from "@/app/yonetim/actions";

type ShareDuration = "1h" | "24h" | "7d";

type Props = {
  documentId: string;
  fileName: string;
};

type ActiveShare = {
  shareId: string;
  url: string;
  expiresAt: string;
};

const durationOptions: {
  value: ShareDuration;
  label: string;
}[] = [
  { value: "1h", label: "1 saat" },
  { value: "24h", label: "24 saat" },
  { value: "7d", label: "7 gün" },
];

export default function DocumentShareButton({
  documentId,
  fileName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] =
    useState<ShareDuration>("24h");

  const [activeShare, setActiveShare] =
    useState<ActiveShare | null>(null);

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateShare() {
    if (loading) return;

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      // Önceki bağlantı iptal edilmeden yenisini oluşturma.
      if (activeShare) {
        throw new Error(
          "Yeni bağlantı oluşturmadan önce mevcut bağlantıyı iptal edin.",
        );
      }

      const result = await createDocumentShareAction(
        documentId,
        duration,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      const url = new URL(
        `/paylasim/belge/${result.token}`,
        window.location.origin,
      ).toString();

      setActiveShare({
        shareId: result.shareId,
        url,
        expiresAt: result.expiresAt,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Paylaşım bağlantısı oluşturulamadı.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!activeShare) return;

    setError(null);

    try {
      await navigator.clipboard.writeText(
        activeShare.url,
      );

      setCopied(true);
    } catch {
      setError(
        "Bağlantı kopyalanamadı. Tarayıcınızın pano iznini kontrol edin.",
      );
    }
  }

  async function handleRevoke() {
    if (!activeShare || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await revokeDocumentShareAction(
        activeShare.shareId,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      setActiveShare(null);
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Paylaşım bağlantısı iptal edilemedi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const whatsappUrl = activeShare
    ? `https://wa.me/?text=${encodeURIComponent(
        `${fileName}\n${activeShare.url}`,
      )}`
    : null;

  const mailUrl = activeShare
    ? `mailto:?subject=${encodeURIComponent(
        `Belge paylaşımı: ${fileName}`,
      )}&body=${encodeURIComponent(
        `Merhaba,\n\nBelgeye aşağıdaki bağlantı üzerinden erişebilirsiniz:\n\n${activeShare.url}\n\nBağlantının geçerlilik süresi sınırlıdır.`,
      )}`
    : null;

  return (
   <div className="relative min-w-0 flex-1 sm:flex-none">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setError(null);
        }}
        aria-expanded={open}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#152741] transition-colors hover:border-[#EFB059] hover:bg-[#FFF8EE] sm:px-4"
      >
        <FiShare2 className="shrink-0 text-[15px]" />
        Paylaş
      </button>

      {open && (
         <div className="absolute right-0 top-full z-50 mt-2 w-[min(340px,calc(100vw-40px))] rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(21,39,65,0.15)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-[13px] font-semibold text-[#152741]">
                Güvenli Belge Paylaşımı
              </h4>

              <p className="mt-1 break-words text-[11px] text-slate-500">
                {fileName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Paylaşım panelini kapat"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#152741]"
            >
              <FiX size={17} />
            </button>
          </div>

          {!activeShare ? (
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor={`share-duration-${documentId}`}
                  className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#152741]"
                >
                  <FiClock />
                  Bağlantı Geçerlilik Süresi
                </label>

                <select
                  id={`share-duration-${documentId}`}
                  value={duration}
                  disabled={loading}
                  onChange={(event) =>
                    setDuration(
                      event.target.value as ShareDuration,
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 text-[12px] text-[#152741] outline-none transition-colors focus:border-[#D79B43]"
                >
                  {durationOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] leading-5 text-slate-500">
                Bağlantıya sahip kişiler, seçilen süre
                boyunca belgeyi indirebilir.
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={handleCreateShare}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#152741] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#243C5D] disabled:cursor-wait disabled:opacity-60"
              >
                <FiLink size={15} />
                {loading
                  ? "Oluşturuluyor..."
                  : "Güvenli Bağlantı Oluştur"}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
                  <FiCheck />
                  Bağlantı oluşturuldu
                </p>

                <p className="mt-1 text-[11px] text-emerald-700">
                  Son geçerlilik:
                  {" "}
                  {new Intl.DateTimeFormat("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/Istanbul",
                  }).format(
                    new Date(activeShare.expiresAt),
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#152741]">
                  Paylaşım Bağlantısı
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    aria-label="Paylaşım bağlantısı"
                    value={activeShare.url}
                    onFocus={(event) =>
                      event.currentTarget.select()
                    }
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 text-[11px] text-slate-600 outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Bağlantıyı kopyala"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#152741] hover:bg-slate-50"
                  >
                    {copied ? (
                      <FiCheck size={16} />
                    ) : (
                      <FiCopy size={16} />
                    )}
                  </button>
                </div>

                {copied && (
                  <p
                    role="status"
                    className="text-[11px] text-emerald-700"
                  >
                    Bağlantı kopyalandı.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <FiMessageCircle size={15} />
                    WhatsApp
                  </a>
                )}

                {mailUrl && (
                  <a
                    href={mailUrl}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2 text-[11px] font-semibold text-[#152741] transition-colors hover:bg-slate-100"
                  >
                    <FiMail size={15} />
                    E-posta
                  </a>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleRevoke}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 size={14} />
                {loading
                  ? "İptal ediliyor..."
                  : "Bağlantıyı İptal Et"}
              </button>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] leading-5 text-red-600"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
