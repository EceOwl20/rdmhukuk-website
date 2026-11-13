import { deleteDocumentAction, uploadDocumentAction } from "@/app/yonetim/actions";
import { PanelSection, SaveButton } from "@/components/admin/FormFields";
import { requireAdmin } from "@/lib/admin-auth";
import { getDocuments } from "@/lib/content-store";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireAdmin();
  const [documents, params] = await Promise.all([getDocuments(), searchParams]);
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-xs lg:text-sm font-semibold uppercase tracking-[0.15em] text-[#D79B43]">Özel arşiv</p>
        <h1 className="mt-1 lg:mt-2 text-2xl lg:text-3xl font-bold">Belgeler</h1>
        <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-slate-500">Buradaki dosyalar web sitesinde yayınlanmaz; yalnızca giriş yapan panel kullanıcısı indirebilir.</p>
      </div>
      {params.durum && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">İşlem başarıyla tamamlandı.</p>}
      <PanelSection title="Yeni belge yükle" description="Dosya başına en fazla 25 MB.">
        <form action={uploadDocumentAction} className="flex flex-wrap items-end gap-4">
          <label className="min-w-[260px] flex-1 text-sm font-semibold">Belge<input name="document" type="file" required className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 lg:px-4 py-2 lg:py-3 font-normal file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#152741] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#203b61]" /></label>
          <SaveButton>Belgeyi yükle</SaveButton>
        </form>
      </PanelSection>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {documents.length ? documents.map((document) => (
          <article key={document.id} className="border-b border-slate-100 p-5 last:border-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{document.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(document.size / 1024)} KB · {new Intl.DateTimeFormat("tr-TR").format(new Date(document.createdAt))}</p>
              </div>
              <div className="flex gap-2">
                <a href={`/api/yonetim/belgeler/${document.id}`} className="rounded-lg border border-slate-300 px-3 text-sm lg:px-4 py-2 lg:text-sm font-semibold">İndir</a>
                <form action={deleteDocumentAction}><input type="hidden" name="id" value={document.id} /><button className="rounded-lg border border-red-200 px-3 text-sm lg:px-4 py-2 lg:text-sm font-semibold text-red-700">Sil</button></form>
              </div>
            </div>
            {(document.mimeType === "application/pdf" || document.name.toLocaleLowerCase("tr-TR").endsWith(".pdf")) && (
              <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#152741]">PDF önizlemesini aç</summary>
                <div className="border-t border-slate-200 bg-white p-2 md:p-4">
                  <iframe src={`/api/yonetim/belgeler/${document.id}?goruntule=1`} title={`${document.name} PDF önizlemesi`} className="h-[520px] w-full rounded border-0 md:h-[720px]" />
                </div>
              </details>
            )}
          </article>
        )) : <p className="text-sm lg:text-md p-5 lg:p-7 text-slate-500">Henüz belge yüklenmedi.</p>}
      </div>
    </div>
  );
}
