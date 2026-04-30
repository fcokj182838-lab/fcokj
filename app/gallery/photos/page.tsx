import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseAdminClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "활동사진",
  description: "사단법인 외국인과 동행의 활동사진 모음입니다.",
};

type GalleryPhoto = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  taken_at: string | null;
  created_at: string;
};

async function getPublishedPhotos() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { photos: [] as GalleryPhoto[], hasConfig: false };
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, title, description, image_url, taken_at, created_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (error || !data) {
    return { photos: [] as GalleryPhoto[], hasConfig: true };
  }

  return { photos: data as GalleryPhoto[], hasConfig: true };
}

/** 표시용 날짜 포맷 (촬영일 우선, 없으면 등록일) */
function formatPhotoDate(takenAt: string | null, createdAt: string): string {
  const target = takenAt ?? createdAt;
  try {
    const date = new Date(target);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default async function PhotosPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { photos, hasConfig } = await getPublishedPhotos();
  // 동적 렌더링 보장을 위해 searchParams 를 await (community 페이지와 동일 패턴)
  await _searchParams;

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        {/* 페이지 헤더 */}
        <header className="mb-12 max-w-2xl">
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Gallery · Photos
          </p>
          <h1 className="mt-4 font-[var(--font-serif)] text-4xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-6xl">
            활동사진
          </h1>
          <p className="mt-4 text-[15px] leading-[1.9] text-[var(--color-ink-soft)]">
            한국어 교실, 문화체험, 봉사활동 등 사단법인 외국인과 동행이 함께한 순간들을 모았습니다.
          </p>
        </header>

        {!hasConfig && (
          <p className="mb-8 border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Supabase 환경변수가 설정되지 않아 사진을 불러올 수 없습니다.
          </p>
        )}

        {hasConfig && photos.length === 0 ? (
          <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-12 text-center">
            <p className="font-[var(--font-serif)] text-2xl text-[var(--color-ink)]">
              아직 등록된 사진이 없습니다
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              곧 다양한 활동의 순간들을 만나보실 수 있습니다.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-block text-xs text-[var(--color-terracotta)] underline"
            >
              관리자로 이동
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const dateLabel = formatPhotoDate(photo.taken_at, photo.created_at);
              return (
                <li
                  key={photo.id}
                  className="group flex flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] transition-all duration-300 hover:border-[var(--color-terracotta)] hover:shadow-[0_18px_40px_-18px_rgba(26,35,50,0.18)]"
                >
                  {/* 카드 이미지 */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-ivory)]">
                    <Image
                      src={photo.image_url}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>

                  {/* 카드 본문 */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {dateLabel && (
                      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        {dateLabel}
                      </p>
                    )}
                    <h2 className="font-[var(--font-serif)] text-xl leading-snug text-[var(--color-ink)]">
                      {photo.title}
                    </h2>
                    {photo.description && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
