import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseAdminClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "언론에 비친 법인",
  description: "사단법인 외국인과 동행을 보도한 언론 기사·자료 모음입니다.",
};

type GalleryPressItem = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  article_url: string | null;
  taken_at: string | null;
  created_at: string;
};

async function getPublishedPressItems() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { items: [] as GalleryPressItem[], hasConfig: false };
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, title, description, image_url, article_url, taken_at, created_at")
    .eq("is_published", true)
    .eq("gallery_kind", "press")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (error || !data) {
    return { items: [] as GalleryPressItem[], hasConfig: true };
  }

  return { items: data as GalleryPressItem[], hasConfig: true };
}

function formatItemDate(takenAt: string | null, createdAt: string): string {
  const target = takenAt ?? createdAt;
  try {
    const date = new Date(target);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default async function PressGalleryPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { items, hasConfig } = await getPublishedPressItems();
  // 동적 렌더링 보장을 위해 searchParams 를 await (활동사진 페이지와 동일 패턴)
  await _searchParams;

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <header className="mb-12 max-w-2xl">
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Gallery · Press
          </p>
          <h1 className="mt-4 font-[var(--font-serif)] text-4xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-6xl">
            언론에 비친 법인
          </h1>
          <p className="mt-4 text-[15px] leading-[1.9] text-[var(--color-ink-soft)]">
            신문·방송·온라인 등 언론을 통해 소개된 외국인과 동행의 소식을 모았습니다.
          </p>
        </header>

        {!hasConfig && (
          <p className="mb-8 border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Supabase 환경변수가 설정되지 않아 자료를 불러올 수 없습니다.
          </p>
        )}

        {hasConfig && items.length === 0 ? (
          <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-12 text-center">
            <p className="font-[var(--font-serif)] text-2xl text-[var(--color-ink)]">
              아직 등록된 자료가 없습니다
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              관리자에서 언론 보도 자료를 등록하면 이곳에 표시됩니다.
            </p>
            <Link
              href="/admin/gallery/photos/new?kind=press"
              className="mt-6 inline-block text-xs text-[var(--color-terracotta)] underline"
            >
              언론 자료 등록 (관리자)
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const dateLabel = formatItemDate(item.taken_at, item.created_at);
              const articleHref = item.article_url?.trim() ?? "";
              const openInNewTab = articleHref.length > 0;
              const cardClassName =
                "group flex h-full flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] transition-all duration-300 hover:border-[var(--color-terracotta)] hover:shadow-[0_18px_40px_-18px_rgba(26,35,50,0.18)]";

              const cardInner = (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-ivory)]">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {dateLabel && (
                      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        {dateLabel}
                      </p>
                    )}
                    <h2 className="font-[var(--font-serif)] text-xl leading-snug text-[var(--color-ink)] underline decoration-transparent decoration-2 underline-offset-2 transition-colors group-hover:decoration-[var(--color-terracotta)] group-hover:text-[var(--color-terracotta)]">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </>
              );

              return (
                <li key={item.id} className="h-full">
                  {openInNewTab ? (
                    <a
                      href={articleHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClassName}
                    >
                      {cardInner}
                    </a>
                  ) : (
                    <Link href={`/gallery/press/${item.id}`} className={cardClassName}>
                      {cardInner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
