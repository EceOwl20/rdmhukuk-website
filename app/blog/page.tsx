
import type { Metadata } from "next";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogCard from "@/components/blog/BlogCard";

import { getSiteContent } from "@/lib/content-store";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "RDM Hukuk Bürosu blog sayfası. KVKK, sağlık hukuku, şirketler hukuku ve diğer hukuk alanları hakkında bilgilendirici içerikler.",
};

export default async function BlogPage() {
  const { blog } = await getSiteContent();
  return (
    <>
      <BlogHeader
        title={blog.title}
        description={blog.description}
        showBreadcrumb
      />

      <section className="w-full bg-[#F8FAFD] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          {/* SECTION TITLE */}
          <div className="mb-12 flex items-center gap-4">
            <div className="h-9 w-[4px] bg-[#EFB059]" />

            <div>
              <h2 className="text-[23px] font-bold text-[#152741] md:text-[28px]">
                GÜNCEL YAZILAR
              </h2>

              <p className="mt-2 text-[13px] text-[#738595]">
                Hukuk dünyasından bilgilendirici içerikler
              </p>
            </div>
          </div>

          {/* BLOG GRID */}
          {blog.posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9">
              {blog.posts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white px-6 py-20 text-center">
              <p className="text-[15px] text-[#738595]">
                Henüz yayınlanmış blog yazısı bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
