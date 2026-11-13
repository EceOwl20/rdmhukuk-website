import Link from "next/link";
import { deleteBlogPostAction } from "@/app/yonetim/actions";
import { getSiteContent } from "@/lib/content-store";

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const [content, params] = await Promise.all([getSiteContent(), searchParams]);
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D79B43]">İçerik yönetimi</p>
          <h1 className="mt-2 text-3xl font-bold">Blog Yazıları</h1>
        </div>
        <Link href="/yonetim/blog/yeni" className="rounded-lg bg-[#152741] px-5 py-3 font-semibold text-white">Yeni yazı ekle</Link>
      </div>
      {params.durum && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">İşlem başarıyla tamamlandı.</p>}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {content.blog.posts.length ? content.blog.posts.map((post) => (
          <article key={post.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#D79B43]">{post.category}</p>
              <h2 className="mt-1 font-bold">{post.title}</h2>
              <p className="mt-1 text-xs text-slate-500">/blog/{post.slug}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/yonetim/blog/${post.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Düzenle</Link>
              <form action={deleteBlogPostAction}>
                <input type="hidden" name="id" value={post.id} />
                <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">Sil</button>
              </form>
            </div>
          </article>
        )) : <p className="p-8 text-slate-500">Henüz blog yazısı bulunmuyor.</p>}
      </div>
    </div>
  );
}
