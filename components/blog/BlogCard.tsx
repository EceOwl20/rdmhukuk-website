
import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/data/blog";

type Props = {
  post: BlogPost;
};

export default function BlogCard({ post }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#E4E9EE] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col"
        aria-label={`${post.title} yazısını oku`}
      >
        {/* COVER */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E7EDF3]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#E8EDF3] via-[#F7F9FB] to-[#D9E2EB] px-6">
              <Image
                src="/images/home/header-logo.svg"
                alt=""
                width={65}
                height={65}
                className="h-[65px] w-auto object-contain"
              />

              <span className="text-center font-tusli text-[14px] font-bold tracking-wider text-[#152741]">
                RDM HUKUK
              </span>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-[16px] w-[3px] bg-[#EFB059]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#738595]">
              {post.category}
            </span>
          </div>

          <h2 className="mb-4 line-clamp-2 text-[19px] leading-[1.4] font-bold text-[#152741] lg:text-[21px]">
            {post.title}
          </h2>

          <p className="mb-7 line-clamp-3 text-[13px] leading-[1.8] text-[#738595] sm:text-[14px]">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-[#E4E9EE] pt-5">
            <span className="text-[11px] text-[#738595]">
              {post.publishedAt
                ? new Intl.DateTimeFormat("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(
                    new Date(`${post.publishedAt}T12:00:00Z`)
                  )
                : post.author}
            </span>

            <span className="font-tusli text-[12px] font-bold text-[#152741] transition-colors group-hover:text-[#D79B43]">
              DEVAMINI OKU →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
