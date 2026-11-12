
import Link from "next/link";

type BlogHeaderProps = {
  title: string;
  description?: string;
  category?: string;
  showBreadcrumb?: boolean;
};

export default function BlogHeader({
  title,
  description,
  category,
  showBreadcrumb = false,
}: BlogHeaderProps) {
  return (
    <section className="relative flex min-h-[310px] w-full items-center justify-center overflow-hidden bg-[#152741] px-5 py-16 text-white md:min-h-[390px]">
      {/* DECORATIVE BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-32 h-[380px] w-[380px] rounded-full border border-[#EFB059]/20 md:h-[550px] md:w-[550px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-[360px] w-[360px] rounded-full border border-white/10"
      />

      <div className="relative z-10 mx-auto flex max-w-[1050px] flex-col items-center gap-5 text-center">
        {showBreadcrumb && (
          <nav
            aria-label="Sayfa yolu"
            className="flex flex-wrap justify-center gap-2 text-[12px] text-white/70"
          >
            <Link
              href="/"
              className="hover:text-[#EFB059]"
            >
              Ana Sayfa
            </Link>

            <span>/</span>

            <Link
              href="/blog"
              className="hover:text-[#EFB059]"
            >
              Blog
            </Link>

            {category && (
              <>
                <span>/</span>
                <span className="text-[#EFB059]">
                  {category}
                </span>
              </>
            )}
          </nav>
        )}

        <div className="h-[3px] w-14 bg-[#EFB059]" />

        <h1 className="max-w-[920px] text-[27px] leading-[1.35] font-bold tracking-[0.02em] text-white sm:text-[36px] lg:text-[46px]">
          {title}
        </h1>

        {description && (
          <p className="max-w-[730px] text-[13px] leading-[1.8] text-[#D0D9E0] sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
