
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogCard from "@/components/blog/BlogCard";

import {
  blogPosts,
  getBlogPost,
  getRelatedPosts,
} from "@/data/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

// Build sırasında örnek blog sayfalarını oluştur.
export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Blog yazısına özel SEO bilgileri.
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog Yazısı Bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      ...(post.coverImage
        ? { images: [{ url: post.coverImage }] }
        : {}),
    },
  };
}

export default async function BlogDetailPage({
  params,
}: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, 3);

  return (
    <>
      <BlogHeader
        title={post.title}
        description={post.excerpt}
        category={post.category}
        showBreadcrumb
      />

      <article className="w-full bg-white px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-[850px]">

          {/* ARTICLE INFO */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E9EE] pb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/home/header-logo.svg"
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-auto object-contain"
              />

              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#152741]">
                  {post.author}
                </span>

                <span className="text-[12px] text-[#738595]">
                  {post.category}
                </span>
              </div>
            </div>

            {post.publishedAt && (
              <time
                dateTime={post.publishedAt}
                className="text-[12px] text-[#738595]"
              >
                {new Intl.DateTimeFormat("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(
                  new Date(`${post.publishedAt}T12:00:00Z`)
                )}
              </time>
            )}
          </div>

          {/* OPTIONAL COVER */}
          {post.coverImage && (
            <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 850px) 100vw, 850px"
                className="object-cover"
              />
            </div>
          )}

          {/* INTRODUCTION */}
          <p className="mb-12 border-l-[3px] border-[#EFB059] pl-5 text-[15px] leading-[2] text-[#738595] md:text-[17px]">
            {post.excerpt}
          </p>

          {/* ARTICLE BODY */}
          <div className="space-y-12">
            {post.content.map((block, index) => (
              <section
                key={index}
                className="space-y-5"
              >
                {block.heading && (
                  <h2 className="text-[22px] leading-[1.5] font-bold text-[#152741] md:text-[27px]">
                    {block.heading}
                  </h2>
                )}

                {block.paragraphs.map(
                  (paragraph, paragraphIndex) => (
                    <p
                      key={paragraphIndex}
                      className="text-[14px] leading-[2] text-[#657A89] md:text-[15px]"
                    >
                      {paragraph}
                    </p>
                  )
                )}
              </section>
            ))}
          </div>

          {/* DISCLAIMER */}
          <aside className="mt-14 rounded-md border-l-[3px] border-[#EFB059] bg-[#F8FAFD] px-6 py-5">
            <p className="text-[12px] leading-[1.8] text-[#738595]">
              Bu içerik genel bilgilendirme amacıyla hazırlanmıştır.
              Somut bir hukuki uyuşmazlık için profesyonel
              hukuki değerlendirme yerine geçmez.
            </p>
          </aside>

          {/* BACK LINK */}
          <div className="mt-12 border-t border-[#E4E9EE] pt-7">
            <Link
              href="/blog"
              className="font-tusli text-[13px] font-bold text-[#152741] transition-colors hover:text-[#D79B43]"
            >
              ← TÜM BLOG YAZILARI
            </Link>
          </div>
        </div>
      </article>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#F8FAFD] px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-8 w-1 bg-[#EFB059]" />

              <h2 className="text-[23px] font-bold text-[#152741] md:text-[28px]">
                DİĞER YAZILAR
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard
                  key={related.id}
                  post={related}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
