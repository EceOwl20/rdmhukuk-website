
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiEye,
  FiFile,
  FiFileText,
  FiFolder,
  FiLock,
  FiShield,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";

import {
  deleteDocumentAction,
  uploadDocumentAction,
} from "@/app/yonetim/actions";

import AdminForm from "@/components/admin/AdminForm";
import { SaveButton } from "@/components/admin/FormFields";
import { requireAdmin } from "@/lib/admin-auth";
import { getDocuments } from "@/lib/content-store";

type Props = {
  searchParams: Promise<{ durum?: string }>;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 1,
    }).format(bytes / 1024)} KB`;
  }

  return `${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
  }).format(bytes / (1024 * 1024))} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DocumentsPage({
  searchParams,
}: Props) {
  await requireAdmin();

  const [documents, params] = await Promise.all([
    getDocuments(),
    searchParams,
  ]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-10 sm:space-y-6 lg:space-y-8">

      {/* PAGE HEADER */}
      <header className="relative overflow-hidden rounded-2xl bg-[#152741] px-5 py-6 text-white shadow-[0_12px_35px_rgba(21,39,65,0.12)] sm:px-7 sm:py-8 lg:px-9 lg:py-10">

        {/* DECORATIVE BACKGROUND */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full border border-white/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -right-12 h-64 w-64 rounded-full border border-[#EFB059]/20"
        />

        <div className="relative z-10 flex flex-col gap-4 lg:gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="max-w-2xl">
            {/* CATEGORY */}
            <div className="mb-2 lg:mb-4 inline-flex items-center gap-2 rounded-full border border-[#EFB059]/20 bg-[#EFB059]/10 px-3 py-1.5">
              <FiLock className="text-xs text-[#EFB059]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EFB059] sm:text-[11px]">
                Özel Arşiv
              </span>
            </div>

            <h1 className="text-[24px] font-bold leading-tight text-white sm:text-[30px] lg:text-[36px]">
              Belgeler
            </h1>

            <p className="mt-2 lg:mt-3 max-w-xl text-[12px] leading-[1.8] text-white/70 sm:text-[13px] lg:text-[14px]">
              Belgelerinizi yükleyin, arşivleyin ve
              ihtiyaç duyduğunuzda güvenle indirin.
              Bu belgeler web sitesinde yayınlanmaz.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-[11px] text-white/70 sm:text-xs">
              <FiShield className="shrink-0 text-[#EFB059] text-[13px] lg:text-[15px]" />
              <span>Yalnızca yetkili panel kullanıcıları</span>
            </div>
          </div>

          {/* DOCUMENT COUNT */}
          <div className="w-fit rounded-xl border border-white/15 bg-white/[0.07] px-4 lg:px-5 py-2.5 lg:py-4 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
              Toplam Belge
            </p>

            <p className="mt-1 text-[24px] font-bold text-white sm:text-[28px] lg:text-[32px]">
              {documents.length}
            </p>
          </div>
        </div>
      </header>

      {/* SUCCESS MESSAGE */}
      {params.durum && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:px-5 sm:py-4"
        >
          <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-600" />

          <div>
            <p className="text-[13px] font-semibold text-emerald-800 sm:text-sm">
              İşlem başarıyla tamamlandı
            </p>

            <p className="mt-1 text-[11px] leading-5 text-emerald-700 sm:text-xs">
              Arşivinizdeki değişiklikler kaydedildi.
            </p>
          </div>
        </div>
      )}

      {/* UPLOAD SECTION */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(21,39,65,0.035)]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F3F7] text-[#152741]">
            <FiUploadCloud className="text-xl" />
          </div>

          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#152741] sm:text-[17px]">
              Yeni Belge Yükle
            </h2>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-[12px]">
              Arşivinize yeni bir dosya ekleyin.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          <AdminForm
            action={uploadDocumentAction}
            className="space-y-5"
          >
            {/* FILE INPUT */}
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-[#FAFBFD] px-4 py-8 text-center transition-colors hover:border-[#EFB059] hover:bg-[#FFFCF7] sm:px-6 sm:py-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#152741] shadow-sm">
                <FiUploadCloud className="text-[27px]" />
              </span>

              <span className="text-[13px] font-semibold text-[#152741] sm:text-[15px]">
                Dosyanızı buradan seçin
              </span>

              <span className="max-w-md text-[11px] leading-5 text-slate-500 sm:text-xs">
                Yükleyeceğiniz belgeler yalnızca yönetim
                panelinde saklanır.
              </span>

              <span className="rounded-lg bg-[#152741] px-4 py-2.5 text-xs font-semibold text-white transition-colors group-hover:bg-[#203B61]">
                Dosya Seç
              </span>

              <input
                name="document"
                type="file"
                required
                aria-label="Yüklenecek belge"
                className="sr-only"
              />
            </label>

            {/* UPLOAD FOOTER */}
            <div className="flex flex-col gap-3 rounded-xl bg-[#F3F6FA] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="mt-0.5 shrink-0 text-sm text-[#738595]" />

                <p className="text-[11px] leading-5 text-slate-500 sm:text-xs">
                  Dosya başına maksimum 25 MB.
                  Dosyalar web sitesinde herkese açık değildir.
                </p>
              </div>

              <div className="w-full shrink-0 sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
                <SaveButton>Belgeyi Yükle</SaveButton>
              </div>
            </div>
          </AdminForm>
        </div>
      </section>

      {/* DOCUMENT LIST */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(21,39,65,0.035)]">

        {/* LIST HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F3F7] text-[#152741]">
              <FiFolder className="text-xl" />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#152741] sm:text-[17px]">
                Arşivdeki Belgeler
              </h2>

              <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                Yüklenmiş dosyalarınızı yönetin.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-[#F0F3F7] px-3 py-1.5 text-[11px] font-semibold text-[#738595]">
            {documents.length} belge
          </span>
        </div>

        {/* DOCUMENTS */}
        {documents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {documents.map((document) => {
              const isPdf =
                document.mimeType === "application/pdf" ||
                document.name
                  .toLocaleLowerCase("tr-TR")
                  .endsWith(".pdf");

              return (
                <article
                  key={document.id}
                  className="p-4 transition-colors hover:bg-[#FAFBFD] sm:p-5 lg:px-7 lg:py-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* FILE DETAILS */}
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                        isPdf
                          ? "bg-red-50 text-red-600"
                          : "bg-[#EEF2F7] text-[#152741]"
                      }`}>
                        {isPdf ? (
                          <FiFileText className="text-[21px]" />
                        ) : (
                          <FiFile className="text-[21px]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="break-words text-[13px] font-semibold leading-5 text-[#152741] sm:text-[14px]"
                          title={document.name}
                        >
                          {document.name}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
                          <span>
                            {formatFileSize(document.size)}
                          </span>

                          <span aria-hidden="true">•</span>

                          <time dateTime={document.createdAt}>
                            {formatDate(document.createdAt)}
                          </time>

                          {isPdf && (
                            <>
                              <span aria-hidden="true">•</span>
                              <span className="font-semibold text-red-500">
                                PDF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
                      <a
                        href={`/api/yonetim/belgeler/${document.id}`}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-[#152741] transition-colors hover:border-[#EFB059] hover:bg-[#FFF8EE] sm:flex-none"
                      >
                        <FiDownload className="text-[15px]" />
                        İndir
                      </a>

                      <AdminForm
                        action={deleteDocumentAction}
                        confirmation={{
                          title: "Belge silinsin mi?",
                          description: `“${document.name}” arşivden kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
                          confirmLabel: "Belgeyi sil",
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={document.id}
                        />

                        <button
                          type="submit"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <FiTrash2 className="text-[15px]" />
                          Sil
                        </button>
                      </AdminForm>
                    </div>
                  </div>

                  {/* PDF PREVIEW */}
                  {isPdf && (
                    <details className="group mt-4 overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFD] sm:mt-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2 text-[12px] font-semibold text-[#152741] sm:text-[13px]">
                          <FiEye className="shrink-0 text-[16px] text-[#738595]" />
                          PDF Önizlemesini Aç
                        </span>

                        <FiChevronDown className="shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                      </summary>

                      <div className="border-t border-slate-200 bg-white p-2 sm:p-3 lg:p-4">
                        <iframe
                          src={`/api/yonetim/belgeler/${document.id}?goruntule=1`}
                          title={`${document.name} PDF önizlemesi`}
                          loading="lazy"
                          className="h-[360px] w-full rounded-lg border-0 bg-slate-100 sm:h-[520px] lg:h-[720px]"
                        />
                      </div>
                    </details>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F3F7] text-[#738595]">
              <FiFolder className="text-[30px]" />
            </div>

            <h3 className="text-[15px] font-semibold text-[#152741] sm:text-[17px]">
              Henüz belge yüklenmedi
            </h3>

            <p className="mt-2 max-w-sm text-[12px] leading-6 text-slate-500 sm:text-[13px]">
              İlk belgenizi yukarıdaki yükleme alanından
              ekleyerek arşivinizi oluşturmaya başlayabilirsiniz.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
