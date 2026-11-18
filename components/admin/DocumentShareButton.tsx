"use client";

import { useState } from "react";
import {
  FiCheck,
  FiClock,
  FiCopy,
  FiKey,
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
import type { ActiveDocumentShare } from "@/lib/site-content-types";

type ShareDuration = "1h" | "24h" | "7d";

type ActiveShare = ActiveDocumentShare & {
  url?: string;
  pin?: string;
};

type Props = {
  documentId: string;
  fileName: string;
  initialShares: ActiveDocumentShare[];
};

const durationOptions: { value: ShareDuration; label: string }[] = [
  { value: "1h", label: "1 saat" },
  { value: "24h", label: "24 saat" },
  { value: "7d", label: "7 gün" },
];

function formatShareDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default function DocumentShareButton({
  documentId,
  fileName,
  initialShares,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<ShareDuration>("24h");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");
  const [activeShares, setActiveShares] =
    useState<ActiveShare[]>(initialShares);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [copiedPinShareId, setCopiedPinShareId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateShare() {
    if (loading) return;

    setLoading(true);
    setError(null);
    setCopiedShareId(null);

    try {
      if (activeShares.length > 0) {
        throw new Error(
          "Yeni bağlantı oluşturmadan önce mevcut bağlantıyı iptal edin.",
        );
      }

      if (pinEnabled && !/^\d{6}$/.test(pin)) {
        throw new Error("PIN 6 rakamdan oluşmalıdır.");
      }

      const result = await createDocumentShareAction(
        documentId,
        duration,
        pinEnabled ? pin : "",
      );
      if (!result.success) throw new Error(result.error);

      const url = new URL(
        `/paylasim/belge/${result.token}`,
        window.location.origin,
      ).toString();

      setActiveShares([
        {
          shareId: result.shareId,
          documentId,
          pinProtected: pinEnabled,
          createdAt: new Date().toISOString(),
          expiresAt: result.expiresAt,
          url,
          pin: pinEnabled ? pin : undefined,
        },
      ]);
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

  async function handleCopyPin(share: ActiveShare) {
    if (!share.pin) return;

    setError(null);

    try {
      await navigator.clipboard.writeText(share.pin);
      setCopiedPinShareId(share.shareId);
    } catch {
      setError(
        "PIN kopyalanamadı. Tarayıcınızın pano iznini kontrol edin.",
      );
    }
  }

  async function handleCopy(share: ActiveShare) {
    if (!share.url) return;

    setError(null);

    try {
      await navigator.clipboard.writeText(share.url);
      setCopiedShareId(share.shareId);
    } catch {
      setError(
        "Bağlantı kopyalanamadı. Tarayıcınızın pano iznini kontrol edin.",
      );
    }
  }

  async function handleRevoke(shareId: string) {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await revokeDocumentShareAction(shareId);
      if (!result.success) throw new Error(result.error);

      setActiveShares((shares) =>
        shares.filter((share) => share.shareId !== shareId),
      );
      setCopiedShareId((current) => (current === shareId ? null : current));
      setCopiedPinShareId((current) =>
        current === shareId ? null : current,
      );
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
        {activeShares.length > 0 && (
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] text-emerald-700">
            {activeShares.length}
          </span>
        )}
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

          {activeShares.length === 0 ? (
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
                    setDuration(event.target.value as ShareDuration)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 text-[12px] text-[#152741] outline-none transition-colors focus:border-[#D79B43]"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] leading-5 text-slate-500">
                Bağlantıya sahip kişiler, seçilen süre boyunca belgeyi
                indirebilir.
              </p>

              <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] p-3">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={pinEnabled}
                    disabled={loading}
                    onChange={(event) => {
                      setPinEnabled(event.target.checked);
                      if (!event.target.checked) setPin("");
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#152741]"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#152741]">
                      <FiKey />
                      PIN ile koru
                    </span>
                    <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                      {"PIN'i bağlantıdan ayrı bir kanaldan paylaşın."}
                    </span>
                  </span>
                </label>

                {pinEnabled && (
                  <div className="mt-3">
                    <label
                      htmlFor={`share-pin-${documentId}`}
                      className="mb-1.5 block text-[11px] font-semibold text-[#152741]"
                    >
                      6 haneli PIN
                    </label>
                    <input
                      id={`share-pin-${documentId}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={6}
                      value={pin}
                      disabled={loading}
                      onChange={(event) =>
                        setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-[16px] font-semibold tracking-[0.3em] text-[#152741] outline-none focus:border-[#D79B43]"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleCreateShare}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#152741] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#243C5D] disabled:cursor-wait disabled:opacity-60"
              >
                <FiLink size={15} />
                {loading ? "Oluşturuluyor..." : "Güvenli Bağlantı Oluştur"}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-[11px] leading-5 text-slate-500">
                Bu belge için aktif paylaşım bağlantıları bulunuyor. Yeni bir
                bağlantı oluşturmadan önce mevcut bağlantıyı iptal edin.
              </p>

              {activeShares.map((share) => {
                const whatsappUrl = share.url
                  ? `https://wa.me/?text=${encodeURIComponent(
                      `${fileName}\n${share.url}`,
                    )}`
                  : null;
                const mailUrl = share.url
                  ? `mailto:?subject=${encodeURIComponent(
                      `Belge paylaşımı: ${fileName}`,
                    )}&body=${encodeURIComponent(
                      `Merhaba,\n\nBelgeye aşağıdaki bağlantı üzerinden erişebilirsiniz:\n\n${share.url}\n\nBağlantının geçerlilik süresi sınırlıdır.`,
                    )}`
                  : null;

                return (
                  <div
                    key={share.shareId}
                    className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3"
                  >
                    <div>
                      <p className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
                        <FiCheck />
                        Aktif bağlantı
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-700">
                        Son geçerlilik: {formatShareDate(share.expiresAt)}
                      </p>
                      {share.pinProtected && (
                        <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                          <FiKey /> PIN korumalı
                        </p>
                      )}
                    </div>

                    {share.url ? (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            aria-label="Paylaşım bağlantısı"
                            value={share.url}
                            onFocus={(event) => event.currentTarget.select()}
                            className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(share)}
                            aria-label="Bağlantıyı kopyala"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-[#152741] hover:bg-emerald-50"
                          >
                            {copiedShareId === share.shareId ? (
                              <FiCheck size={16} />
                            ) : (
                              <FiCopy size={16} />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={whatsappUrl ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            referrerPolicy="no-referrer"
                            className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <FiMessageCircle size={15} />
                            WhatsApp
                          </a>
                          <a
                            href={mailUrl ?? undefined}
                            className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#152741] hover:bg-slate-100"
                          >
                            <FiMail size={15} />
                            E-posta
                          </a>
                        </div>

                        {share.pinProtected && share.pin && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-[10px] font-semibold text-amber-800">
                              {"PIN'i ayrı kanaldan paylaşın"}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <code className="min-w-0 flex-1 rounded-md bg-white px-3 py-2 text-center text-[16px] font-bold tracking-[0.25em] text-[#152741]">
                                {share.pin}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopyPin(share)}
                                aria-label="PIN'i kopyala"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-[#152741] hover:bg-amber-100"
                              >
                                {copiedPinShareId === share.shareId ? (
                                  <FiCheck size={16} />
                                ) : (
                                  <FiCopy size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="rounded-lg bg-white/80 px-3 py-2 text-[11px] leading-5 text-slate-600">
                        Güvenlik nedeniyle mevcut bağlantının adresi sunucuda
                        {share.pinProtected ? " ve PIN" : ""} saklanmaz.
                        Bağlantıyı geçersiz kılmak için iptal edin.
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRevoke(share.shareId)}
                      className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <FiTrash2 size={14} />
                      {loading ? "İptal ediliyor..." : "Bağlantıyı İptal Et"}
                    </button>
                  </div>
                );
              })}
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
