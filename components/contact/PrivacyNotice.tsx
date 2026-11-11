
"use client";

import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PrivacyNotice({
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[calc(100%-32px)] max-w-[650px]
        rounded-lg border-4 border-[#152741]
        bg-white p-5 text-[#152741]
        shadow-xl backdrop:bg-black/50
        sm:p-7"
      aria-labelledby="privacy-title"
    >
      <h2
        id="privacy-title"
        className="mb-5 text-center font-tusli text-[18px] font-bold"
      >
        AYDINLATMA METNİ
      </h2>

      <div
        className="max-h-[55vh] space-y-4
          overflow-y-auto pr-2 text-[13px] leading-relaxed
          [&_h3]:font-bold
          [&_ul]:list-disc
          [&_ul]:pl-5"
      >
        {/* Eski formdaki aydınlatma metninin
            tüm başlıklarını, paragraflarını ve
            listesini buraya aynen taşıyacağız. */}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 flex h-[48px] w-full
          items-center justify-center rounded-md
          bg-[#152741] text-[13px]
          font-bold text-white"
      >
        KAPAT
      </button>
    </dialog>
  );
}
