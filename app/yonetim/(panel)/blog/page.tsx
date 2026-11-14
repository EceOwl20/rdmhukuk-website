
import Link from "next/link";
import {
  FiBookOpen,
  FiCheckCircle,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import { deleteBlogPostAction } from "@/app/yonetim/actions";
import AdminForm from "@/components/admin/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/content-store";

type Props = {
  searchParams: Promise<{ durum?: string }>;
};

export default async function AdminBlogPage({
  searchParams,
}: Props) {
  await requireAdmin();

  const [content, params] = await Promise.all([
    getSiteContent(),
    searchParams,
  ]);

  const posts = content.blog.posts;

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

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">

            {/* CATEGORY */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#EFB059]/20 bg-[#EFB059]/10 px-3 py-1.5">
              <FiBookOpen className="text-xs text-[#EFB059]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EFB059] sm:text-[11px]">
                İçerik Yönetimi
              </span>
            </div>

            <h1 className="text-[24px] font-bold leading-tight text-white sm:text-[30px] lg:text-[36px]">
              Blog Yazıları
            </h1>

            <p className="mt-3 max-w-xl text-[12px] leading-[1.8] text-white/70 sm:text-[13px] lg:text-[14px]">
              Blog yazılarınızı oluşturun, mevcut içerikleri
              düzenleyin ve web sitenizde yayınlanan
              makaleleri tek bir yerden yönetin.
            </p>

            {/* COUNT */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07]">
                <FiFileText className="text-lg text-[#EFB059]" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/50">
                  Toplam Blog Yazısı
                </p>

                <p className="text-[19px] font-bold text-white">
                  {posts.length}
                </p>
              </div>
            </div>
          </div>

          {/* ADD NEW BLOG */}
          <Link
            href="/yonetim/blog/yeni"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#EFB059] px-5 py-3 text-[12px] font-bold text-[#152741] transition-colors hover:bg-[#F5BF75] sm:w-auto sm:text-[13px]"
          >
            <FiPlus className="text-lg" />
            Yeni Yazı Ekle
          </Link>
        </div>
      </header>

      {/* SUCCESS MESSAGE */}
      {params.durum && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-600" />

          <div>
            <p className="text-[13px] font-semibold text-emerald-800 sm:text-sm">
              İşlem başarıyla tamamlandı
            </p>

            <p className="mt-1 text-[11px] leading-5 text-emerald-700 sm:text-xs">
              Blog içerikleriniz güncellendi.
            </p>
          </div>
        </div>
      )}

      {/* BLOG LIST */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(21,39,65,0.035)]">

        {/* LIST HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F3F7] text-[#152741]">
              <FiBookOpen className="text-xl" />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#152741] sm:text-[17px]">
                Tüm Blog Yazıları
              </h2>

              <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                Mevcut yazılarınızı görüntüleyin ve yönetin.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-[#F0F3F7] px-3 py-1.5 text-[11px] font-semibold text-[#738595]">
            {posts.length} yazı
          </span>
        </div>

        {/* POSTS */}
        {posts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <article
                key={post.id}
                className="p-4 transition-colors hover:bg-[#FAFBFD] sm:p-5 lg:px-7 lg:py-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  {/* POST DETAILS */}
                  <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#152741] sm:h-12 sm:w-12">
                      <FiFileText className="text-[21px]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="inline-flex max-w-full rounded-md bg-[#EFB059]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#A47434]">
                        {post.category}
                      </span>

                      <h3 className="mt-2 break-words text-[13px] font-semibold leading-5 text-[#152741] sm:text-[15px] sm:leading-6">
                        {post.title}
                      </h3>

                      <p
                        className="mt-1.5 break-all text-[11px] leading-5 text-slate-500 sm:text-xs"
                        title={`/blog/${post.slug}`}
                      >
                        /blog/{post.slug}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:shrink-0">

                    {/* PUBLIC VIEW */}
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${post.title} yazısını görüntüle`}
                      title="Yazıyı görüntüle"
                      className="flex min-h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#738595] transition-colors hover:border-[#EFB059] hover:text-[#152741]"
                    >
                      <FiExternalLink className="text-[16px]" />
                    </Link>

                    {/* EDIT */}
                    <Link
                      href={`/yonetim/blog/${post.id}`}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-[#152741] transition-colors hover:border-[#EFB059] hover:bg-[#FFF8EE] md:flex-none"
                    >
                      <FiEdit3 className="text-[15px]" />
                      Düzenle
                    </Link>

                    {/* DELETE */}
                    <AdminForm
                      action={deleteBlogPostAction}
                      confirmation={{
                        title: "Blog yazısı silinsin mi?",
                        description: `“${post.title}” kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
                        confirmLabel: "Yazıyı sil",
                      }}
                      className="flex-1 md:flex-none"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={post.id}
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
              </article>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F3F7] text-[#738595]">
              <FiBookOpen className="text-[30px]" />
            </div>

            <h3 className="text-[15px] font-semibold text-[#152741] sm:text-[17px]">
              Henüz blog yazısı bulunmuyor
            </h3>

            <p className="mt-2 max-w-sm text-[12px] leading-6 text-slate-500 sm:text-[13px]">
              İlk blog yazınızı oluşturarak web sitenizin
              içeriklerini zenginleştirmeye başlayabilirsiniz.
            </p>

            <Link
              href="/yonetim/blog/yeni"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#152741] px-5 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#203B61]"
            >
              <FiPlus className="text-base" />
              İlk Yazıyı Oluştur
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
