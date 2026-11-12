
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogCard from "@/components/blog/BlogCard";

import { getSiteContent } from "@/lib/content-store";
import type { BlogPost } from "@/data/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

function ArticleContent({ content }: { content: BlogPost["content"] }) {
  return (
    <div className="space-y-7">
      {content.map((block, index) => {
        if (!("type" in block)) {
          return (
            <section key={index} className="space-y-5 py-3">
              {block.heading && <h2 className="text-[22px] leading-[1.5] font-bold text-[#152741] md:text-[27px]">{block.heading}</h2>}
              {block.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="text-[14px] leading-[2] text-[#657A89] md:text-[15px]">{paragraph}</p>
              ))}
            </section>
          );
        }

        if (block.type === "heading") {
          return <h2 key={index} className="pt-5 text-[22px] leading-[1.5] font-bold text-[#152741] md:text-[27px]">{block.text}</h2>;
        }
        if (block.type === "paragraph") {
          return <p key={index} className="whitespace-pre-line text-[14px] leading-[2] text-[#657A89] md:text-[15px]">{block.text}</p>;
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-3 rounded-lg bg-[#F8FAFD] px-6 py-5 text-[14px] leading-[1.8] text-[#657A89] md:px-8 md:text-[15px]">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="relative pl-6 before:absolute before:left-0 before:top-[0.7em] before:h-2 before:w-2 before:rounded-full before:bg-[#EFB059]">{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <figure key={index} className="py-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#F1F4F7]">
              <Image src={block.src} alt={block.alt} fill sizes="(max-width: 850px) 100vw, 850px" className="object-contain" />
            </div>
            {block.alt && <figcaption className="mt-3 text-center text-xs leading-5 text-[#738595]">{block.alt}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

// Build sırasında örnek blog sayfalarını oluştur.
export async function generateStaticParams() {
  const { blog } = await getSiteContent();
  return blog.posts.map((post) => ({
    slug: post.slug,
  }));
}

// Blog yazısına özel SEO bilgileri.
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getSiteContent()).blog.posts.find((item) => item.slug === slug);

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
  const { blog } = await getSiteContent();
  const post = blog.posts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blog.posts.filter((item) => item.slug !== post.slug).slice(0, 3);

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
          <ArticleContent content={post.content} />

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
